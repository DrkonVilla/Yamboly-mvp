import { prisma } from '../config/db';

export const getAllCategories = async (includeInactive = false) => {
  return prisma.categoria.findMany({
    where: includeInactive ? {} : { activo: true },
    orderBy: { nombre: 'asc' },
    include: {
      _count: { select: { productos: true } },
    },
  });
};

export const getCategoryById = async (id: number) => {
  return prisma.categoria.findUnique({
    where: { id },
    include: {
      productos: {
        where: { activo: true },
        select: { id: true, nombre: true, sku: true, precio_venta: true },
      },
    },
  });
};

export const createCategory = async (data: { nombre: string; descripcion?: string }) => {
  return prisma.categoria.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
    },
  });
};

export const updateCategory = async (id: number, data: { nombre?: string; descripcion?: string; activo?: boolean }) => {
  return prisma.categoria.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: number) => {
  // Eliminación lógica
  return prisma.categoria.update({
    where: { id },
    data: { activo: false },
  });
};