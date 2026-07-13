# Repartición de Tareas — Equipo Yámboly

**Objetivo**: Convertir el MVP actual en un sistema de gestión integral de heladería.
**Equipo**: Angy, Diego, Geraldine, Favian.
**Principio**: cero dependencias entre personas, cada uno puede trabajar en paralelo desde su propia rama.

---

## Antes de empezar (todos)

1. Alguien (o reunión de 15 min) agrega los modelos nuevos al `schema.prisma`:
   - Agregar `ejecutivo` y `proveedor` al enum `Rol`
   - Nuevos modelos: `Proveedor`, `Insumo`, `OrdenCompra`, `ItemsOrdenCompra`, `MovimientoStock`
   - Nuevo enum: `EstadoCompra`
   - Ejecutar `npx prisma migrate dev --name futuros_modulos`
   - Hacer commit y push a `main`
2. Cada integrante crea su rama desde `main`: `angy/modulo-proveedores`, `diego/compras-stock`, `geraldine/roles-usuarios`, `favian/devops`

---

## Angy — Módulo Proveedores + Insumos + Mejora Login

### Schema (modelos a definir)
- `Proveedor` (id, ruc, nombre, contacto, telefono, email, direccion, activo, created_at, updated_at)
- `Insumo` (id, proveedor_id, nombre, descripcion, unidad_medida, precio_unit, stock_actual, stock_minimo, activo, created_at, updated_at)

### Seed
- 5 proveedores de prueba (RUC, nombre, contacto, teléfono, email, dirección)
- 15 insumos asociados a esos proveedores (nombre, unidad de medida, precio, stock)

### Backend (8 archivos nuevos)

| Archivo | Contenido |
|---------|-----------|
| `backend/src/routes/supplier.routes.ts` | GET, GET/:id, POST, PUT, DELETE /suppliers |
| `backend/src/routes/supply.routes.ts` | GET, GET/:id, POST, PUT, PUT/:id/stock /supplies |
| `backend/src/controllers/supplier.controller.ts` | getAll, getById, create, update, remove |
| `backend/src/controllers/supply.controller.ts` | getAll, getById, create, update, updateStock |
| `backend/src/services/supplier.service.ts` | Consultas Prisma para proveedores |
| `backend/src/services/supply.service.ts` | Consultas Prisma para insumos |
| `backend/src/schemas/supplier.schema.ts` | Validación Zod para proveedores |
| `backend/src/schemas/supply.schema.ts` | Validación Zod para insumos |

### Frontend — Páginas nuevas (2)

**`frontend/src/pages/admin/AdminSuppliers.jsx`**
- Tabla responsive: columnas RUC, nombre, contacto, teléfono, email, estado (activo/inactivo con badge), acciones
- Modal de crear/editar proveedor con todos los campos
- Botón eliminar con ConfirmDialog
- Búsqueda por nombre o RUC (SearchInput)
- Paginación (Pagination component)
- Loading state en botones (LoadingButton)

**`frontend/src/pages/admin/AdminSupplies.jsx`**
- Tabla: nombre, proveedor (nombre), unidad_medida, precio_unit, stock_actual, stock_minimo, badge de alerta si stock < stock_minimo
- Modal de crear/editar insumo con selector de proveedor (dropdown desde API)
- Ajuste rápido de stock desde botón en fila (modal con cantidad nueva + motivo)
- Filtro por proveedor
- Búsqueda por nombre de insumo
- Paginación

### Frontend — Mejora de vistas existentes (3)

**`frontend/src/pages/admin/AdminProducts.jsx`**
- Agregar columna "Stock" en la tabla con badge rojo si stock <= stock_minimo
- Agregar filtro "Stock bajo" que muestre solo productos con stock crítico
- En el modal de editar producto, mostrar campo stock y stock_minimo

