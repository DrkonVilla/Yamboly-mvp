import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  // Errores de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `El campo ${err.meta?.target} ya existe`,
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
  });
};