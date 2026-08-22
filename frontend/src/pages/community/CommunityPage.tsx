import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  X,
  Clock,
  Tag,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import {
  fetchCommunityPosts,
  createCommunityPost,
  togglePostLike,
  addCommentToPost,
  deleteCommunityPost,
  deleteCommentFromPost,
  getPostById,
} from '../../api/community.api';
import type { CommunityPost, CreatePostInput } from '../../api/community.api';
import { useAuth } from '../../context/AuthContext';

// ─── Category Config ─────────────────────────────
const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '🌍' },
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'trip-review', label: 'Trip Review', icon: '✈️' },
  { value: 'food', label: 'Food & Dining', icon: '🍜' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'tips', label: 'Travel Tips', icon: '💡' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'oldest', label: 'Oldest First' },
];

const GROUP_OPTIONS = [
  { value: '', label: 'No Grouping' },
  { value: 'category', label: 'By Category' },
  { value: 'user', label: 'By Author' },
];

function categoryBadge(cat: string) {
  const found = CATEGORIES.find((c) => c.value === cat);
  return found ? `${found.icon} ${found.label}` : `💬 ${cat}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Create Post Modal ──────────────────────────
function CreatePostModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: CreatePostInput) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), content: content.trim(), category });
      onClose();
    } catch {
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Share Your Experience</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My amazing trip to Goa 🏖️"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-2 focus:ring-[#0F6E6E]/20 outline-none text-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-2 focus:ring-[#0F6E6E]/20 outline-none text-sm transition-all bg-white"
            >
              {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Experience</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your travel story, tips, or recommendations..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-2 focus:ring-[#0F6E6E]/20 outline-none text-sm transition-all resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F6E6E] text-white text-sm font-bold hover:bg-[#0B5656] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? 'Posting...' : '✨ Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Post Detail Modal ──────────────────────────
function PostDetailModal({
  post,
  onClose,
  onLike,
  onComment,
  onDeleteComment,
  onDeletePost,
  currentUserId,
}: {
  post: CommunityPost;
  onClose: () => void;
  onLike: (id: number) => void;
  onComment: (postId: number, content: string) => Promise<void>;
  onDeleteComment: (postId: number, commentId: number) => void;
  onDeletePost: (id: number) => void;
  currentUserId?: number;
}) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F6E6E] to-[#2B8A8A] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.author_name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeAgo(post.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUserId === post.user_id && (
              <button
                onClick={() => { onDeletePost(post.id); onClose(); }}
                className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <span className="inline-block px-2.5 py-1 rounded-full bg-[#0F6E6E]/10 text-[#0F6E6E] text-xs font-semibold mb-3">
            {categoryBadge(post.category)}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.trip_name && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[#FF7A59] font-medium">
              <MapPin className="h-3.5 w-3.5" />
              Linked to trip: {post.trip_name}
            </div>
          )}

          {/* Like & Comment Bar */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                post.user_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-red-500' : ''}`} />
              {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle className="h-4 w-4" />
              {post.comments_count} {post.comments_count === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-100 px-6 py-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Comments</h3>

          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0 mt-0.5">
                    {c.author_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-800">{c.author_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                        {currentUserId === c.user_id && (
                          <button
                            onClick={() => onDeleteComment(post.id, c.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-red-400 transition-all"
                            title="Delete comment"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-4 italic">No comments yet. Be the first to comment!</p>
          )}

          {/* Comment Input */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E]/20 outline-none text-sm transition-all"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#0F6E6E] text-white hover:bg-[#0B5656] transition-all disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ───────────────────────────────────
function PostCard({
  post,
  onOpen,
  onLike,
  currentUserId: _currentUserId,
}: {
  post: CommunityPost;
  onOpen: (post: CommunityPost) => void;
  onLike: (id: number) => void;
  currentUserId?: number;
}) {
  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#0F6E6E]/30 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => onOpen(post)}
    >
      <div className="p-5">
        {/* Author Row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6E6E] to-[#2B8A8A] flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
            {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{post.author_name}</p>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeAgo(post.created_at)}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#0F6E6E]/8 text-[#0F6E6E] text-[11px] font-semibold flex-shrink-0">
            {categoryBadge(post.category)}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-[#0F6E6E] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
          {post.content}
        </p>

        {post.trip_name && (
          <div className="flex items-center gap-1.5 text-xs text-[#FF7A59] font-medium mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {post.trip_name}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                post.user_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${post.user_liked ? 'fill-red-500' : ''}`} />
              {post.likes_count}
            </button>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.comments_count}
            </span>
          </div>
          <span className="text-xs text-[#0F6E6E] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read more →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Dropdown Component ──────────────────────────
function Dropdown({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-[#0F6E6E]/40 hover:text-[#0F6E6E] transition-all"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}:</span>
        <span className="font-semibold text-gray-800">{selected?.label || label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 min-w-[160px]">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                  value === opt.value
                    ? 'bg-[#0F6E6E]/8 text-[#0F6E6E] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Community Page ─────────────────────────
export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groupedPosts, setGroupedPosts] = useState<Record<string, CommunityPost[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [groupBy, setGroupBy] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // ── Fetch Posts ─────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'all') params.category = category;
      if (sort) params.sort = sort;
      if (groupBy) params.group_by = groupBy;

      const res = await fetchCommunityPosts(params);

      if (groupBy && res && typeof res === 'object' && !Array.isArray(res)) {
        setGroupedPosts(res as unknown as Record<string, CommunityPost[]>);
        setPosts([]);
      } else {
        setPosts(Array.isArray(res) ? res : []);
        setGroupedPosts(null);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, groupBy]);

  useEffect(() => {
    const debounce = setTimeout(loadPosts, 300);
    return () => clearTimeout(debounce);
  }, [loadPosts]);

  // ── Actions ────────────────────────────────
  const handleCreatePost = async (data: CreatePostInput) => {
    await createCommunityPost(data);
    loadPosts();
  };

  const handleLike = async (postId: number) => {
    if (!user) {
      alert('Please login to like posts');
      return;
    }
    try {
      const result = await togglePostLike(postId);
      // Update local state
      const updatePost = (p: CommunityPost) =>
        p.id === postId ? { ...p, likes_count: result.likes_count, user_liked: result.liked } : p;

      setPosts((prev) => prev.map(updatePost));
      if (groupedPosts) {
        const updated: Record<string, CommunityPost[]> = {};
        for (const [key, group] of Object.entries(groupedPosts)) {
          updated[key] = group.map(updatePost);
        }
        setGroupedPosts(updated);
      }
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => prev ? { ...prev, likes_count: result.likes_count, user_liked: result.liked } : null);
      }
    } catch {
      alert('Failed to like post');
    }
  };

  const handleComment = async (postId: number, content: string) => {
    if (!user) {
      alert('Please login to comment');
      return;
    }
    const comment = await addCommentToPost(postId, content);
    if (comment && selectedPost) {
      setSelectedPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), comment],
          comments_count: prev.comments_count + 1,
        };
      });
      // Also update list
      const updateCounts = (p: CommunityPost) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p;
      setPosts((prev) => prev.map(updateCounts));
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    const ok = await deleteCommentFromPost(postId, commentId);
    if (ok && selectedPost) {
      setSelectedPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: (prev.comments || []).filter((c) => c.id !== commentId),
          comments_count: Math.max(prev.comments_count - 1, 0),
        };
      });
      const updateCounts = (p: CommunityPost) =>
        p.id === postId ? { ...p, comments_count: Math.max(p.comments_count - 1, 0) } : p;
      setPosts((prev) => prev.map(updateCounts));
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const ok = await deleteCommunityPost(postId);
    if (ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (groupedPosts) {
        const updated: Record<string, CommunityPost[]> = {};
        for (const [key, group] of Object.entries(groupedPosts)) {
          updated[key] = group.filter((p) => p.id !== postId);
        }
        setGroupedPosts(updated);
      }
    }
  };

  const openPostDetail = async (post: CommunityPost) => {
    const full = await getPostById(post.id);
    setSelectedPost(full || post);
  };

  // ── Render ─────────────────────────────────
  const allPosts = groupedPosts
    ? Object.values(groupedPosts).flat()
    : posts;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          🌍 Community
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Share your travel experiences, discover stories from fellow travelers, and get inspired for your next adventure.
        </p>
      </div>

      {/* ── Toolbar (Search + Filters) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-2 focus:ring-[#0F6E6E]/20 outline-none text-sm transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Dropdown
            label="Group"
            icon={LayoutGrid}
            options={GROUP_OPTIONS}
            value={groupBy}
            onChange={setGroupBy}
          />
          <Dropdown
            label="Filter"
            icon={Filter}
            options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            value={category}
            onChange={setCategory}
          />
          <Dropdown
            label="Sort"
            icon={ArrowUpDown}
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>

      {/* ── Posts Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 rounded-full w-24 mb-1.5" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-16" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded-full w-full mb-1.5" />
              <div className="h-3 bg-gray-100 rounded-full w-2/3" />
            </div>
          ))}
        </div>
      ) : allPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No posts yet</h3>
          <p className="text-gray-400 text-sm mb-6">Be the first to share your travel experience!</p>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0F6E6E] text-white text-sm font-bold hover:bg-[#0B5656] transition-all shadow-sm"
            >
              ✨ Share Your Experience
            </button>
          )}
        </div>
      ) : groupedPosts ? (
        // Grouped View
        <div className="space-y-8">
          {Object.entries(groupedPosts).map(([groupKey, groupPosts]) => (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-[#0F6E6E]" />
                <h2 className="text-lg font-bold text-gray-800 capitalize">{groupKey}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {groupPosts.length} {groupPosts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpen={openPostDetail}
                    onLike={handleLike}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Normal Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpen={openPostDetail}
              onLike={handleLike}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* ── Floating Create Button ── */}
      {user && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-[#0F6E6E] text-white font-bold text-sm shadow-2xl hover:bg-[#0B5656] hover:scale-105 transition-all duration-300 ring-4 ring-white"
          title="Share your experience"
        >
          <Plus className="h-5 w-5" />
          <span className="drop-shadow-sm">New Post</span>
        </button>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreate={handleCreatePost} />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onComment={handleComment}
          onDeleteComment={handleDeleteComment}
          onDeletePost={handleDeletePost}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}
