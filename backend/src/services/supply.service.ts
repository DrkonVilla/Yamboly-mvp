import { prisma } from '../config/db';

export const getAllSupplies = async (filters?: { proveedor_id?: number; search?: string }) => {
  const where: any = {};
  
  if (filters?.proveedor_id) {
    where.proveedor_id = filters.proveedor_id;
  }
  
  if (filters?.search) {
    where.nombre = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  return prisma.insumo.findMany({
    where,
    orderBy: { nombre: 'asc' },
    include: {
      proveedor: {
        select: { id: true, nombre: true, contacto: true },
      },
    },
  });
};

export const getSupplyById = async (id: number) => {
  return prisma.insumo.findUnique({
    where: { id },
    include: {
      proveedor: true,
      movimientos: {
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  });
};

export const createSupply = async (data: {
  proveedor_id: number;
  nombre: string;
  descripcion?: string | null;
  unidad_medida: string;
  precio_unit: number;
  stock_actual?: number;
  stock_minimo?: number;
  activo?: boolean;
}) => {
  return prisma.insumo.create({
    data,
    include: {
      proveedor: true,
    },
  });
};

export const updateSupply = async (
  id: number,
  data: Partial<{
    proveedor_id: number;
    nombre: string;
    descripcion: string | null;
    unidad_medida: string;
    precio_unit: number;
    stock_actual: number;
    stock_minimo: number;
    activo: boolean;
  }>
) => {
  return prisma.insumo.update({
    where: { id },
    data,
    include: {
      proveedor: true,
    },
  });
};

export const deleteSupply = async (id: number) => {
  // Soft delete by setting active status to false
  return prisma.insumo.update({
    where: { id },
    data: { activo: false },
  });
};

export const adjustStock = async (
  id: number,
  data: {
    cantidad: number;
    tipo: 'ingreso' | 'egreso';
    motivo: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Obtener insumo actual
    const insumo = await tx.insumo.findUnique({ where: { id } });
    if (!insumo) {
      throw new Error('Insumo no encontrado');
    }

    // 2. Calcular nuevo stock
    const diferencia = data.tipo === 'ingreso' ? data.cantidad : -data.cantidad;
    const nuevoStock = insumo.stock_actual + diferencia;

    if (nuevoStock < 0) {
      throw new Error(`Operación inválida: El stock resultante sería negativo (${nuevoStock})`);
    }

    // 3. Crear movimiento de stock
    await tx.movimientoInsumo.create({
      data: {
        insumo_id: id,
        tipo: data.tipo,
        cantidad: data.cantidad,
        motivo: data.motivo,
      },
    });

    // 4. Actualizar stock en insumo
    return tx.insumo.update({
      where: { id },
      data: { stock_actual: nuevoStock },
      include: {
        proveedor: true,
      },
    });
  });
};
