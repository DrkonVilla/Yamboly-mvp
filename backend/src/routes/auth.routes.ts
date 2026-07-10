import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticate, getProfile);

export default router;