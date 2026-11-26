import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const camposDaReserva = {
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

export type ReservaSelecionada = Prisma.ReservaGetPayload<{ select: typeof camposDaReserva }>;

export async function listarReservas(): Promise<ReservaSelecionada[]> {
  return prisma.reserva.findMany({ select: camposDaReserva, orderBy: [{ dia: "asc" }, { id: "asc" }] });
}

export async function buscarReservaPorId(id: number): Promise<ReservaSelecionada | null> {
  return prisma.reserva.findUnique({ where: { id }, select: camposDaReserva });
}

export async function criarReserva(dadosDaReserva: Prisma.ReservaUncheckedCreateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.create({ data: dadosDaReserva, select: camposDaReserva });
}

export async function atualizarReserva(id: number, dadosDaReserva: Prisma.ReservaUncheckedUpdateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.update({ where: { id }, data: dadosDaReserva, select: camposDaReserva });
}

export async function removerReserva(id: number): Promise<void> {
  await prisma.reserva.delete({ where: { id } });
}

export async function contarReservasDaSala(idSala: number): Promise<number> {
  return prisma.reserva.count({ where: { idSala } });
}

export async function contarReservasDoCliente(idCliente: number): Promise<number> {
  return prisma.reserva.count({ where: { idCliente } });
}
