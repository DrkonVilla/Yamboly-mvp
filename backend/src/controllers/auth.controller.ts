import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { prisma } from '../config/db';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, nombre: true, apellido: true, rol: true },
    });
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};