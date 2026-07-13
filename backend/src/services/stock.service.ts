import { prisma } from '../config/db';
import { Prisma, TipoMovimientoStock } from '@prisma/client';

export const getStockMovements = async (filters: any) => {
  const { producto_id, tipo, page = 1, limit = 10, sort = 'created_at', order = 'desc' } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.MovimientoStockWhereInput = {
    ...(producto_id && { producto_id }),
    ...(tipo && { tipo }),
  };

  const [data, total] = await Promise.all([
    prisma.movimientoStock.findMany({
      where,
      include: { 
        producto: { select: { id: true, nombre: true, sku: true } },
        usuario: { select: { id: true, nombre: true } }
      },
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.movimientoStock.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const createStockMovement = async (data: any) => {
  const { producto_id, tipo, cantidad, referencia_id, referencia_tipo, usuario_id } = data;

  // Run in a transaction to ensure stock is updated with the movement record
  return prisma.$transaction(async (tx) => {
    const product = await tx.producto.findUnique({ where: { id: producto_id } });
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const stock_anterior = product.stock;
    
    // Determine sign based on type
    let stock_nuevo = stock_anterior;
    if (tipo === 'entrada_compra') {
      stock_nuevo += cantidad;
    } else if (tipo === 'salida_venta') {
      stock_nuevo -= cantidad;
    } else if (tipo === 'ajuste_manual') {
      // Ajuste manual can be positive or negative, but we will pass unsigned cantidad and determine logic,
      // or we can just accept positive for entrada, negative for salida.
      // Assuming 'cantidad' parameter is the absolute change, and we need another way to pass sign, 
      // but let's assume for ajuste_manual we pass a positive or negative quantity directly.
      stock_nuevo += cantidad; 
    }

    if (stock_nuevo < 0) {
      throw new Error(`Stock insuficiente. Stock actual: ${stock_anterior}`);
    }

    // Update product stock
    await tx.producto.update({
      where: { id: producto_id },
      data: { stock: stock_nuevo }
    });

    // Create movement
    return tx.movimientoStock.create({
      data: {
        producto_id,
        tipo,
        cantidad: Math.abs(cantidad), // Save absolute amount
        stock_anterior,
        stock_nuevo,
        referencia_id,
        referencia_tipo,
        usuario_id
      }
    });
  });
};
