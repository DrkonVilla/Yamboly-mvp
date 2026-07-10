import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export const registerUser = async (data: {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
}) => {
  const existingUser = await prisma.usuario.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.usuario.create({
    data: {
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      contrasena_hash: hashedPassword,
      rol: 'cliente', // Siempre cliente al registrarse
    },
  });

  // Generar token
  const token = generateToken(user.id, user.email, user.rol);

  return {
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    },
    token,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Credenciales incorrectas');
  }

  const isPasswordValid = await comparePassword(password, user.contrasena_hash);
  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas');
  }

  const token = generateToken(user.id, user.email, user.rol);

  return {
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
    },
    token,
  };
};