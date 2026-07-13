import { Request, Response, NextFunction } from 'express';
import * as supplierService from '../services/supplier.service';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const suppliers = await supplierService.getAllSuppliers(includeInactive);
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const supplier = await supplierService.getSupplierById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const supplier = await supplierService.updateSupplier(id, req.body);
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await supplierService.deleteSupplier(id);
    res.json({ success: true, message: 'Proveedor desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
};
