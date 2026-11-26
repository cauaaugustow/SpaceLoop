import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const camposDoUsuario = {
  id: true,
  nome: true,
  email: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioSelecionado = Prisma.UsuarioGetPayload<{ select: typeof camposDoUsuario }>;

export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioSelecionado | null> {
  return prisma.usuario.findUnique({ where: { email }, select: camposDoUsuario });
}

export async function criarUsuario(dadosDoUsuario: Prisma.UsuarioCreateInput): Promise<UsuarioSelecionado> {
  return prisma.usuario.create({ data: dadosDoUsuario, select: camposDoUsuario });
}

export async function buscarUsuarioPorId(id: number): Promise<UsuarioSelecionado | null> {
  return prisma.usuario.findUnique({ where: { id }, select: camposDoUsuario });
}
