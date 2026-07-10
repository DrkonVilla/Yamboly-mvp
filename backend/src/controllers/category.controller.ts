import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoryService.getAllCategories(includeInactive);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.updateCategory(id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await categoryService.deleteCategory(id);
    res.json({ success: true, message: 'Categoría desactivada' });
  } catch (error) {
    next(error);
  }
};