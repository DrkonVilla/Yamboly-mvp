import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

interface ProductFilters {
  categoria_id?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const getProducts = async (filters: ProductFilters) => {
  const { categoria_id, search, minPrice, maxPrice, page = 1, limit = 12, sort = 'created_at', order = 'desc' } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(categoria_id && { categoria_id }),
    ...(search && {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { descripcion_corta: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(minPrice !== undefined && { precio_venta: { gte: minPrice } }),
    ...(maxPrice !== undefined && { precio_venta: { lte: maxPrice } }),
  };

  const [data, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: { select: { id: true, nombre: true } } },
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.producto.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getProductById = async (id: number) => {
  return prisma.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
};

export const getProductBySku = async (sku: string) => {
  return prisma.producto.findUnique({
    where: { sku },
    include: { categoria: true },
  });
};

export const createProduct = async (data: any) => {
  const category = await prisma.categoria.findUnique({ where: { id: data.categoria_id } });
  if (!category) throw new Error('Categoría no encontrada');

  const existing = await prisma.producto.findUnique({ where: { sku: data.sku } });
  if (existing) throw new Error('El SKU ya existe');

  return prisma.producto.create({
    data: {
      sku: data.sku,
      nombre: data.nombre,
      descripcion_corta: data.descripcion_corta,
      descripcion_larga: data.descripcion_larga,
      precio_venta: data.precio_venta,
      precio_oferta: data.precio_oferta,
      categoria_id: data.categoria_id,
      stock: data.stock || 0,
      stock_minimo: data.stock_minimo || 5,
      imagen_url: data.imagen_url || `https://picsum.photos/seed/${data.sku}/300/300`,
      activo: data.activo ?? true,
    },
    include: { categoria: true },
  });
};

export const updateProduct = async (id: number, data: any) => {
  const product = await prisma.producto.findUnique({ where: { id } });
  if (!product) throw new Error('Producto no encontrado');

  if (data.sku && data.sku !== product.sku) {
    const existing = await prisma.producto.findUnique({ where: { sku: data.sku } });
    if (existing) throw new Error('El SKU ya está en uso');
  }

  return prisma.producto.update({
    where: { id },
    data: {
      sku: data.sku,
      nombre: data.nombre,
      descripcion_corta: data.descripcion_corta,
      descripcion_larga: data.descripcion_larga,
      precio_venta: data.precio_venta,
      precio_oferta: data.precio_oferta,
      categoria_id: data.categoria_id,
      stock: data.stock,
      stock_minimo: data.stock_minimo,
      imagen_url: data.imagen_url,
      activo: data.activo,
    },
    include: { categoria: true },
  });
};

export const deleteProduct = async (id: number) => {
  return prisma.producto.update({ where: { id }, data: { activo: false } });
};

export const getProductsWithLowStock = async () => {
  return prisma.producto.findMany({
    where: { activo: true, stock: { lte: prisma.producto.fields.stock_minimo } },
    orderBy: { stock: 'asc' },
  });
};