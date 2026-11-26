import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const camposDaSala = {
  id: true,
  nome: true,
  capacidade: true,
  descricao: true,
  preco: true,
  idBloco: true,
  bloco: { select: { nome: true } },
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.SalaSelect;

export type SalaSelecionada = Prisma.SalaGetPayload<{ select: typeof camposDaSala }>;

export async function listarSalas(): Promise<SalaSelecionada[]> {
  return prisma.sala.findMany({ select: camposDaSala, orderBy: { nome: "asc" } });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada | null> {
  return prisma.sala.findUnique({ where: { id }, select: camposDaSala });
}

export async function criarSala(dadosDaSala: Prisma.SalaUncheckedCreateInput): Promise<SalaSelecionada> {
  return prisma.sala.create({ data: dadosDaSala, select: camposDaSala });
}

export async function atualizarSala(id: number, dadosDaSala: Prisma.SalaUncheckedUpdateInput): Promise<SalaSelecionada> {
  return prisma.sala.update({ where: { id }, data: dadosDaSala, select: camposDaSala });
}

export async function removerSala(id: number): Promise<void> {
  await prisma.sala.delete({ where: { id } });
}

export async function contarSalasDoBloco(idBloco: number): Promise<number> {
  return prisma.sala.count({ where: { idBloco } });
}
