import { PrismaClient, Canal, EstadoOrden, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// SKUs alfanuméricos (sin tildes, sin ñ, sin espacios)
const PRODUCTOS_DATA = [
  { sku: 'YAM-CRE-001', nombre: 'Paleta Crema Chocolate', descripcion_corta: 'Clásica paleta de chocolate', precio_venta: 3.50, categoria: 'Personal' },
  { sku: 'YAM-CRE-002', nombre: 'Paleta Crema Fresa', descripcion_corta: 'Fresca paleta de fresa', precio_venta: 3.50, categoria: 'Personal' },
  { sku: 'YAM-CRE-003', nombre: 'Paleta Crema Lúcuma', descripcion_corta: 'Paleta de lúcuma peruana', precio_venta: 4.00, categoria: 'Personal' },
  { sku: 'YAM-AGU-001', nombre: 'Paleta Agua Maracuyá', descripcion_corta: 'Refrescante maracuyá', precio_venta: 2.50, categoria: 'Personal' },
  { sku: 'YAM-AGU-002', nombre: 'Paleta Agua Chicha Morada', descripcion_corta: 'Chicha morada en paleta', precio_venta: 2.50, categoria: 'Personal' },
  { sku: 'YAM-BOM-001', nombre: 'Bombón Vainilla Bañado', descripcion_corta: 'Vainilla con cobertura de chocolate', precio_venta: 5.00, categoria: 'Personal' },
  { sku: 'YAM-BAR-001', nombre: 'Barquillo Marmoleado', descripcion_corta: 'Barquillo con chispas', precio_venta: 4.50, categoria: 'Personal' },
  { sku: 'YAM-SAN-001', nombre: 'Sándwich Galleta Chocolate', descripcion_corta: 'Sándwich de helado con galleta', precio_venta: 4.00, categoria: 'Personal' },
  { sku: 'YAM-ESP-001', nombre: 'Chocobombom', descripcion_corta: 'Especial Chocobombom', precio_venta: 6.00, categoria: 'Especiales' },
  { sku: 'YAM-ESP-002', nombre: 'Trubulú', descripcion_corta: 'Trubulú Yámboly', precio_venta: 6.50, categoria: 'Especiales' },
  { sku: 'YAM-ESP-003', nombre: 'Bakanazo', descripcion_corta: 'El clásico Bakanazo', precio_venta: 7.00, categoria: 'Especiales' },
  { sku: 'YAM-LIT-001', nombre: 'Pote Trisabor (1L)', descripcion_corta: 'Vainilla, Lúcuma y Fresa', precio_venta: 18.00, categoria: 'Familiar' },
  { sku: 'YAM-LIT-002', nombre: 'Pote Vainilla Chips (1L)', descripcion_corta: 'Vainilla con chips', precio_venta: 18.00, categoria: 'Familiar' },
  { sku: 'YAM-LIT-003', nombre: 'Pote Lúcuma Chips (1L)', descripcion_corta: 'Lúcuma con chips', precio_venta: 19.00, categoria: 'Familiar' },
  { sku: 'YAM-LIT-004', nombre: 'Pote Vainilla-Chocolate (1L)', descripcion_corta: 'Combinación de vainilla y chocolate', precio_venta: 18.00, categoria: 'Familiar' },
  { sku: 'YAM-MUL-001', nombre: 'Napolitano (5L)', descripcion_corta: 'Helado napolitano para eventos', precio_venta: 45.00, categoria: 'Familiar' },
  { sku: 'YAM-MUL-002', nombre: 'Coco Chips (5L)', descripcion_corta: 'Helado de coco con chips', precio_venta: 48.00, categoria: 'Familiar' },
  { sku: 'YAM-MUL-003', nombre: 'Menta Chips (5L)', descripcion_corta: 'Helado de menta con chips', precio_venta: 48.00, categoria: 'Familiar' },
  { sku: 'YAM-BRO-001', nombre: 'Chocobrownie Pote (930mL)', descripcion_corta: 'Helado de chocolate con brownie', precio_venta: 22.00, categoria: 'Familiar' },
  { sku: 'YAM-PCK-001', nombre: 'Pack Bombones (243mL)', descripcion_corta: 'Pack de bombones de vainilla', precio_venta: 15.00, categoria: 'Personal' },
];

// Clientes de prueba (4)
const CLIENTES = [
  { email: 'cliente1@mail.com', nombre: 'Ana', apellido: 'García' },
  { email: 'cliente2@mail.com', nombre: 'Carlos', apellido: 'Pérez' },
  { email: 'cliente3@mail.com', nombre: 'María', apellido: 'López' },
  { email: 'cliente4@mail.com', nombre: 'Luis', apellido: 'Martínez' },
];

// Distribución de canales (suma 50)
const CANALES_DISTRIBUCION: Canal[] = [
  ...Array(30).fill('web') as Canal[],
  ...Array(10).fill('rappi') as Canal[],
  ...Array(5).fill('tottus') as Canal[],
  ...Array(5).fill('tambo') as Canal[],
];

// Distribución de estados (pesos)
const ESTADOS_DISTRIBUCION: EstadoOrden[] = [
  ...Array(20).fill('entregada') as EstadoOrden[],
  ...Array(15).fill('pagada') as EstadoOrden[],
  ...Array(10).fill('pendiente') as EstadoOrden[],
  ...Array(5).fill('cancelada') as EstadoOrden[],
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Iniciando Seed...');

  // 1. Limpiar datos previos (en orden inverso por dependencias)
  await prisma.itemsOrden.deleteMany({});
  await prisma.orden.deleteMany({});
  await prisma.itemsCarrito.deleteMany({});
  await prisma.carrito.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.usuario.deleteMany({});

  console.log('✅ Base de datos limpiada');

  // 2. Crear Categorías
  const categoriasMap = new Map();
  const catData = ['Personal', 'Familiar', 'Especiales'];
  for (const nombre of catData) {
    const cat = await prisma.categoria.create({ data: { nombre } });
    categoriasMap.set(nombre, cat.id);
  }
  console.log(`✅ ${catData.length} categorías creadas`);

  // 3. Crear Productos (20)
  const productosCreados = [];
  for (const p of PRODUCTOS_DATA) {
    const categoriaId = categoriasMap.get(p.categoria);
    if (!categoriaId) continue;
    const producto = await prisma.producto.create({
      data: {
        sku: p.sku,
        nombre: p.nombre,
        descripcion_corta: p.descripcion_corta,
        descripcion_larga: `Delicioso helado Yámboly - ${p.nombre}`,
        precio_venta: p.precio_venta,
        precio_oferta: Math.random() > 0.8 ? p.precio_venta * 0.85 : null, // 20% con oferta
        categoria_id: categoriaId,
        stock: Math.floor(Math.random() * 80) + 20, // 20 a 100 unidades
        stock_minimo: 10,
        imagen_url: `https://picsum.photos/seed/${p.sku}/300/300`,
        activo: true,
      },
    });
    productosCreados.push(producto);
  }
  console.log(`✅ ${productosCreados.length} productos creados`);

  // 4. Crear Usuarios: 1 Admin + 4 Clientes
  const adminPassword = await bcrypt.hash('Admin2026!', 10);
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@yamboly.com',
      nombre: 'Super',
      apellido: 'Admin',
      contrasena_hash: adminPassword,
      rol: 'admin',
    },
  });

  const clientesCreados = [];
  for (const c of CLIENTES) {
    const pass = await bcrypt.hash('password123', 10);
    const user = await prisma.usuario.create({
      data: {
        email: c.email,
        nombre: c.nombre,
        apellido: c.apellido,
        contrasena_hash: pass,
        rol: 'cliente',
      },
    });
    clientesCreados.push(user);
  }
  console.log(`✅ Usuarios creados: 1 admin, ${clientesCreados.length} clientes`);

  // 5. Crear Órdenes (50 a 60) - Distribución exacta
  const NUM_ORDENES = 50; // Cambia a 60 si quieres, pero 50 está bien
  const ordenesCreadas = [];
  const threeMonthsAgo = new Date('2025-12-01T00:00:00Z');
  const today = new Date('2026-03-31T23:59:59Z');

  for (let i = 0; i < NUM_ORDENES; i++) {
    const usuario = getRandomItem(clientesCreados);
    const canal = CANALES_DISTRIBUCION[i] || 'web'; // Seguro
    const estado = getRandomItem(ESTADOS_DISTRIBUCION);
    const fecha = randomDate(threeMonthsAgo, today);
    const metodoPago = ['tarjeta', 'contraentrega', 'culqi'][Math.floor(Math.random() * 3)];

    // Elegir 2-4 productos aleatorios para esta orden
    const numItems = Math.floor(Math.random() * 3) + 2; // 2 a 4
    const itemsSeleccionados = [];
    let subtotal = 0;
    const shuffled = [...productosCreados].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numItems && j < shuffled.length; j++) {
      const prod = shuffled[j];
      const cantidad = Math.floor(Math.random() * 3) + 1; // 1 a 3
      const precio = prod.precio_oferta ?? prod.precio_venta;
      itemsSeleccionados.push({
        producto_id: prod.id,
        cantidad: cantidad,
        precio_unitario: precio,
        descuento: prod.precio_oferta ? prod.precio_venta - prod.precio_oferta : 0,
      });
      subtotal += precio * cantidad;
    }

    // Calcular total (ya incluye IGV, solo redondeamos)
    const total = parseFloat(subtotal.toFixed(2));

    const orden = await prisma.orden.create({
      data: {
        usuario_id: usuario.id,
        fecha: fecha,
        created_at: fecha,
        updated_at: fecha,
        estado: estado,
        canal: canal,
        subtotal: subtotal,
        impuestos: 0, // Ya incluido
        total: total,
        direccion_envio: `Av. ${usuario.nombre} ${Math.floor(Math.random() * 1000)}, Lima`,
        metodo_pago: metodoPago,
        items: {
          create: itemsSeleccionados.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            descuento: item.descuento,
          })),
        },
      },
      include: { items: true },
    });
    ordenesCreadas.push(orden);

    // Si la orden está entregada, restar stock (simular que se vendió)
    if (estado === 'entregada' || estado === 'pagada' || estado === 'enviada') {
      for (const item of orden.items) {
        await prisma.producto.update({
          where: { id: item.producto_id },
          data: { stock: { decrement: item.cantidad } },
        });
      }
    }
  }

  console.log(`✅ ${ordenesCreadas.length} órdenes creadas con canales: web=${30}, rappi=${10}, tottus=${5}, tambo=${5}`);

  // Estadística final
  const countOrders = await prisma.orden.count();
  console.log(`📊 Total de órdenes en BD: ${countOrders}`);
  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });