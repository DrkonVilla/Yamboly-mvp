import { Router } from 'express';
import { getAllClients, createClient, updateClient, deleteClient } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Todas las rutas de usuario en admin requieren autenticación y permisos de admin/ejecutivo
router.use(authenticate);
router.use(requireRole(['admin', 'ejecutivo']));

router.get('/clients', getAllClients);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

export default router;
