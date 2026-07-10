import { Router } from 'express';
import { downloadOrdersReport, downloadInventoryReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.get('/orders', authenticate, requireRole(['admin']), downloadOrdersReport);
router.get('/inventory', authenticate, requireRole(['admin']), downloadInventoryReport);

export default router;