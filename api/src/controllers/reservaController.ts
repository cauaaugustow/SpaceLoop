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

type DadosComIdUsuario = Record<string, unknown> & { idUsuario: unknown };

function temIdUsuario(dados: unknown): dados is DadosComIdUsuario {
  return typeof dados === "object" && dados !== null && Object.hasOwn(dados, "idUsuario");
}

function isAdmin(req: Request): boolean {
  return req.user?.eadmin === true;
}

function idDoParametro(req: Request): number {
  const id: number = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

function idDoUsuario(req: Request): number {
  const id: number = Number(req.user?.sub);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ErroDeDominio("Token inválido", 401);
  }
  return id;
}

export async function criarReserva(req: Request, res: Response): Promise<void> {
  let idUsuario: number = idDoUsuario(req);
  let dados: unknown = req.body;

  if (isAdmin(req) && temIdUsuario(dados)) {
    const { idUsuario: idSolicitado, ...dadosReserva }: DadosComIdUsuario = dados;
    idUsuario = Number(idSolicitado);
    if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
      throw new ErroDeDominio("ID de usuário inválido", 400);
    }
    dados = dadosReserva;
  }

  const reserva: ReservaSelecionada = await criarReservaService(dados, idUsuario);
  res.status(201).json(reserva);
}

export async function listarReservas(req: Request, res: Response): Promise<void> {
  res.json(await getAllReservas(idDoUsuario(req), isAdmin(req)));
}

export async function buscarReservas(req: Request, res: Response): Promise<void> {
  res.json(await buscarReservaPorId(idDoParametro(req), idDoUsuario(req), isAdmin(req)));
}

export async function atualizarReservas(req: Request, res: Response): Promise<void> {
  res.json(await atualizarReserva(idDoParametro(req), req.body, idDoUsuario(req), isAdmin(req)));
}

export async function deletarReservas(req: Request, res: Response): Promise<void> {
  res.json(await deletarReserva(idDoParametro(req), idDoUsuario(req), isAdmin(req)));
}