**`frontend/src/pages/ProductDetail.jsx`**
- Mostrar "Solo quedan X unidades" con ícono de alerta si stock < 10
- Mostrar badge "Nuevo" con color verde si producto fue creado hace menos de 7 días (comparar created_at)
- Si stock = 0, deshabilitar botón "Agregar al carrito" y mostrar "Agotado"

**`frontend/src/components/AdminLayout.jsx`**
- Agregar links en el sidebar: "Proveedores" (`/admin/suppliers`), "Insumos" (`/admin/supplies`)
- Usar iconos coherentes con los existentes

### Frontend — Mejora de Login (1 vista)

**`frontend/src/pages/LoginPage.jsx`**
- Diseño dividido 50/50:
  - **Lado izquierdo**: formulario de login centrado verticalmente con logo de Yámboly arriba, campos email y contraseña con íconos, botón "Iniciar sesión" con color corporativo
  - **Lado derecho**: imagen de fondo de helado + superposición con nombre "Yámboly" y frase tipo "Los mejores helados artesanales, directo a tu puerta"
- Animaciones: fade-in del formulario al cargar, input focus con borde color corporativo, botón con transición de color en hover
- Mensajes de error: toast o alerta inline con diseño bonito (fondo rojo suave, ícono de error, borde redondeado)
- Loader: spinner con logo pequeño de Yámboly mientras la autenticación está en curso
- Enlaces debajo del formulario: "¿Olvidaste tu contraseña?" (sin funcionalidad, solo placeholder visual), "¿No tienes cuenta? Regístrate" (sin funcionalidad)

---

## Diego — Módulo Órdenes de Compra + Stock + Panel Proveedor

### Schema (modelos a definir)
- `OrdenCompra` (id, proveedor_id, usuario_id, estado: EstadoCompra, subtotal, impuestos, total, fecha_entrega?, created_at, updated_at)
- `ItemsOrdenCompra` (id, orden_compra_id, insumo_id, cantidad, precio_unitario, subtotal)
- `MovimientoStock` (id, producto_id, tipo, cantidad, stock_anterior, stock_nuevo, referencia_id?, referencia_tipo?, usuario_id?, created_at)
- Enum `EstadoCompra` (pendiente, aprobada, recibida, cancelada)

### Seed
- 20 órdenes de compra distribuidas en distintos estados (10 pendientes, 5 aprobadas, 3 recibidas, 2 canceladas)
- 50 movimientos de stock históricos (entradas por compra, salidas por venta, ajustes manuales)

### Backend (8 archivos nuevos)

| Archivo | Contenido |
|---------|-----------|
| `backend/src/routes/purchase-order.routes.ts` | GET, GET/:id, POST, PUT/:id/status /purchase-orders |
| `backend/src/routes/stock.routes.ts` | GET /stock/movements, GET /stock/movements/product/:id, POST /stock/adjust |
| `backend/src/controllers/purchase-order.controller.ts` | getAll, getById, create, updateStatus |
| `backend/src/controllers/stock.controller.ts` | getMovements, getMovementsByProduct, adjustStock |
| `backend/src/services/purchase-order.service.ts` | Consultas Prisma para órdenes de compra |
| `backend/src/services/stock.service.ts` | Consultas Prisma para movimientos de stock |
| `backend/src/schemas/purchase-order.schema.ts` | Validación Zod para órdenes de compra |
| `backend/src/schemas/stock.schema.ts` | Validación Zod para movimientos y ajustes |

### Frontend — Páginas nuevas admin (2)

**`frontend/src/pages/admin/AdminPurchaseOrders.jsx`**
- Tabla: ID, proveedor (nombre), fecha creación, estado (StatusBadge con colores: pendiente=amarillo, aprobada=azul, recibida=verde, cancelada=rojo), total
- Modal "Crear orden de compra":
  - Paso 1: Seleccionar proveedor (dropdown desde API)
  - Paso 2: Agregar insumos (selector con buscador, cantidad, precio se auto-rellena)
  - Paso 3: Resumen con subtotales, impuestos y total calculado automáticamente
  - Botón "Crear orden"
