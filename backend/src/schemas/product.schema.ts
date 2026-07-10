import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(3, 'SKU muy corto').regex(/^[a-zA-Z0-9-]+$/, 'SKU solo alfanumérico y guiones'),
  nombre: z.string().min(3, 'Nombre muy corto'),
  descripcion_corta: z.string().min(5, 'Descripción corta muy breve'),
  descripcion_larga: z.string().optional(),
  precio_venta: z.number().positive('Precio debe ser mayor a 0'),
  precio_oferta: z.number().positive().optional(),
  categoria_id: z.number().int().positive('Categoría inválida'),
  stock: z.number().int().min(0, 'Stock no puede ser negativo').default(0),
  stock_minimo: z.number().int().min(0).default(5),
  imagen_url: z.string().url('URL de imagen inválida').optional(),
  activo: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.number().int().positive(),
});

export const productFiltersSchema = z.object({
  categoria_id: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  search: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 12),
  sort: z.enum(['nombre', 'precio_venta', 'created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});