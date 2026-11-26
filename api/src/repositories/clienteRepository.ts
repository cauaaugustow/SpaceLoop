import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectCliente = {
  id: true,
  nome: true,
  cpf: true,
  email: true,
  telefone: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.ClienteSelect;

export type ClienteSelecionado = Prisma.ClienteGetPayload<{ select: typeof selectCliente }>;

export async function listarClientes(): Promise<ClienteSelecionado[]> {
  return prisma.cliente.findMany({ select: selectCliente, orderBy: { nome: "asc" } });
}

export async function buscarClientePorId(id: number): Promise<ClienteSelecionado | null> {
  return prisma.cliente.findUnique({ where: { id }, select: selectCliente });
}

export async function buscarClientePorCpf(cpf: string): Promise<ClienteSelecionado | null> {
  return prisma.cliente.findUnique({ where: { cpf }, select: selectCliente });
}

export async function buscarClientePorEmail(email: string): Promise<ClienteSelecionado | null> {
  return prisma.cliente.findUnique({ where: { email }, select: selectCliente });
}

export async function criarCliente(dados: Prisma.ClienteCreateInput): Promise<ClienteSelecionado> {
  return prisma.cliente.create({ data: dados, select: selectCliente });
}

export async function atualizarCliente(id: number, dados: Prisma.ClienteUpdateInput): Promise<ClienteSelecionado> {
  return prisma.cliente.update({ where: { id }, data: dados, select: selectCliente });
}

export async function removerCliente(id: number): Promise<void> {
  await prisma.cliente.delete({ where: { id } });
}

export async function contarReservasDoCliente(idCliente: number): Promise<number> {
  return prisma.reserva.count({ where: { idCliente } });
}
