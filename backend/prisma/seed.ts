import { PrismaClient, Canal, EstadoOrden, Rol, EstadoCompra, TipoMovimientoStock } from '@prisma/client';
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
  await prisma.movimientoStock.deleteMany({});
  await prisma.itemsOrdenCompra.deleteMany({});
  await prisma.ordenCompra.deleteMany({});
  await prisma.insumo.deleteMany({});
  await prisma.proveedor.deleteMany({});
  await prisma.itemsOrden.deleteMany({});
  await prisma.orden.deleteMany({});
  await prisma.itemsCarrito.deleteMany({});
  await prisma.carrito.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.categoria.deleteMany({});
  
  await prisma.movimientoStock.deleteMany({});
  await prisma.itemsOrdenCompra.deleteMany({});
  await prisma.ordenCompra.deleteMany({});
  await prisma.insumo.deleteMany({});
  await prisma.proveedor.deleteMany({});

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
        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
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

  // 4b. Crear Proveedores e Insumos
  const PROVEEDORES_DATA = [
    { ruc: '20100234567', nombre: 'Gloria S.A.', contacto: 'Juan Depaz', telefono: '01 4756382', email: 'ventas@gloria.com.pe', direccion: 'Av. República de Panamá 2461, Lima' },
    { ruc: '20234567891', nombre: 'D\'Onofrio Corp.', contacto: 'María Romero', telefono: '01 3546721', email: 'contacto@donofrio.pe', direccion: 'Av. Venezuela 2580, Lima' },
    { ruc: '20495837261', nombre: 'Frutos del Campo SAC', contacto: 'Carlos Loli', telefono: '987 654 321', email: 'ventas@frutoscampo.com', direccion: 'Jr. Ica 456, Huaral' },
    { ruc: '20584736291', nombre: 'Envases Plásticos del Sur', contacto: 'Rosa Medina', telefono: '01 4453928', email: 'rmedina@envasesur.com', direccion: 'Av. Industrial 123, Villa El Salvador' },
    { ruc: '20603948576', nombre: 'Azucarera Laredo', contacto: 'Humberto Solis', telefono: '044 435271', email: 'azucar@laredo.com.pe', direccion: 'Carretera Laredo Km 10, Trujillo' },
  ];

  const proveedoresCreados = [];
  for (const prov of PROVEEDORES_DATA) {
    const p = await prisma.proveedor.create({ data: prov });
    proveedoresCreados.push(p);
  }
  console.log(`✅ ${proveedoresCreados.length} proveedores creados`);

  const INSUMOS_DATA = [
    { proveedorIdx: 0, nombre: 'Leche Condensada', descripcion: 'Lata de leche condensada de 390g', unidad_medida: 'Latas', precio_unit: 4.20, stock_actual: 150.0, stock_minimo: 30.0 },
    { proveedorIdx: 0, nombre: 'Crema de Leche', descripcion: 'Crema para batir Gloria', unidad_medida: 'Litros', precio_unit: 12.50, stock_actual: 80.0, stock_minimo: 20.0 },
    { proveedorIdx: 0, nombre: 'Leche Evaporada', descripcion: 'Leche evaporada entera', unidad_medida: 'Latas', precio_unit: 3.80, stock_actual: 200.0, stock_minimo: 40.0 },
    { proveedorIdx: 1, nombre: 'Base de Helado Vainilla', descripcion: 'Mezcla base sabor vainilla', unidad_medida: 'Galones', precio_unit: 25.00, stock_actual: 10.0, stock_minimo: 15.0 },
    { proveedorIdx: 1, nombre: 'Chispas de Chocolate', descripcion: 'Chispas de chocolate semi amargo', unidad_medida: 'Kg', precio_unit: 18.50, stock_actual: 25.0, stock_minimo: 5.0 },
    { proveedorIdx: 1, nombre: 'Cobertura de Chocolate', descripcion: 'Chocolate para bañar bombones', unidad_medida: 'Kg', precio_unit: 22.00, stock_actual: 30.0, stock_minimo: 10.0 },
    { proveedorIdx: 2, nombre: 'Pulpa de Maracuyá', descripcion: 'Pulpa de fruta natural congelada', unidad_medida: 'Kg', precio_unit: 15.00, stock_actual: 40.0, stock_minimo: 10.0 },
    { proveedorIdx: 2, nombre: 'Fresa Congelada', descripcion: 'Fresa entera seleccionada', unidad_medida: 'Kg', precio_unit: 9.50, stock_actual: 50.0, stock_minimo: 15.0 },
    { proveedorIdx: 2, nombre: 'Pulpa de Lúcuma', descripcion: 'Lúcuma de seda madura licuada', unidad_medida: 'Kg', precio_unit: 28.00, stock_actual: 30.0, stock_minimo: 8.0 },
    { proveedorIdx: 3, nombre: 'Vasos Plásticos 4oz', descripcion: 'Vasos descartables para helado personal', unidad_medida: 'Millares', precio_unit: 55.00, stock_actual: 3.0, stock_minimo: 5.0 },
    { proveedorIdx: 3, nombre: 'Cucharas de Plástico', descripcion: 'Cucharas pequeñas de colores', unidad_medida: 'Millares', precio_unit: 22.00, stock_actual: 8.0, stock_minimo: 3.0 },
    { proveedorIdx: 3, nombre: 'Tapas Transparentes', descripcion: 'Tapas para pote familiar 1L', unidad_medida: 'Millares', precio_unit: 45.00, stock_actual: 2.0, stock_minimo: 4.0 },
    { proveedorIdx: 3, nombre: 'Potes de 1 Litro', descripcion: 'Envase familiar con logo', unidad_medida: 'Unidades', precio_unit: 0.85, stock_actual: 500.0, stock_minimo: 100.0 },
    { proveedorIdx: 4, nombre: 'Azúcar Blanca Refinada', descripcion: 'Sacos de azúcar de 50kg', unidad_medida: 'Sacos', precio_unit: 140.00, stock_actual: 12.0, stock_minimo: 3.0 },
    { proveedorIdx: 4, nombre: 'Azúcar Rubia', descripcion: 'Sacos de azúcar rubia de 50kg', unidad_medida: 'Sacos', precio_unit: 130.00, stock_actual: 5.0, stock_minimo: 2.0 },
  ];

  let insumosCreadosCount = 0;
  for (const ins of INSUMOS_DATA) {
    const prov = proveedoresCreados[ins.proveedorIdx];
    await prisma.insumo.create({
      data: {
        proveedor_id: prov.id,
        nombre: ins.nombre,
        descripcion: ins.descripcion,
        unidad_medida: ins.unidad_medida,
        precio_unit: ins.precio_unit,
        stock_actual: ins.stock_actual,
        stock_minimo: ins.stock_minimo,
        activo: true,
      },
    });
    insumosCreadosCount++;
  }
  console.log(`✅ ${insumosCreadosCount} insumos creados`);

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

  // 6. Crear Proveedor e Insumos
  const proveedorUser = await prisma.usuario.create({
    data: {
      email: 'proveedor@yamboly.com',
      nombre: 'Juan',
      apellido: 'Proveedor',
      contrasena_hash: await bcrypt.hash('Admin2026!', 10),
      rol: 'proveedor'
    }
  });

  const proveedor = await prisma.proveedor.create({
    data: {
      usuario_id: proveedorUser.id,
      ruc: '10101010101',
      nombre: 'Proveedor Yámboly',
      contacto: 'Juan Proveedor',
      telefono: '999888777',
      email: 'ventas@proveedoryamboly.com',
      direccion: 'Av. Industrial 123',
    }
  });

  const insumosData = [
    { nombre: 'Leche en polvo', precio_unit: 15.5, unidad_medida: 'kg' },
    { nombre: 'Azúcar industrial', precio_unit: 3.2, unidad_medida: 'kg' },
    { nombre: 'Saborizante Vainilla', precio_unit: 45.0, unidad_medida: 'litro' },
    { nombre: 'Manteca de cacao', precio_unit: 25.0, unidad_medida: 'kg' },
    { nombre: 'Palitos de madera', precio_unit: 0.05, unidad_medida: 'unidad' }
  ];

  const insumosCreados = [];
  for (const ins of insumosData) {
    const insumo = await prisma.insumo.create({
      data: {
        proveedor_id: proveedor.id,
        nombre: ins.nombre,
        precio_unit: ins.precio_unit,
        unidad_medida: ins.unidad_medida,
        stock_actual: Math.floor(Math.random() * 500) + 100,
        stock_minimo: 50
      }
    });
    insumosCreados.push(insumo);
  }
  console.log(`✅ 1 Proveedor y ${insumosCreados.length} Insumos creados`);

  // 7. Crear 20 Órdenes de Compra
  const ESTADOS_COMPRA: EstadoCompra[] = ['pendiente', 'aprobada', 'recibida', 'cancelada'];
  const ordenesCompraCreadas = [];
  for(let i = 0; i < 20; i++) {
    const estado = ESTADOS_COMPRA[i % 4];
    const fecha = randomDate(threeMonthsAgo, today);
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 a 3 insumos
    
    let subtotal = 0;
    const itemsSeleccionados = [];
    const shuffledInsumos = [...insumosCreados].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numItems && j < shuffledInsumos.length; j++) {
      const ins = shuffledInsumos[j];
      const cantidad = Math.floor(Math.random() * 50) + 10;
      const subtotalItem = cantidad * ins.precio_unit;
      itemsSeleccionados.push({
        insumo_id: ins.id,
        cantidad,
        precio_unitario: ins.precio_unit,
        subtotal: subtotalItem
      });
      subtotal += subtotalItem;
    }
    
    const impuestos = subtotal * 0.18;
    const total = subtotal + impuestos;

    const ordenCompra = await prisma.ordenCompra.create({
      data: {
        proveedor_id: proveedor.id,
        usuario_id: admin.id,
        estado: estado,
        subtotal: parseFloat(subtotal.toFixed(2)),
        impuestos: parseFloat(impuestos.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        fecha_entrega: estado === 'recibida' ? fecha : null,
        created_at: fecha,
        updated_at: fecha,
        items: {
          create: itemsSeleccionados
        }
      }
    });
    ordenesCompraCreadas.push(ordenCompra);
  }
  console.log(`✅ ${ordenesCompraCreadas.length} Órdenes de compra creadas`);

  // 8. Crear 50 Movimientos de Stock
  const TIPOS_MOVIMIENTO: TipoMovimientoStock[] = ['entrada_compra', 'salida_venta', 'ajuste_manual'];
  const movimientosCreados = [];
  for(let i = 0; i < 50; i++) {
    const producto = getRandomItem(productosCreados);
    const tipo = getRandomItem(TIPOS_MOVIMIENTO);
    const cantidad = Math.floor(Math.random() * 30) + 5;
    
    // Solo para historial, no afectamos el stock actual del producto que ya está bien
    const stockAnterior = Math.floor(Math.random() * 100);
    const stockNuevo = tipo === 'salida_venta' ? stockAnterior - cantidad : stockAnterior + cantidad;

    const mov = await prisma.movimientoStock.create({
      data: {
        producto_id: producto.id,
        tipo: tipo,
        cantidad: cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: Math.max(0, stockNuevo),
        usuario_id: admin.id,
        created_at: randomDate(threeMonthsAgo, today)
      }
    });
    movimientosCreados.push(mov);
  }
  console.log(`✅ ${movimientosCreados.length} Movimientos de stock creados`);

  // Estadística final
  const countOrders = await prisma.orden.count();
  console.log(`📊 Total de órdenes en BD: ${countOrders}`);
  // Configuraciones iniciales
  const configuraciones = [
    { clave: 'TAX_RATE', valor: '18', descripcion: 'Impuesto IGV (%)' },
    { clave: 'DELIVERY_COST', valor: '10.00', descripcion: 'Costo de envío estándar (S/)' },
    { clave: 'CONTACT_PHONE', valor: '+51 999 888 777', descripcion: 'Teléfono de contacto' },
    { clave: 'CONTACT_EMAIL', valor: 'ventas@yamboly.com', descripcion: 'Correo electrónico de contacto' },
  ];

  for (const conf of configuraciones) {
    await prisma.configuracion.upsert({
      where: { clave: conf.clave },
      update: {},
      create: conf
    });
  }
  console.log('✅ Configuraciones iniciales creadas');

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