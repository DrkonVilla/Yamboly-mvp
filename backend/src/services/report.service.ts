import { prisma } from '../config/db';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

// Helper: Formatear fecha
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper: Crear encabezado del PDF
const addHeader = (doc: PDFKit.PDFDocument, title: string, subtitle?: string) => {
  // Logo (texto)
  doc.fontSize(22).fillColor('#4B2E83').text('Yámboly', { align: 'center' });
  doc.fontSize(10).fillColor('#29B6E8').text('Helados 100% peruanos', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor('#4B2E83').text(title, { align: 'center', underline: true });
  if (subtitle) {
    doc.fontSize(9).fillColor('#7B5EA7').text(subtitle, { align: 'center' });
  }
  doc.moveDown(1);
  doc.fillColor('#000000');
};

// Helper: Agregar pie de página
const addFooter = (doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number) => {
  doc.fontSize(8).fillColor('#7B5EA7').text(
    `Generado: ${formatDate(new Date())} | Página ${pageNumber} de ${totalPages}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );
};

// Reporte 1: Listado de órdenes
export const generateOrdersReport = async (res: Response, startDateStr?: string, endDateStr?: string) => {
  // Construir filtro de fechas con límites de día
  const where: any = {};
  let subtitle = 'Todas las órdenes';

  if (startDateStr || endDateStr) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date('2025-12-01T00:00:00Z');
    const endDate = endDateStr ? new Date(endDateStr) : new Date('2026-03-31T23:59:59Z');

    if (startDateStr) startDate.setHours(0, 0, 0, 0);
    if (endDateStr) endDate.setHours(23, 59, 59, 999);

    where.created_at = {
      gte: startDate,
      lte: endDate,
    };
    subtitle = `Período: ${startDateStr || 'inicio'} - ${endDateStr || 'hoy'}`;
  }

  const orders = await prisma.orden.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      usuario: {
        select: { nombre: true, apellido: true, email: true },
      },
      items: {
        include: { producto: { select: { nombre: true, sku: true } } },
      },
    },
  });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte-ordenes-${Date.now()}.pdf`);

  const totalPages = Math.ceil(orders.length / 15) + 1; // Aprox 15 órdenes por página
  let pageNumber = 1;

  doc.pipe(res);

  // Encabezado
  const subtitle = startDate || endDate
    ? `Período: ${startDate || 'inicio'} - ${endDate || 'hoy'}`
    : 'Todas las órdenes';
  addHeader(doc, '📋 REPORTE DE ÓRDENES', subtitle);

  // Tabla de órdenes
  const tableTop = 180;
  let currentY = tableTop;

  // Cabecera de tabla
  const colPositions = {
    id: 50,
    cliente: 90,
    canal: 170,
    total: 310,
    estado: 370,
    fecha: 430,
  };

  doc.fontSize(9).fillColor('#4B2E83');
  doc.text('ID', colPositions.id, currentY);
  doc.text('Cliente', colPositions.cliente, currentY);
  doc.text('Canal', colPositions.canal, currentY);
  doc.text('Total (S/)', colPositions.total, currentY);
  doc.text('Estado', colPositions.estado, currentY);
  doc.text('Fecha', colPositions.fecha, currentY);

  // Línea separadora
  currentY += 10;
  doc.strokeColor('#29B6E8').moveTo(50, currentY).lineTo(550, currentY).stroke();

  currentY += 10;

  // Datos
  for (const order of orders) {
    if (currentY > doc.page.height - 80) {
      doc.addPage();
      pageNumber++;
      currentY = 50;
      // Reimprimir cabecera en nueva página
      addHeader(doc, '📋 REPORTE DE ÓRDENES', subtitle);
      currentY = 180;
      // Repetir cabecera de tabla
      doc.fontSize(9).fillColor('#4B2E83');
      doc.text('ID', colPositions.id, currentY);
      doc.text('Cliente', colPositions.cliente, currentY);
      doc.text('Canal', colPositions.canal, currentY);
      doc.text('Total (S/)', colPositions.total, currentY);
      doc.text('Estado', colPositions.estado, currentY);
      doc.text('Fecha', colPositions.fecha, currentY);
      currentY += 10;
      doc.strokeColor('#29B6E8').moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;
    }

    doc.fontSize(9).fillColor('#1F2937');
    doc.text(`#${order.id}`, colPositions.id, currentY);
    doc.text(`${order.usuario?.nombre || 'N/A'} ${order.usuario?.apellido || ''}`, colPositions.cliente, currentY);
    doc.text(order.canal, colPositions.canal, currentY);
    doc.text(order.total.toFixed(2), colPositions.total, currentY);
    doc.text(order.estado, colPositions.estado, currentY);
    doc.text(formatDate(order.created_at), colPositions.fecha, currentY);

    currentY += 18;
  }

  // Resumen al final
  currentY += 10;
  const totalMonto = orders.reduce((sum, o) => sum + o.total, 0);
  doc.fontSize(10).fillColor('#1F2937');
  doc.text(`Total de órdenes: ${orders.length}`, 50, currentY);
  doc.text(`Monto total: S/ ${totalMonto.toFixed(2)}`, 50, currentY + 20);

  // Pie de página
  addFooter(doc, pageNumber, totalPages);

  doc.end();

  return doc;
};

// Reporte 2: Inventario actual
export const generateInventoryReport = async (res: Response) => {
  const products = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
    include: { categoria: true },
  });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte-inventario-${Date.now()}.pdf`);

  const totalPages = Math.ceil(products.length / 20) + 1;
  let pageNumber = 1;

  doc.pipe(res);

  addHeader(doc, '📦 REPORTE DE INVENTARIO', 'Stock actual de productos');

  const tableTop = 170;
  let currentY = tableTop;

  // Cabecera
  const colPos = { sku: 50, nombre: 140, categoria: 300, stock: 420, precio: 480 };

  doc.fontSize(9).fillColor('#4B2E83');
  doc.text('SKU', colPos.sku, currentY);
  doc.text('Nombre', colPos.nombre, currentY);
  doc.text('Categoría', colPos.categoria, currentY);
  doc.text('Stock', colPos.stock, currentY);
  doc.text('Precio (S/)', colPos.precio, currentY);

  currentY += 10;
  doc.strokeColor('#29B6E8').moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 10;

  let lowStockCount = 0;

  for (const product of products) {
    if (currentY > doc.page.height - 80) {
      doc.addPage();
      pageNumber++;
      currentY = 50;
      addHeader(doc, '📦 REPORTE DE INVENTARIO', 'Stock actual de productos');
      currentY = 170;
      doc.text('SKU', colPos.sku, currentY);
      doc.text('Nombre', colPos.nombre, currentY);
      doc.text('Categoría', colPos.categoria, currentY);
      doc.text('Stock', colPos.stock, currentY);
      doc.text('Precio (S/)', colPos.precio, currentY);
      currentY += 10;
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;
    }

    const isLowStock = product.stock < product.stock_minimo;
    if (isLowStock) lowStockCount++;

    doc.fontSize(9).fillColor(isLowStock ? '#E6007E' : '#1F2937');
    doc.text(product.sku, colPos.sku, currentY);
    doc.text(product.nombre, colPos.nombre, currentY);
    doc.text(product.categoria?.nombre || '-', colPos.categoria, currentY);
    doc.text(product.stock.toString(), colPos.stock, currentY);
    doc.text(product.precio_venta.toFixed(2), colPos.precio, currentY);

    currentY += 18;
  }

  // Resumen al final
  currentY += 15;
  doc.fontSize(10).fillColor('#1F2937');
  doc.text(`Total de productos activos: ${products.length}`, 50, currentY);
  doc.text(`Productos con stock bajo (${products.filter(p => p.stock < p.stock_minimo).length}):`, 50, currentY + 20);
  currentY += 35;
  doc.fontSize(9).fillColor('#E6007E');
  products
    .filter(p => p.stock < p.stock_minimo)
    .forEach(p => {
      doc.text(`- ${p.nombre}: ${p.stock} (mínimo ${p.stock_minimo})`, 60, currentY);
      currentY += 15;
    });

  addFooter(doc, pageNumber, totalPages);

  doc.end();

  return doc;
};