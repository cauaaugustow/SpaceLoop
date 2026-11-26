import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectUser = {
  id: true,
  nome: true,
  email: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioSelecionado = Prisma.UsuarioGetPayload<{ select: typeof selectUser }>;

export async function buscarUserPorEmail(email: string): Promise<UsuarioSelecionado | null> {
  return prisma.usuario.findUnique({ where: { email }, select: selectUser });
}

export async function criarUser(dados: Prisma.UsuarioCreateInput): Promise<UsuarioSelecionado> {
  return prisma.usuario.create({ data: dados, select: selectUser });
}
