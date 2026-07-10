import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Rutas protegidas (usuario autenticado)
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/my-orders/:id', authenticate, getOrder);

// Rutas de administración (solo admin)
router.get('/', authenticate, requireRole(['admin']), getAllOrdersAdmin);
router.put('/:id/status', authenticate, requireRole(['admin']), updateOrderStatusAdmin);

export default router;