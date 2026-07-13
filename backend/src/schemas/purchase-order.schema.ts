import { z } from 'zod';

const itemsOrdenCompraSchema = z.object({
  insumo_id: z.number().int().positive('Insumo inválido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().positive('El precio debe ser mayor a 0'),
});

export const createPurchaseOrderSchema = z.object({
  proveedor_id: z.number().int().positive('Proveedor inválido'),
  usuario_id: z.number().int().positive('Usuario inválido').optional(), // Se puede tomar del token si hay auth
  fecha_entrega: z.string().datetime().optional(),
  items: z.array(itemsOrdenCompraSchema).min(1, 'Debe haber al menos un ítem'),
});

export const updatePurchaseOrderStatusSchema = z.object({
  estado: z.enum(['pendiente', 'aprobada', 'recibida', 'cancelada']),
});

export const purchaseOrderFiltersSchema = z.object({
  proveedor_id: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  estado: z.enum(['pendiente', 'aprobada', 'recibida', 'cancelada']).optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sort: z.enum(['created_at', 'total']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