- Cada fila expandible al hacer clic: lista de items (insumo, cantidad, precio unitario, subtotal), línea de tiempo de cambios de estado
- Botón "Cambiar estado" con dropdown (aprobar/recibir/cancelar según estado actual)
- Filtros: por estado (multiselect), por proveedor, por rango de fechas (DateRangePicker)
- Búsqueda por ID de orden
- Paginación

**`frontend/src/pages/admin/AdminStock.jsx`**
- Tabla: producto (nombre con imagen pequeña), categoría, stock actual, stock mínimo, badge de alerta si stock crítico (fondo rojo), badge de advertencia si stock < 2x mínimo (fondo amarillo)
- Botón "Ajustar stock" en cada fila: modal con campo "Nueva cantidad" y "Motivo del ajuste", muestra stock anterior y nuevo
- Historial expandible por producto: tabla de movimientos (fecha, tipo, cantidad, stock anterior → stock nuevo, referencia, usuario)
- Filtro: "Stock crítico" (solo productos con stock <= stock_minimo), "Todos los productos"
- Búsqueda por nombre de producto
- Paginación

### Frontend — Páginas nuevas proveedor (2)

**`frontend/src/pages/provider/ProviderDashboard.jsx`** (ruta `/proveedor`)
- Header con nombre de la empresa y RUC (desde datos del usuario/proveedor)
- Tarjetas de resumen: órdenes pendientes, aprobadas, recibidas (con números grandes)
- Últimas 5 órdenes de compra en tabla compacta
- Botón "Ver todas las órdenes" que redirige a `/proveedor/orders`

**`frontend/src/pages/provider/ProviderOrders.jsx`** (ruta `/proveedor/orders`)
- Tabla de órdenes de compra filtradas al proveedor logueado (solo ve las suyas)
- Mismas columnas que AdminPurchaseOrders pero sin acciones de admin
- Botón "Confirmar entrega" visible solo cuando estado = "aprobada"
- Detalle expandible igual que en admin

### Frontend — Mejora de vistas existentes (3)

**`frontend/src/pages/admin/AdminOrders.jsx`**
- Agregar detalle expandible al hacer clic en fila:
  - Lista de productos comprados (nombre, cantidad, precio unitario, subtotal)
  - Dirección de envío completa
  - Historial de cambios de estado con timestamps (quién cambió y cuándo)
  - Método de pago utilizado (tarjeta, yape, rappi, etc.)
- Agregar búsqueda por ID de orden o nombre de cliente (SearchInput)
- Agregar paginación

**`frontend/src/pages/CartPage.jsx`**
- Imágenes de productos más grandes (miniatura de 80x80px en lugar de 40x40)
- Botones "+" y "-" con animación sutil (scale + transición)
- Mostrar subtotal por item alineado a la derecha
- Barra de progreso de envío gratis: al llegar al monto mínimo, mostrar mensaje "¡Estás ahorrando S/ X.XX en envío!"
- Si el carrito está vacío, mostrar ilustración + "Tu carrito está vacío" + botón "Ir a la tienda"

**`frontend/src/pages/OrderConfirmation.jsx`**
- Si la orden está cancelada, mostrar timeline con todos los pasos en gris y el paso cancelado en rojo con ícono ✕
- Agregar botón "Volver a comprar" que toma los mismos productos de la orden cancelada y los agrega al carrito actual
- Mostrar el método de pago utilizado con ícono

---

## Geraldine — Roles + Usuarios + Mejoras Transversales + HomePage Comercial

### Schema
- Agregar `ejecutivo` y `proveedor` al enum `Rol` existente

### Seed
- 3 usuarios con rol `ejecutivo` (nombre, email, contraseña hasheada)
- 2 usuarios con rol `proveedor` vinculados a proveedores (mismo nombre que el proveedor)

### Backend (4 archivos nuevos + modificaciones)

