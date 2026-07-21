import { Request, Response, NextFunction } from 'express';
import * as configService from '../services/config.service';

export const getAllConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await configService.getAllConfigs();
    res.json({ success: true, data: configs });
  } catch (error) {
    next(error);
  }
};

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;
    const updated = await configService.updateConfig(clave, valor);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
