import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export const createOrder = async (data: {
  usuario_id: number;
  items: { producto_id: number; cantidad: number; precio_unitario: number }[];
  direccion_envio: string;
  metodo_pago: string;
  canal: string;
}) => {
  // Calcular subtotal y total
  let subtotal = 0;
  for (const item of data.items) {
    subtotal += item.precio_unitario * item.cantidad;
  }
  const impuestos = 0; // Ya incluido en el precio
  const total = subtotal;

  // Usar transacción para consistencia
  const result = await prisma.$transaction(async (tx) => {
    // 1. Verificar stock de todos los productos
    for (const item of data.items) {
      const product = await tx.producto.findUnique({
        where: { id: item.producto_id },
      });
      if (!product) {
        throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
      }
      if (product.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
      }
    }

    // 2. Crear la orden
    const order = await tx.orden.create({
      data: {
        usuario_id: data.usuario_id,
        direccion_envio: data.direccion_envio,
        metodo_pago: data.metodo_pago,
        canal: data.canal as any, // Cast a Canal enum
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
        estado: 'pagada', // En MVP, lo marcamos como pagada directamente (simulado)
        items: {
          create: data.items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            descuento: 0,
          })),
        },
      },
      include: {
        items: {
          include: { producto: true },
        },
        usuario: {
          select: { id: true, email: true, nombre: true, apellido: true },
        },
      },
    });

    // 3. Descontar stock
    for (const item of data.items) {
      await tx.producto.update({
        where: { id: item.producto_id },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return order;
  });

  return result;
};

export const getOrdersByUser = async (usuario_id: number) => {
  return prisma.orden.findMany({
    where: { usuario_id },
    orderBy: { created_at: 'desc' },
    include: {
      items: {
        include: { producto: true },
      },
    },
  });
};

export const getOrderById = async (id: number, usuario_id?: number) => {
  const where: any = { id };
  if (usuario_id) {
    where.usuario_id = usuario_id;
  }
  return prisma.orden.findFirst({
    where,
    include: {
      items: {
        include: { producto: true },
      },
      usuario: {
        select: { id: true, email: true, nombre: true, apellido: true },
      },
    },
  });
};

export const getAllOrders = async (filters?: { estado?: string; canal?: string }) => {
  const where: any = {};
  if (filters?.estado) where.estado = filters.estado;
  if (filters?.canal) where.canal = filters.canal;

  return prisma.orden.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      items: {
        include: { producto: true },
      },
      usuario: {
        select: { id: true, email: true, nombre: true, apellido: true },
      },
    },
  });
};

export const updateOrderStatus = async (id: number, estado: string, usuario_id?: number) => {
  // Verificar que la orden existe y pertenece al usuario (si se pasa usuario_id)
  const where: any = { id };
  if (usuario_id) where.usuario_id = usuario_id;

  const order = await prisma.orden.findFirst({ where });
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  // Si se cancela y estaba pagada o enviada, restaurar stock
  if (estado === 'cancelada' && (order.estado === 'pagada' || order.estado === 'enviada')) {
    await prisma.$transaction(async (tx) => {
      // Obtener items de la orden
      const items = await tx.itemsOrden.findMany({
        where: { orden_id: id },
      });
      // Restaurar stock
      for (const item of items) {
        await tx.producto.update({
          where: { id: item.producto_id },
          data: { stock: { increment: item.cantidad } },
        });
      }
      // Actualizar estado
      await tx.orden.update({
        where: { id },
        data: { estado: estado as any },
      });
    });
    return prisma.orden.findUnique({ where: { id }, include: { items: { include: { producto: true } } } });
  }

  // Actualización normal (sin restauración de stock)
  return prisma.orden.update({
    where: { id },
    data: { estado: estado as any },
    include: { items: { include: { producto: true } } },
  });
};