import prisma from "../config/prisma.js";

export async function buscarBlocoPorId(id: number): Promise<{ id: number } | null> {
  return prisma.bloco.findUnique({ where: { id }, select: { id: true } });
}
