import { z } from 'zod';

export const createSupplySchema = z.object({
  proveedor_id: z.number().int().positive('Proveedor ID inválido'),
  nombre: z.string().min(3, 'El nombre del insumo debe tener al menos 3 caracteres'),
  descripcion: z.string().optional().nullable(),
  unidad_medida: z.string().min(1, 'La unidad de medida es obligatoria'),
  precio_unit: z.number().nonnegative('El precio unitario no puede ser negativo'),
  stock_actual: z.number().nonnegative('El stock actual no puede ser negativo').default(0),
  stock_minimo: z.number().nonnegative('El stock mínimo no puede ser negativo').default(0),
  activo: z.boolean().default(true),
});

export const updateSupplySchema = createSupplySchema.partial().extend({
  id: z.number().int().positive().optional(),
});

export const adjustStockSchema = z.object({
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  tipo: z.enum(['ingreso', 'egreso']),
  motivo: z.string().min(3, 'El motivo de ajuste es obligatorio'),
});
