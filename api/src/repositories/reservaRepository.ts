import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectReserva = {
  id: true,
  dia: true,
  turno: true,
  idSala: true,
  idCliente: true,
  sala: { select: { nome: true } },
  cliente: { select: { nome: true } },
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.ReservaSelect;

export type ReservaSelecionada = Prisma.ReservaGetPayload<{ select: typeof selectReserva }>;

export async function listarReservas(): Promise<ReservaSelecionada[]> {
  return prisma.reserva.findMany({ select: selectReserva, orderBy: [{ dia: "asc" }, { id: "asc" }] });
}

export async function buscarReservaPorId(id: number): Promise<ReservaSelecionada | null> {
  return prisma.reserva.findUnique({ where: { id }, select: selectReserva });
}

export async function criarReserva(dados: Prisma.ReservaUncheckedCreateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.create({ data: dados, select: selectReserva });
}

export async function atualizarReserva(id: number, dados: Prisma.ReservaUncheckedUpdateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.update({ where: { id }, data: dados, select: selectReserva });
}

export async function removerReserva(id: number): Promise<void> {
  await prisma.reserva.delete({ where: { id } });
}
