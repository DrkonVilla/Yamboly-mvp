import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await dashboardService.getDashboardStats(
      startDate as string | undefined,
      endDate as string | undefined
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};