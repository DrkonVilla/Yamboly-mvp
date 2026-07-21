import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export const getAllClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await userService.getAllClients();
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await userService.createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const client = await userService.updateClient(id, req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await userService.deleteClient(id);
    res.json({ success: true, message: 'Cliente desactivado' });
  } catch (error) {
    next(error);
  }
};
