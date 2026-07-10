import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Rutas públicas
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, requireRole(['admin']), createCategory);
router.put('/:id', authenticate, requireRole(['admin']), updateCategory);
router.delete('/:id', authenticate, requireRole(['admin']), deleteCategory);

export default router;