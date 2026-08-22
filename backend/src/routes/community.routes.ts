import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike,
} from '../modules/community/community.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes (optionalAuth so we know if user liked)
router.get('/', optionalAuthMiddleware, getPosts);
router.get('/:id', optionalAuthMiddleware, getPostById);

// Protected routes (require auth)
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

// Comments
router.post('/:id/comments', authMiddleware, addComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

// Likes
router.post('/:id/like', authMiddleware, toggleLike);

export default router;
