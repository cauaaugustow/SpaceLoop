import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectReservas = {
  id: true,
  dia: true,
  turno: true,
  criadoEm: true,
  atualizadoEm: true,
  idUsuario: true,
  idSala: true,
} satisfies Prisma.ReservaSelect;

export type ReservaSelecionada = Prisma.ReservaGetPayload<{ select: typeof selectReservas }>;

export async function criarReserva(dados: Prisma.ReservaUncheckedCreateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.create({ data: dados, select: selectReservas });
}

export async function buscarReservaPorId(id: number): Promise<ReservaSelecionada | null> {
  return prisma.reserva.findUnique({ where: { id }, select: selectReservas });
}

export async function listaReservas(idUsuario: number, eadmin: boolean): Promise<ReservaSelecionada[]> {
  return prisma.reserva.findMany({ where: eadmin ? {} : { idUsuario }, select: selectReservas });
}

export async function atualizarReserva(id: number, dados: Prisma.ReservaUncheckedUpdateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.update({ where: { id }, data: dados, select: selectReservas });
}

export async function deletarReserva(id: number): Promise<ReservaSelecionada> {
  return prisma.reserva.delete({ where: { id }, select: selectReservas });
}
