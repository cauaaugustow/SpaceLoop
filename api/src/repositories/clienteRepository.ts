import prisma from "../config/prisma.js";

export async function buscarClientePorId(id: number): Promise<{ id: number } | null> {
  return prisma.cliente.findUnique({ where: { id }, select: { id: true } });
}