| Archivo | Contenido |
|---------|-----------|
| `backend/src/routes/user.routes.ts` | GET, GET/:id, POST, PUT/:id, PUT/:id/status, DELETE/:id /users |
| `backend/src/controllers/user.controller.ts` | getAll, getById, create, update, toggleStatus, remove |
| `backend/src/services/user.service.ts` | Consultas Prisma para usuarios |
| `backend/src/schemas/user.schema.ts` | Validación Zod para usuarios |

Modificaciones en backend existente:
- **`backend/src/middleware/requireRole.ts`** (nuevo): middleware que acepta `requireRole(['admin', 'ejecutivo'])`, lee el rol del token JWT y deniega si no coincide
- **`backend/src/routes/auth.routes.ts`**: modificar login para que devuelva `{ token, user: { id, nombre, email, rol } }`
- **`backend/src/routes/dashboard.routes.ts`**: agregar protección con `requireRole(['admin', 'ejecutivo'])`

### Frontend — Páginas nuevas (1)

**`frontend/src/pages/admin/AdminUsers.jsx`**
- Tabla: foto (inicial del nombre en círculo), nombre, email, rol (StatusBadge con color por rol: admin=rojo, ejecutivo=azul, proveedor=verde, cliente=gris), estado (activo/inactivo con toggle pill), fecha de registro
- Modal "Crear usuario": campos nombre, email, contraseña, selector de rol, toggle activo
- Modal "Editar usuario": mismos campos (contraseña opcional, si se deja vacía no cambia)
- Botón "Activar/Desactivar" con ConfirmDialog
- Botón "Eliminar" solo si el usuario no tiene órdenes asociadas (validar en backend, mostrar mensaje si no se puede)
- Búsqueda por nombre o email
- Paginación

### Frontend — Filtrado de menú por rol

Modificar **`frontend/src/components/AdminLayout.jsx`**:
- Leer el rol del usuario desde el store de autenticación (o desde el token decodificado)
- Renderizar condicionalmente las opciones del sidebar:
  - **admin**: Dashboard, Productos, Órdenes, Usuarios, Proveedores, Insumos, Órdenes de Compra, Stock, Reportes
  - **ejecutivo**: Dashboard, Productos (sin botón crear/editar), Órdenes, Reportes, Stock
  - **proveedor**: no ve el sidebar de admin, se redirige automáticamente a `/proveedor`

### Frontend — Mejora de HomePage (comercial)

**`frontend/src/pages/HomePage.jsx`**
Mantener funcionalidad actual (productos, filtros, wishlist) y agregar secciones comerciales:

**Hero/Banner principal** (arriba de todo):
- Imagen de fondo de helado (usar una de las imágenes de productos o placeholder)
- Texto grande: "Los mejores helados artesanales, directo a tu puerta"
- Subtítulo: "Hechos con ingredientes naturales y mucho amor"
- CTA: "Ordena ahora" → scroll suave a la sección de productos
- Decoración: clip-path diagonal en la parte inferior

**Sección "Los Más Vendidos"** (entre hero y productos):
- Título: "🔥 Los más vendidos"
- Grid de 4 tarjetas con los productos de mayor rating
- Cada tarjeta: imagen grande (cubriendo todo el ancho), nombre, precio, estrellas de rating, botón "Lo quiero" que redirige a ProductDetail
- Diseño limpio, sin bordes, sombra sutil en hover

**Sección "Clientes Satisfechos"** (después de productos, antes de footer):
- Título: "💬 Lo que dicen nuestros clientes"
- Carrusel horizontal con 4-6 testimonios ficticios
- Cada testimonio: foto circular (usar placeholder tipo `https://i.pravatar.cc/100?u=nombre`), nombre, reseña corta (2 líneas), 5 estrellas amarillas
- Rotación automática cada 5 segundos con transición fade
- Puntos indicadores abajo del carrusel
- Botón pausa/reproducir

