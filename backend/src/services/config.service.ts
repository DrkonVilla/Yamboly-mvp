import { prisma } from '../config/db';

export const getAllConfigs = async () => {
  return prisma.configuracion.findMany({
    orderBy: { clave: 'asc' }
  });
};

export const updateConfig = async (clave: string, valor: string) => {
  return prisma.configuracion.update({
    where: { clave },
    data: { valor }
  });
};
