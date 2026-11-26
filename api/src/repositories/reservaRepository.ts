import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const relacoesDaReserva = {
  sala: { select: { nome: true } },
  cliente: { select: { nome: true } },
} satisfies Prisma.ReservaInclude;

export type ReservaSelecionada = Prisma.ReservaGetPayload<{ include: typeof relacoesDaReserva }>;

export async function listarReservas(): Promise<ReservaSelecionada[]> {
  return prisma.reserva.findMany({ include: relacoesDaReserva, orderBy: [{ dia: "asc" }, { id: "asc" }] });
}

export async function buscarReservaPorId(id: number): Promise<ReservaSelecionada | null> {
  return prisma.reserva.findUnique({ where: { id }, include: relacoesDaReserva });
}

export async function criarReserva(dadosDaReserva: Prisma.ReservaUncheckedCreateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.create({ data: dadosDaReserva, include: relacoesDaReserva });
}

export async function atualizarReserva(id: number, dadosDaReserva: Prisma.ReservaUncheckedUpdateInput): Promise<ReservaSelecionada> {
  return prisma.reserva.update({ where: { id }, data: dadosDaReserva, include: relacoesDaReserva });
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
