import { Request, Response } from 'express';
import db from '../../db';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';

// ─── Types ───────────────────────────────────────────
interface CommunityPost {
  id: number;
  user_id: number;
  trip_id: number | null;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_photo: string | null;
  trip_name?: string | null;
}

interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_photo: string | null;
}

// ─── GET /api/community ───────────────────────────────
// Query params: ?search=, ?category=, ?sort=latest|popular|oldest, ?group_by=category|user
export async function getPosts(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, sort, group_by } = req.query;

    let whereClause = '';
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(cp.title ILIKE $${params.length} OR cp.content ILIKE $${params.length})`);
    }

    if (category && typeof category === 'string' && category !== 'all') {
      params.push(category);
      conditions.push(`cp.category = $${params.length}`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    let orderClause = 'ORDER BY cp.created_at DESC'; // default: latest
    if (sort === 'popular') {
      orderClause = 'ORDER BY cp.likes_count DESC, cp.comments_count DESC';
    } else if (sort === 'oldest') {
      orderClause = 'ORDER BY cp.created_at ASC';
    }

    const query = `
      SELECT 
        cp.*,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS author_name,
        u.photo_url AS author_photo,
        t.name AS trip_name
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN trips t ON cp.trip_id = t.id
      ${whereClause}
      ${orderClause}
      LIMIT 100
    `;

    const result = await db.query<CommunityPost>(query, params);
    let data: CommunityPost[] | Record<string, CommunityPost[]> = result.rows;

    // Group by support
    if (group_by === 'category') {
      const grouped: Record<string, CommunityPost[]> = {};
      for (const post of result.rows) {
        const key = post.category || 'general';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(post);
      }
      data = grouped;
    } else if (group_by === 'user') {
      const grouped: Record<string, CommunityPost[]> = {};
      for (const post of result.rows) {
        const key = post.author_name?.trim() || 'Unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(post);
      }
      data = grouped;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching community posts:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch community posts' });
  }
}

// ─── GET /api/community/:id ──────────────────────────
export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const postResult = await db.query<CommunityPost>(
      `SELECT 
        cp.*,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS author_name,
        u.photo_url AS author_photo,
        t.name AS trip_name
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN trips t ON cp.trip_id = t.id
      WHERE cp.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const commentsResult = await db.query<PostComment>(
      `SELECT 
        pc.*,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS author_name,
        u.photo_url AS author_photo
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC`,
      [id]
    );

    // Check if the requesting user liked this post
    const authReq = req as AuthenticatedRequest;
    let user_liked = false;
    if (authReq.user?.id) {
      const likeResult = await db.query(
        'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [id, authReq.user.id]
      );
      user_liked = likeResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...postResult.rows[0],
        comments: commentsResult.rows,
        user_liked,
      },
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
}

// ─── POST /api/community ─────────────────────────────
export async function createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { title, content, category, trip_id, image_url } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, error: 'Title and content are required' });
      return;
    }

    const result = await db.query<CommunityPost>(
      `INSERT INTO community_posts (user_id, trip_id, title, content, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, trip_id || null, title, content, category || 'general', image_url || null]
    );

    // Fetch full post with author info
    const fullPost = await db.query<CommunityPost>(
      `SELECT 
        cp.*,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS author_name,
        u.photo_url AS author_photo
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ success: true, data: fullPost.rows[0] });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
}

// ─── PUT /api/community/:id ──────────────────────────
export async function updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { title, content, category, image_url } = req.body;

    // Verify ownership
    const existing = await db.query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    if (existing.rows[0].user_id !== req.user.id) {
      res.status(403).json({ success: false, error: 'You can only edit your own posts' });
      return;
    }

    const result = await db.query<CommunityPost>(
      `UPDATE community_posts
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           category = COALESCE($3, category),
           image_url = COALESCE($4, image_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, content, category, image_url, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ success: false, error: 'Failed to update post' });
  }
}

// ─── DELETE /api/community/:id ───────────────────────
export async function deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const existing = await db.query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    if (existing.rows[0].user_id !== req.user.id) {
      res.status(403).json({ success: false, error: 'You can only delete your own posts' });
      return;
    }

    await db.query('DELETE FROM community_posts WHERE id = $1', [id]);
    res.json({ success: true, deleted: true });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
}

// ─── POST /api/community/:id/comments ────────────────
export async function addComment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, error: 'Comment content is required' });
      return;
    }

    // Verify post exists
    const postCheck = await db.query('SELECT id FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const result = await db.query<PostComment>(
      `INSERT INTO post_comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.id, content.trim()]
    );

    // Update comments_count
    await db.query(
      'UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1',
      [id]
    );

    // Fetch with author info
    const fullComment = await db.query<PostComment>(
      `SELECT 
        pc.*,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS author_name,
        u.photo_url AS author_photo
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ success: true, data: fullComment.rows[0] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
}

// ─── DELETE /api/community/:id/comments/:commentId ───
export async function deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id, commentId } = req.params;

    const existing = await db.query(
      'SELECT user_id FROM post_comments WHERE id = $1 AND post_id = $2',
      [commentId, id]
    );
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }
    if (existing.rows[0].user_id !== req.user.id) {
      res.status(403).json({ success: false, error: 'You can only delete your own comments' });
      return;
    }

    await db.query('DELETE FROM post_comments WHERE id = $1', [commentId]);
    await db.query(
      'UPDATE community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1',
      [id]
    );

    res.json({ success: true, deleted: true });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
}

// ─── POST /api/community/:id/like ────────────────────
export async function toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    // Check if post exists
    const postCheck = await db.query('SELECT id FROM community_posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    // Check if already liked
    const existingLike = await db.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    let liked: boolean;
    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, req.user.id]);
      await db.query(
        'UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
        [id]
      );
      liked = false;
    } else {
      // Like
      await db.query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [id, req.user.id]
      );
      await db.query(
        'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1',
        [id]
      );
      liked = true;
    }

    // Get updated count
    const updated = await db.query<{ likes_count: number }>(
      'SELECT likes_count FROM community_posts WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      liked,
      likes_count: updated.rows[0]?.likes_count ?? 0,
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
}
