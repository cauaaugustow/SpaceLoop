import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const camposDoCliente = {
  id: true,
  nome: true,
  cpf: true,
  email: true,
  telefone: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.ClienteSelect;

export type ClienteSelecionado = Prisma.ClienteGetPayload<{ select: typeof camposDoCliente }>;

export async function listarClientes(): Promise<ClienteSelecionado[]> {
  return prisma.cliente.findMany({ select: camposDoCliente, orderBy: { nome: "asc" } });
}

export async function buscarClientePorId(id: number): Promise<ClienteSelecionado | null> {
  return prisma.cliente.findUnique({ where: { id }, select: camposDoCliente });
}

export async function buscarClientePorCpf(cpf: string): Promise<ClienteSelecionado | null> {
  return prisma.cliente.findUnique({ where: { cpf }, select: camposDoCliente });
}

export async function buscarClientePorEmail(email: string): Promise<ClienteSelecionado | null> {
  return prisma.cliente.findUnique({ where: { email }, select: camposDoCliente });
}

export async function criarCliente(dadosDoCliente: Prisma.ClienteCreateInput): Promise<ClienteSelecionado> {
  return prisma.cliente.create({ data: dadosDoCliente, select: camposDoCliente });
}

export async function atualizarCliente(id: number, dadosDoCliente: Prisma.ClienteUpdateInput): Promise<ClienteSelecionado> {
  return prisma.cliente.update({ where: { id }, data: dadosDoCliente, select: camposDoCliente });
}

export async function removerCliente(id: number): Promise<void> {
  await prisma.cliente.delete({ where: { id } });
}
