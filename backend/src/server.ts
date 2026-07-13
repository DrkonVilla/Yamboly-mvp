import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';
import purchaseOrderRoutes from './routes/purchase-order.routes';
import stockRoutes from './routes/stock.routes';
import { prisma } from './config/db';
import supplierRoutes from './routes/supplier.routes';
import supplyRoutes from './routes/supply.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === env.CORS_ORIGIN;
    if (isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/supplies', supplyRoutes);

// Health check
app.get('/api/v1/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

// Manejador de errores global (DEBE ir al final)
app.use(errorHandler);

// Iniciar servidor
app.listen(env.PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT}`);
  console.log(`📡 API base: /api/v1`);
  console.log(`🔐 Auth endpoints: /api/v1/auth`);
});

