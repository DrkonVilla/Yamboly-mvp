import { Request, Response, NextFunction } from 'express';
import * as purchaseOrderService from '../services/purchase-order.service';
import { purchaseOrderFiltersSchema, createPurchaseOrderSchema, updatePurchaseOrderStatusSchema } from '../schemas/purchase-order.schema';

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = purchaseOrderFiltersSchema.parse(req.query);
    const result = await purchaseOrderService.getPurchaseOrders(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const order = await purchaseOrderService.getPurchaseOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden de compra no encontrada' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPurchaseOrderSchema.parse(req.body);
    const order = await purchaseOrderService.createPurchaseOrder(data);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { estado } = updatePurchaseOrderStatusSchema.parse(req.body);
    const order = await purchaseOrderService.updatePurchaseOrderStatus(id, estado);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
