import type { Request, Response } from "express";
import {
  criarReserva as criarReservaService,
  getAllReservas,
  buscarReservaPorId,
  atualizarReserva,
  deletarReserva,
} from "../services/reservaService.js";
import type { ReservaSelecionada } from "../repositories/reservaRepository.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

function idDoParametro(req: Request): number {
  const id: number = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

export async function criarReserva(req: Request, res: Response): Promise<void> {
  const reserva: ReservaSelecionada = await criarReservaService(req.body);
  res.status(201).json(reserva);
}

export async function listarReservas(req: Request, res: Response): Promise<void> {
  res.json(await getAllReservas());
}

export async function buscarReservas(req: Request, res: Response): Promise<void> {
  res.json(await buscarReservaPorId(idDoParametro(req)));
}

export async function atualizarReservas(req: Request, res: Response): Promise<void> {
  res.json(await atualizarReserva(idDoParametro(req), req.body));
}

export async function deletarReservas(req: Request, res: Response): Promise<void> {
  res.json(await deletarReserva(idDoParametro(req)));
}
