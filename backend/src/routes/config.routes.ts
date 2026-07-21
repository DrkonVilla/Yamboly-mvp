import { Router } from 'express';
import { getAllConfigs, updateConfig } from '../controllers/config.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Protegido por roles
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/', getAllConfigs);
router.put('/:clave', updateConfig);

export default router;
