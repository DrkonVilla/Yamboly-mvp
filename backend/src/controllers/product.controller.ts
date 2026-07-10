import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { productFiltersSchema } from '../schemas/product.schema';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = productFiltersSchema.parse(req.query);
    const result = await productService.getProducts(filters);
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

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.getProductById(id);
    if (!product || !product.activo) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    const product = await productService.getProductBySku(sku);
    if (!product || !product.activo) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.updateProduct(id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await productService.deleteProduct(id);
    res.json({ success: true, message: 'Producto desactivado' });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getProductsWithLowStock();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};