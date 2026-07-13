import { Router } from 'express';
import { getAll, getById, create, update, remove, updateStock } from '../controllers/supply.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { validate } from '../middleware/validation';
import { createSupplySchema, updateSupplySchema, adjustStockSchema } from '../schemas/supply.schema';

const router = Router();

// Todas las rutas de insumos requieren autenticación
router.use(authenticate);

router.get('/', requireRole(['admin', 'ejecutivo']), getAll);
router.get('/:id', requireRole(['admin', 'ejecutivo']), getById);

router.post('/', requireRole(['admin', 'ejecutivo']), validate(createSupplySchema), create);
router.put('/:id', requireRole(['admin', 'ejecutivo']), validate(updateSupplySchema), update);
router.put('/:id/stock', requireRole(['admin', 'ejecutivo']), validate(adjustStockSchema), updateStock);
router.delete('/:id', requireRole(['admin', 'ejecutivo']), remove);

export default router;
