# Manual de Uso — Yámboly MVP

## 1. Acceso a la Aplicación

| Servicio | URL |
|----------|-----|
| Frontend (tienda) | http://localhost:80 |
| Backend (API) | http://localhost:80/api/v1 |
| Prisma Studio | `docker compose exec backend npx prisma studio` |

---

## 2. Credenciales de Prueba

### Administrador
| Campo | Valor |
|-------|-------|
| Email | `admin@yamboly.com` |
| Contraseña | `Admin2026!` |
| Rol | admin |

### Clientes de prueba
| Nombre | Email | Contraseña |
|--------|-------|------------|
| Ana García | `cliente1@mail.com` | `password123` |
| Carlos Pérez | `cliente2@mail.com` | `password123` |
| María López | `cliente3@mail.com` | `password123` |
| Luis Martínez | `cliente4@mail.com` | `password123` |

---

## 3. Roles de Usuario

### Cliente
- Navegar catálogo de productos
- Filtrar por categoría, precio, disponibilidad, sabor
- Agregar productos al carrito
- Realizar checkout (simulado)
- Ver historial de órdenes
- Agregar/quitar productos de favoritos (Wishlist)

### Administrador (todo lo del cliente +)
- Panel de administración en `/admin`
- Dashboard con KPIs (ingresos, órdenes, productos)
- Gestión de productos (CRUD)
- Gestión de órdenes
- Reportes

---

## 4. Métodos de Pago (Simulados)

| Método | Cómo probarlo |
|--------|---------------|
| **Tarjeta** | Usar número `4111 1111 1111 1111` → éxito. `4000 0000 0000 0000` → error "Fondos insuficientes" |
| **Yape** | QR simulado. Click "Simular pago Yape" → espera 3s → éxito |
| **PayPal** | Click "Confirmar y Pagar" → espera 2s → éxito automático |
| **Culqi** | Llenar correo + DNI + celular → loading escalonado → éxito |
| **Contraentrega** | Pago al recibir, sin validación adicional |

---

## 5. Navegación del Frontend

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home / Catálogo | Hero banner + grid de productos con filtros y búsqueda |
| `/product/:id` | Detalle de producto | Galería multi-imagen, rating, badges, productos relacionados |
| `/cart` | Carrito | Items + barra de progreso de envío gratis |
| `/checkout` | Checkout | 3 pasos: dirección → método de pago → confirmación |
| `/order-confirmation/:id` | Confirmación | Timeline de estado de orden |
| `/login` | Inicio de sesión | Login |
| `/register` | Registro | Registro de nuevo usuario |
| `/admin` | Dashboard admin | KPIs y estadísticas |
| `/admin/products` | Productos admin | CRUD de productos |
| `/admin/orders` | Órdenes admin | Lista de órdenes |
| `/admin/reports` | Reportes admin | Reportes de ventas |

---

## 6. Funcionalidades del Catálogo

### Filtros (sidebar)
- **Categoría**: checkboxes múltiples (muestra 5 iniciales + botón "Ver más")
- **Precio**: dos sliders de rango (mínimo y máximo)
- **Disponibilidad**: toggle "Solo en stock"
- **Sabor**: chips seleccionables (Chocolate, Vainilla, Lúcuma, Fresa, Chicha Morada)
- **Búsqueda**: campo de texto en sidebar (desktop) o arriba (móvil)

### Ordenamiento
- Relevancia (default)
- Precio ↑ / Precio ↓
- A-Z

### URL params
Los filtros se sincronizan con la URL:
```
/?categoria_ids=1,2&minPrice=5&maxPrice=25&inStock=true&sabores=Vainilla&sort=precio_venta_asc
```

### Chips de filtros activos
Se muestran arriba del grid con botón de eliminar individual y botón "Limpiar todos".

---

## 7. Badges de Producto

| Badge | Condición |
|-------|-----------|
| **Oferta** | El producto tiene `precio_oferta` |
| **Más vendido** | `product.id % 7 === 0` |
| **Nuevo** | `product.id % 11 === 0` |

Solo se muestra un badge a la vez. Prioridad: Oferta > Más vendido > Nuevo.

---

## 8. Wishlist (Favoritos)

- Click en el ícono 🤍 sobre la imagen del producto para agregar a favoritos
- Cambia a ❤️ cuando está en la wishlist
- Los favoritos se persisten en localStorage

---

## 9. Barra de Envío Gratis

- Umbral: S/ 50.00
- Si el subtotal es menor: muestra "Te faltan S/X para envío gratis" con barra de progreso
- Si el subtotal es mayor o igual: muestra "✅ Envío gratis desbloqueado" con barra verde

---

## 10. Comandos Docker Útiles

```bash
# Iniciar todos los servicios
docker compose up -d

# Reconstruir todo desde cero
docker compose build --no-cache
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f backend
docker compose logs -f frontend

# Detener y limpiar volúmenes (borra la BD)
docker compose down -v

# Ejecutar seed manualmente
docker compose exec backend npx prisma db seed

# Abrir Prisma Studio
docker compose exec backend npx prisma studio --host 0.0.0.0
```

---

## 11. Tarjetas de Prueba (Checkout)

| Número | Resultado |
|--------|-----------|
| `4111 1111 1111 1111` | ✅ Pago aprobado |
| `4000 0000 0000 0000` | ❌ Tarjeta declinada (fondos insuficientes) |

---

## 12. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + Zustand |
| Backend | Node.js + Express + Prisma + TypeScript |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker + Docker Compose |
| Proxy | Nginx (proxy inverso /api/ → backend) |
