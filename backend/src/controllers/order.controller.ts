import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { createOrderSchema } from '../schemas/order.schema';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validatedData = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder({
      usuario_id: userId,
      items: validatedData.items,
      direccion_envio: validatedData.direccion_envio,
      metodo_pago: validatedData.metodo_pago,
      canal: validatedData.canal,
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user!.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const order = await orderService.getOrderById(id, req.user!.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estado, canal } = req.query;
    const orders = await orderService.getAllOrders({
      estado: estado as string,
      canal: canal as string,
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ success: false, message: 'Estado es requerido' });
    }
    const order = await orderService.updateOrderStatus(id, estado);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};