import { prisma } from '../config/db';
import { Prisma, EstadoCompra } from '@prisma/client';

export const getPurchaseOrders = async (filters: any) => {
  const { proveedor_id, estado, page = 1, limit = 10, sort = 'created_at', order = 'desc' } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.OrdenCompraWhereInput = {
    ...(proveedor_id && { proveedor_id }),
    ...(estado && { estado }),
  };

  const [data, total] = await Promise.all([
    prisma.ordenCompra.findMany({
      where,
      include: { 
        proveedor: { select: { id: true, nombre: true, ruc: true } },
        usuario: { select: { id: true, nombre: true, apellido: true } }
      },
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.ordenCompra.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getPurchaseOrderById = async (id: number) => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    include: { 
      proveedor: true,
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      items: {
        include: { insumo: true }
      }
    },
  });
};

export const createPurchaseOrder = async (data: any) => {
  const { proveedor_id, usuario_id, fecha_entrega, items } = data;
  
  // Calculate subtotal, impuestos and total
  let subtotal = 0;
  const itemsData = items.map((item: any) => {
    const itemSubtotal = item.cantidad * item.precio_unitario;
    subtotal += itemSubtotal;
    return {
      insumo_id: item.insumo_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: itemSubtotal
    };
  });

  const impuestos = subtotal * 0.18; // Asumiendo 18% IGV
  const total = subtotal + impuestos;

  // By default, assuming a specific user for MVP if not provided (normally from token)
  const finalUserId = usuario_id || (await prisma.usuario.findFirst({ where: { rol: 'admin' } }))?.id;

  if (!finalUserId) {
    throw new Error('No admin user found to assign the order');
  }

  return prisma.ordenCompra.create({
    data: {
      proveedor_id,
      usuario_id: finalUserId,
      fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
      subtotal,
      impuestos,
      total,
      estado: 'pendiente',
      items: {
        create: itemsData
      }
    },
    include: { items: true }
  });
};

export const updatePurchaseOrderStatus = async (id: number, estado: EstadoCompra) => {
  const currentOrder = await prisma.ordenCompra.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!currentOrder) throw new Error('Orden de compra no encontrada');
  
  if (currentOrder.estado === estado) {
    return currentOrder;
  }

  // If status changes to 'recibida', we should increase the stock of Insumos
  if (estado === 'recibida' && currentOrder.estado !== 'recibida') {
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.ordenCompra.update({
        where: { id },
        data: { estado }
      });

      // Update insumos stock
      for (const item of currentOrder.items) {
        await tx.insumo.update({
          where: { id: item.insumo_id },
          data: { stock_actual: { increment: item.cantidad } }
        });
      }
    });
    
    return prisma.ordenCompra.findUnique({ where: { id }, include: { items: true } });
  }

  return prisma.ordenCompra.update({
    where: { id },
    data: { estado },
    include: { items: true }
  });
};
