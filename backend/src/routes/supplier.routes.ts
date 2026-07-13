import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/supplier.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { validate } from '../middleware/validation';
import { createSupplierSchema, updateSupplierSchema } from '../schemas/supplier.schema';

const router = Router();

// Todas las rutas de proveedores requieren inicio de sesión
router.use(authenticate);

// Permite consultar a admin y ejecutivo
router.get('/', requireRole(['admin', 'ejecutivo']), getAll);
router.get('/:id', requireRole(['admin', 'ejecutivo']), getById);

// Modificaciones requieren rol administrativo
router.post('/', requireRole(['admin', 'ejecutivo']), validate(createSupplierSchema), create);
router.put('/:id', requireRole(['admin', 'ejecutivo']), validate(updateSupplierSchema), update);
router.delete('/:id', requireRole(['admin', 'ejecutivo']), remove);

export default router;
