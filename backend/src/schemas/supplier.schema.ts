import { z } from 'zod';

export const createSupplierSchema = z.object({
  ruc: z.string().length(11, 'RUC debe tener exactamente 11 dígitos').regex(/^\d+$/, 'RUC solo debe contener números'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  contacto: z.string().min(2, 'El nombre de contacto es obligatorio'),
  telefono: z.string().min(6, 'Teléfono inválido'),
  email: z.string().email('Dirección de correo electrónico inválida'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  activo: z.boolean().default(true),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  id: z.number().int().positive().optional(),
});
