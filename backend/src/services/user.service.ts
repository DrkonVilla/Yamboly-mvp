import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

export const getAllClients = async () => {
  return prisma.usuario.findMany({
    where: { rol: 'cliente' },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      activo: true,
      created_at: true,
      _count: {
        select: { ordenes: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
};

export const createClient = async (data: any) => {
  const hash = await bcrypt.hash(data.contrasena || 'password123', 10);
  return prisma.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido || '',
      email: data.email,
      contrasena_hash: hash,
      rol: 'cliente',
      activo: true
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      activo: true
    }
  });
};

export const updateClient = async (id: number, data: any) => {
  const updateData: any = {
    nombre: data.nombre,
    apellido: data.apellido,
    email: data.email,
  };
  
  if (data.contrasena) {
    updateData.contrasena_hash = await bcrypt.hash(data.contrasena, 10);
  }

  return prisma.usuario.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nombre: true,
      email: true,
      activo: true
    }
  });
};

export const deleteClient = async (id: number) => {
  return prisma.usuario.update({
    where: { id },
    data: { activo: false }
  });
};