**Sección "Contáctanos"** (antes del footer):
- Título: "📞 Contáctanos"
- Dos columnas:
  - **Izquierda**: formulario (nombre, email, mensaje) con textarea, botón "Enviar mensaje". Al hacer clic, toast "¡Mensaje enviado! Te responderemos pronto." (solo UI, sin backend)
  - **Derecha**: información de contacto ficticia: ícono de ubicación + "Av. Helados 123, Lima", ícono de teléfono + "+51 999 888 777", ícono de whatsapp + "Escríbenos al WhatsApp", ícono de reloj + "Lun-Dom: 10:00 am - 10:00 pm"
- Fondo de color suave diferente al resto de la página

**Mejoras adicionales en HomePage**:
- Skeletons más realistas (con forma de tarjeta, imagen placeholder gris con shimmer)
- Animación fade-in al cargar productos (clase CSS `animate-fade-in`)
- Si no hay resultados del filtro: "No encontramos productos con esos filtros 😕" con icono y botón "Limpiar filtros"
- Transiciones suaves entre secciones al hacer scroll

### Componentes genéricos (5 nuevos)

Crear en `frontend/src/components/`:

| Componente | Props | Comportamiento |
|------------|-------|----------------|
| `ConfirmDialog.jsx` | `isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, variant` | Modal con overlay, botón confirmar (rojo o azul según variant), botón cancelar. Cierra al hacer clic fuera. |
| `Pagination.jsx` | `currentPage, totalPages, onPageChange, pageSize, onPageSizeChange` | Botones anterior/siguiente, números de página (con elipsis si muchas), selector de items por página (10, 25, 50, 100) |
| `SearchInput.jsx` | `value, onChange, placeholder, debounceMs` | Input con icono de lupa, llama onChange con el valor después de 300ms sin escribir. Botón "X" para limpiar. |
| `StatusBadge.jsx` | `status, size` | Badge redondeado con color según estado. Colores definidos en mapa de constantes. |
| `DateRangePicker.jsx` | `startDate, endDate, onChange` | Dos inputs de tipo date con labels "Desde" y "Hasta". Valida que desde <= hasta. |
| `LoadingButton.jsx` | `isLoading, children, ...rest` | Botón que muestra spinner SVG animado + texto "Cargando..." cuando isLoading=true. Deshabilita el botón. |

### Frontend — Mejora de Dashboard + Reportes (2 vistas)

**`frontend/src/pages/admin/DashboardPage.jsx`**
- Agregar KPIs nuevos arriba:
  - Total proveedores registrados
  - Órdenes de compra del mes (pendientes + aprobadas)
  - Productos con stock crítico (link a AdminStock)
- Gráfico de barras simple con ventas de los últimos 7 días (usar canvas nativo o Chart.js si ya está en el proyecto)
- Tabla "Últimas 5 órdenes recientes" con columna de estado (StatusBadge) y enlace a detalle

**`frontend/src/pages/admin/AdminReports.jsx`**
- Mantener reportes existentes (PDF)
- Agregar 3 nuevas secciones con tabs:
  1. **Ventas por producto**: tabla (producto, cantidad vendida, total generado), ordenable por columna
  2. **Ventas por categoría**: tabla (categoría, % del total de ventas, barra de progreso visual), ordenable
  3. **Ventas por canal**: tabla (Rappi, Tottus, Tambo, Web con montos y %)
- Cada sección tiene su propio DateRangePicker
- Botón "Exportar Excel" en cada sección (generar CSV descargable con encabezados y datos)

---

## Favian — DevOps + Despliegue + CI/CD

Favian **no toca código de la aplicación**. Solo infraestructura y automatización.

### Archivos a crear

