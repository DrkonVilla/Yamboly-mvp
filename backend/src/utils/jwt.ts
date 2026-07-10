import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (userId: number, email: string, rol: string) => {
  return jwt.sign({ id: userId, email, rol }, env.JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { id: number; email: string; rol: string };
  } catch {
    return null;
  }
};