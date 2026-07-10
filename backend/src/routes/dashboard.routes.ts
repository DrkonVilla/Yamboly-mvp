import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.get('/', authenticate, requireRole(['admin']), getDashboardStats);

export default router;