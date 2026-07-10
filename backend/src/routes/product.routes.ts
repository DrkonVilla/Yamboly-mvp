import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/low-stock', authenticate, requireRole(['admin']), getLowStockProducts);
router.get('/sku/:sku', getProductBySku);
router.get('/:id', getProductById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, requireRole(['admin']), createProduct);
router.put('/:id', authenticate, requireRole(['admin']), updateProduct);
router.delete('/:id', authenticate, requireRole(['admin']), deleteProduct);

export default router;