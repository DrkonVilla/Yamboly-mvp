import { Router } from 'express';
import * as stockController from '../controllers/stock.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['admin', 'ejecutivo']), stockController.getStockMovements);
router.post('/', requireRole(['admin']), stockController.createStockMovement);

export default router;
