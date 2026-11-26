import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectUser = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  cpf: true,
  criadoEm: true,
  atualizadoEm: true,
  eadmin: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioSelecionado = Prisma.UsuarioGetPayload<{ select: typeof selectUser }>;

export async function buscarUserPorEmail(email: string): Promise<UsuarioSelecionado | null> {
  return prisma.usuario.findUnique({ where: { email }, select: selectUser });
}

export async function buscarUserPorCpf(cpf: string): Promise<UsuarioSelecionado | null> {
  return prisma.usuario.findUnique({ where: { cpf }, select: selectUser });
}

export async function criarUser(dados: Prisma.UsuarioCreateInput): Promise<UsuarioSelecionado> {
  return prisma.usuario.create({ data: dados, select: selectUser });
}

export async function listarUsers(): Promise<UsuarioSelecionado[]> {
  return prisma.usuario.findMany({ select: selectUser });
}

export async function buscarUserPorId(id: number): Promise<UsuarioSelecionado | null> {
  return prisma.usuario.findUnique({ where: { id }, select: selectUser });
}

export async function atualizarUser(id: number, dados: Prisma.UsuarioUpdateInput): Promise<UsuarioSelecionado> {
  return prisma.usuario.update({ where: { id }, data: dados, select: selectUser });
}

export async function deletarUser(id: number): Promise<UsuarioSelecionado> {
  return prisma.usuario.delete({ where: { id }, select: selectUser });
}
