import { z } from 'zod';

export const createStockMovementSchema = z.object({
  producto_id: z.number().int().positive('Producto inválido'),
  tipo: z.enum(['entrada_compra', 'salida_venta', 'ajuste_manual']),
  cantidad: z.number().int().min(1, 'La cantidad debe ser mayor a 0 (el signo lo da el tipo)'),
  referencia_id: z.number().int().optional(),
  referencia_tipo: z.string().optional(),
  usuario_id: z.number().int().optional(),
});

export const stockMovementFiltersSchema = z.object({
  producto_id: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  tipo: z.enum(['entrada_compra', 'salida_venta', 'ajuste_manual']).optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sort: z.enum(['created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
