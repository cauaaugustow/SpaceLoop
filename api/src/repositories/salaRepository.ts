import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const relacoesDaSala = {
  bloco: { select: { nome: true } },
} satisfies Prisma.SalaInclude;

export type SalaSelecionada = Prisma.SalaGetPayload<{ include: typeof relacoesDaSala }>;

export async function listarSalas(): Promise<SalaSelecionada[]> {
  return prisma.sala.findMany({ include: relacoesDaSala, orderBy: { nome: "asc" } });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada | null> {
  return prisma.sala.findUnique({ where: { id }, include: relacoesDaSala });
}

export async function criarSala(dadosDaSala: Prisma.SalaUncheckedCreateInput): Promise<SalaSelecionada> {
  return prisma.sala.create({ data: dadosDaSala, include: relacoesDaSala });
}

export async function atualizarSala(id: number, dadosDaSala: Prisma.SalaUncheckedUpdateInput): Promise<SalaSelecionada> {
  return prisma.sala.update({ where: { id }, data: dadosDaSala, include: relacoesDaSala });
}

export async function removerSala(id: number): Promise<void> {
  await prisma.sala.delete({ where: { id } });
}

export async function contarSalasDoBloco(idBloco: number): Promise<number> {
  return prisma.sala.count({ where: { idBloco } });
}
