import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      producto_id: z.number().int().positive(),
      cantidad: z.number().int().min(1),
      precio_unitario: z.number().positive(),
    })
  ).min(1, 'El carrito está vacío'),
  direccion_envio: z.string().min(5, 'La dirección es requerida'),
  metodo_pago: z.string().min(1, 'Método de pago requerido'),
  canal: z.enum(['web', 'rappi', 'tottus', 'tambo', 'tiktok']).default('web'),
});