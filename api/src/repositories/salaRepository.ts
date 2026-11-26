import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectSalas = {
  id: true,
  nome: true,
  capacidade: true,
  descricao: true,
  preco: true,
  idBloco: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.SalaSelect;

export type SalaSelecionada = Prisma.SalaGetPayload<{ select: typeof selectSalas }>;

export type FiltroDisponibilidade = { inicio?: Date; fim?: Date; turno?: string };

export async function criarSala(dados: Prisma.SalaUncheckedCreateInput): Promise<SalaSelecionada> {
  return prisma.sala.create({ data: dados, select: selectSalas });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada | null> {
  return prisma.sala.findUnique({ where: { id }, select: selectSalas });
}

export async function listarSalas({ inicio, fim, turno }: FiltroDisponibilidade = {}): Promise<SalaSelecionada[]> {
  const where: Prisma.SalaWhereInput = inicio
    ? { reservas: { none: { dia: { gte: inicio, lt: fim }, turno } } }
    : {};

  return prisma.sala.findMany({ where, select: selectSalas });
}

export async function atualizarSalas(id: number, dados: Prisma.SalaUncheckedUpdateInput): Promise<SalaSelecionada> {
  return prisma.sala.update({ where: { id }, data: dados, select: selectSalas });
}

export async function deletarSalas(id: number): Promise<SalaSelecionada> {
  return prisma.sala.delete({ where: { id }, select: selectSalas });
}

export async function contarReservasDaSala(idSala: number): Promise<number> {
  return prisma.reserva.count({ where: { idSala } });
}
