import { prisma } from '../config/db';
import { Canal } from '@prisma/client';

export const getDashboardStats = async (startDateStr?: string, endDateStr?: string) => {
  // Rango por defecto del seed para la demo si no se especifican fechas
  const startDate = startDateStr ? new Date(startDateStr) : new Date('2025-12-01T00:00:00Z');
  const endDate = endDateStr ? new Date(endDateStr) : new Date('2026-03-31T23:59:59Z');

  // Ajustar horas para asegurar límites correctos del día
  if (startDateStr) startDate.setHours(0, 0, 0, 0);
  if (endDateStr) endDate.setHours(23, 59, 59, 999);

  const periodWhere = {
    created_at: {
      gte: startDate,
      lte: endDate,
    },
  };

  const totalOrders = await prisma.orden.count();
  const totalRevenue = await prisma.orden.aggregate({
    _sum: { total: true },
  });

  // KPIs del período filtrado
  const periodOrders = await prisma.orden.count({
    where: periodWhere,
  });

  const periodRevenue = await prisma.orden.aggregate({
    where: periodWhere,
    _sum: { total: true },
  });

  const avgTicketPeriod = periodOrders > 0 ? (periodRevenue._sum.total || 0) / periodOrders : 0;

  // 3. Top 5 productos más vendidos del período
  const topProducts = await prisma.itemsOrden.groupBy({
    by: ['producto_id'],
    _sum: { cantidad: true },
    where: {
      orden: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 5,
  });

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.producto.findUnique({
        where: { id: item.producto_id },
        select: { id: true, nombre: true, sku: true, imagen_url: true, precio_venta: true },
      });
      return {
        ...product,
        totalVendido: item._sum.cantidad,
      };
    })
  );

  // 4. Órdenes por estado del período
  const ordersByStatus = await prisma.orden.groupBy({
    by: ['estado'],
    _count: true,
    where: periodWhere,
  });

  // 5. Ventas por canal del período
  const ordersByChannel = await prisma.orden.groupBy({
    by: ['canal'],
    _sum: { total: true },
    _count: true,
    where: periodWhere,
  });

  // 6. Ventas diarias del período
  const dailySales = await prisma.$queryRaw`
    SELECT 
      DATE(created_at) as date,
      CAST(COUNT(*) AS INTEGER) as count,
      CAST(SUM(total) AS DOUBLE PRECISION) as total
    FROM "Orden"
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `;

  return {
    kpis: {
      monthlyRevenue: periodRevenue._sum.total || 0, // Mapeado a la variable esperada por el frontend
      monthlyOrders: periodOrders,                  // Mapeado a la variable esperada por el frontend
      avgTicketMonthly: avgTicketPeriod,            // Mapeado a la variable esperada por el frontend
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
    },
    topProducts: topProductsWithDetails,
    ordersByStatus,
    ordersByChannel,
    dailySales,
  };
};