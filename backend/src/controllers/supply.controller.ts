import { Request, Response, NextFunction } from 'express';
import * as supplyService from '../services/supply.service';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proveedor_id = req.query.proveedor_id ? parseInt(req.query.proveedor_id as string) : undefined;
    const search = req.query.search as string | undefined;
    
    const supplies = await supplyService.getAllSupplies({ proveedor_id, search });
    res.json({ success: true, data: supplies });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const supply = await supplyService.getSupplyById(id);
    if (!supply) {
      return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
    }
    res.json({ success: true, data: supply });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supply = await supplyService.createSupply(req.body);
    res.status(201).json({ success: true, data: supply });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const supply = await supplyService.updateSupply(id, req.body);
    res.json({ success: true, data: supply });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await supplyService.deleteSupply(id);
    res.json({ success: true, message: 'Insumo desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const supply = await supplyService.adjustStock(id, req.body);
    res.json({ success: true, data: supply });
  } catch (error) {
    next(error);
  }
};
