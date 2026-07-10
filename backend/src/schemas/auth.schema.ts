import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Nombre muy corto'),
  apellido: z.string().min(2, 'Apellido muy corto'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});