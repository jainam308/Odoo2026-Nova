import { apiClient } from './client';

// ─── Types ───────────────────────────────────────
export interface CommunityPost {
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
  user_liked?: boolean;
  comments?: PostComment[];
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_photo: string | null;
}

export interface CreatePostInput {
  title: string;
  content: string;
  category?: string;
  trip_id?: number | null;
  image_url?: string | null;
}

// ─── API Functions ───────────────────────────────

/**
 * GET /api/community - Fetch community posts with optional filters
 */
export const fetchCommunityPosts = async (params?: {
  search?: string;
  category?: string;
  sort?: string;
  group_by?: string;
}): Promise<CommunityPost[]> => {
  try {
    const res = await apiClient.get('/community', { params });
    if (res.data?.data) {
      // If grouped, flatten for display (the data could be an object of arrays)
      if (params?.group_by && typeof res.data.data === 'object' && !Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return res.data.data;
    }
    return [];
  } catch (err) {
    console.error('Error fetching community posts:', err);
    return [];
  }
};

/**
 * GET /api/community/:id - Fetch single post with comments
 */
export const getPostById = async (id: number): Promise<CommunityPost | null> => {
  try {
    const res = await apiClient.get(`/community/${id}`);
    return res.data?.data || null;
  } catch (err) {
    console.error(`Error fetching post ${id}:`, err);
    return null;
  }
};

/**
 * POST /api/community - Create a new community post
 */
export const createCommunityPost = async (data: CreatePostInput): Promise<CommunityPost> => {
  const res = await apiClient.post('/community', data);
  if (res.data?.data) {
    return res.data.data;
  }
  throw new Error('Failed to create post');
};

/**
 * PUT /api/community/:id - Update a post
 */
export const updateCommunityPost = async (id: number, data: Partial<CreatePostInput>): Promise<CommunityPost | null> => {
  try {
    const res = await apiClient.put(`/community/${id}`, data);
    return res.data?.data || null;
  } catch (err) {
    console.error(`Error updating post ${id}:`, err);
    return null;
  }
};

/**
 * DELETE /api/community/:id - Delete a post
 */
export const deleteCommunityPost = async (id: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/community/${id}`);
    return true;
  } catch (err) {
    console.error(`Error deleting post ${id}:`, err);
    return false;
  }
};

/**
 * POST /api/community/:id/comments - Add a comment
 */
export const addCommentToPost = async (postId: number, content: string): Promise<PostComment | null> => {
  try {
    const res = await apiClient.post(`/community/${postId}/comments`, { content });
    return res.data?.data || null;
  } catch (err) {
    console.error(`Error adding comment to post ${postId}:`, err);
    return null;
  }
};

/**
 * DELETE /api/community/:id/comments/:commentId - Delete a comment
 */
export const deleteCommentFromPost = async (postId: number, commentId: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/community/${postId}/comments/${commentId}`);
    return true;
  } catch (err) {
    console.error(`Error deleting comment ${commentId}:`, err);
    return false;
  }
};

/**
 * POST /api/community/:id/like - Toggle like on a post
 */
export const togglePostLike = async (postId: number): Promise<{ liked: boolean; likes_count: number }> => {
  const res = await apiClient.post(`/community/${postId}/like`);
  return {
    liked: res.data?.liked ?? false,
    likes_count: res.data?.likes_count ?? 0,
  };
};
