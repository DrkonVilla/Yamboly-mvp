import { Request, Response, NextFunction } from 'express';
import * as stockService from '../services/stock.service';
import { stockMovementFiltersSchema, createStockMovementSchema } from '../schemas/stock.schema';

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = stockMovementFiltersSchema.parse(req.query);
    const result = await stockService.getStockMovements(filters);
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

export const createStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createStockMovementSchema.parse(req.body);
    const movement = await stockService.createStockMovement(data);
    res.status(201).json({ success: true, data: movement });
  } catch (error) {
    next(error);
  }
};
