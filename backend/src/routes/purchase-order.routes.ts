import { Router } from 'express';
import * as purchaseOrderController from '../controllers/purchase-order.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['admin', 'ejecutivo']), purchaseOrderController.getPurchaseOrders);
router.get('/:id', requireRole(['admin', 'ejecutivo']), purchaseOrderController.getPurchaseOrderById);
router.post('/', requireRole(['admin']), purchaseOrderController.createPurchaseOrder);
router.patch('/:id/status', requireRole(['admin']), purchaseOrderController.updatePurchaseOrderStatus);

export default router;
