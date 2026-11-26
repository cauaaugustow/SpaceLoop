import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectSala = {
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

export type SalaSelecionada = Prisma.SalaGetPayload<{ select: typeof selectSala }>;

export type FiltroDeDisponibilidade = { dia: Date; turno: string };

export async function listarSalas(filtro?: FiltroDeDisponibilidade): Promise<SalaSelecionada[]> {
  const where: Prisma.SalaWhereInput = filtro
    ? { reservas: { none: { dia: filtro.dia, turno: filtro.turno } } }
    : {};

  return prisma.sala.findMany({ where, select: selectSala, orderBy: { nome: "asc" } });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada | null> {
  return prisma.sala.findUnique({ where: { id }, select: selectSala });
}

export async function criarSala(dados: Prisma.SalaUncheckedCreateInput): Promise<SalaSelecionada> {
  return prisma.sala.create({ data: dados, select: selectSala });
}

export async function atualizarSala(id: number, dados: Prisma.SalaUncheckedUpdateInput): Promise<SalaSelecionada> {
  return prisma.sala.update({ where: { id }, data: dados, select: selectSala });
}

export async function removerSala(id: number): Promise<void> {
  await prisma.sala.delete({ where: { id } });
}

export async function contarReservasDaSala(idSala: number): Promise<number> {
  return prisma.reserva.count({ where: { idSala } });
}
