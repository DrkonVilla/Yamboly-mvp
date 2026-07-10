import { Request, Response, NextFunction } from 'express';
import { generateOrdersReport, generateInventoryReport } from '../services/report.service';

export const downloadOrdersReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    await generateOrdersReport(
      res,
      startDate as string,
      endDate as string
    );
  } catch (error) {
    next(error);
  }
};

export const downloadInventoryReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await generateInventoryReport(res);
  } catch (error) {
    next(error);
  }
};