| Archivo | Contenido |
|---------|-----------|
| `deploy.sh` | Script bash que: clona repo, ejecuta docker-compose up --build -d, corre migraciones, notifica éxito/fallo |
| `DEPLOY.md` | Guía paso a paso: requisitos del VPS, comandos, variables de entorno, solución de problemas comunes |
| `.github/workflows/deploy.yml` | GitHub Actions: trigger en push a main, jobs: build backend, build frontend, deploy via SSH al VPS |
| `.env.example` | Template con todas las variables: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT, NODE_ENV |
| `docker-compose.prod.yml` | (Opcional) Variante de producción con volúmenes persistentes, límites de memoria/CPU, restart: always |
| `scripts/backup-db.sh` | Backup diario de PostgreSQL: pg_dump → comprimir → subir a S3/guardar local con rotación de 7 días |
| `scripts/healthcheck.sh` | Script que verifica GET /health y reinicia el contenedor si falla 3 veces consecutivas |

### Responsabilidades detalladas

**1. Docker Compose final**
- Asegurar que db, backend y frontend se levanten correctamente con `docker-compose up --build`
- Healthchecks: PostgreSQL (pg_isready), backend (curl /health)
- Red interna entre servicios
- Volúmenes para datos de BD
- Archivo `.env.example` con TODAS las variables necesarias documentadas

**2. Nginx — Producción**
- Revisar y mejorar `nginx/default.conf`:
  - Cabeceras de seguridad: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options
  - Compresión gzip para JS, CSS, HTML, JSON
  - Cacheo de archivos estáticos del frontend (max-age 1 año con hash en nombre)
  - Proxy reverso al backend con timeout adecuado
  - Límite de tamaño de body (para imágenes/subida de archivos)
- Redirección HTTP → HTTPS

**3. Despliegue en VPS**
- `deploy.sh` script que:
  ```
  git pull origin main
  docker-compose down
  docker-compose up --build -d
  docker-compose exec backend npx prisma migrate deploy
  docker system prune -f  # limpiar imágenes viejas
  ```
- `DEPLOY.md` con:
  - Requisitos del servidor (Ubuntu 22.04+, Docker 24+, 2GB RAM mínimo)
  - Pasos: clonar repo, configurar .env, ejecutar deploy.sh
  - Solución de problemas (puertos ocupados, BD no conecta, etc.)

**4. CI/CD — GitHub Actions**
- Workflow en `.github/workflows/deploy.yml`:
  ```yaml
  on: push to main
  jobs:
    build:
      - npm ci en backend/
      - npm run build en backend/
      - npm ci en frontend/
      - npm run build en frontend/
    deploy:
      - ssh al VPS
      - ejecutar deploy.sh
  ```
- Usar GitHub Secrets para: SSH_KEY, VPS_HOST, VPS_USER

**5. SSL/HTTPS**
- Configurar Certbot con Nginx para SSL gratuito (incluir en DEPLOY.md)
- O configurar Nginx Proxy Manager si el VPS lo permite
- Redirección automática 301 de HTTP → HTTPS

**6. Monitoreo básico**
- Endpoint `GET /health` en backend que verifique:
  - Conexión a BD (Prisma.$queryRaw`SELECT 1`)
  - Estado del servidor (uptime, memoria)
  - Responder 200 OK con JSON `{ status: "ok", db: "connected", uptime: 1234 }`
- Logs de Docker con rotación (logrotate config)
- Opcional: UptimeRobot gratuito monitoreando la URL cada 5 min

---

## Resumen final

| Persona | Archivos nuevos | Vistas mejorar | Dependencias |
|---------|----------------|----------------|-------------|
| **Angy** | ~10 (schema + 8 backend + 2 frontend) | 4 (AdminProducts, ProductDetail, AdminLayout, LoginPage) | ❌ Ninguna |
| **Diego** | ~12 (schema + 8 backend + 4 frontend) | 3 (AdminOrders, CartPage, OrderConfirmation) | ❌ Ninguna |
| **Geraldine** | ~11 (schema + 4 backend + 2 frontend + 5 componentes) | 4 (DashboardPage, AdminReports, HomePage comercial, AdminLayout menú por rol) | ❌ Ninguna |
| **Favian** | ~7 (infraestructura + scripts + docs) | 0 | ❌ Ninguna |

**Total**: ~40 archivos nuevos, 11 vistas mejoradas, **0 dependencias entre personas**.
