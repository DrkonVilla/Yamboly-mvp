import { prisma } from '../config/db';

export const getAllSuppliers = async (includeInactive: boolean = false) => {
  return prisma.proveedor.findMany({
    where: includeInactive ? {} : { activo: true },
    orderBy: { nombre: 'asc' },
  });
};

export const getSupplierById = async (id: number) => {
  return prisma.proveedor.findUnique({
    where: { id },
    include: {
      insumos: true,
    },
  });
};

export const createSupplier = async (data: {
  ruc: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  activo?: boolean;
}) => {
  return prisma.proveedor.create({
    data,
  });
};

export const updateSupplier = async (
  id: number,
  data: Partial<{
    ruc: string;
    nombre: string;
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
    activo: boolean;
  }>
) => {
  return prisma.proveedor.update({
    where: { id },
    data,
  });
};

export const deleteSupplier = async (id: number) => {
  // Soft delete by setting activo to false
  return prisma.proveedor.update({
    where: { id },
    data: { activo: false },
  });
};
