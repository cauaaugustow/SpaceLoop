import type { Request, Response } from "express";
import * as reservaService from "../services/reservaService.js";
import { lerIdDoParametro } from "../lib/lerIdDoParametro.js";

export async function listarReservas(req: Request, res: Response): Promise<void> {
  res.json(await reservaService.listarReservas());
}

export async function buscarReserva(req: Request, res: Response): Promise<void> {
  res.json(await reservaService.buscarReservaPorId(lerIdDoParametro(req)));
}

export async function criarReserva(req: Request, res: Response): Promise<void> {
  res.status(201).json(await reservaService.criarReserva(req.body));
}

export async function atualizarReserva(req: Request, res: Response): Promise<void> {
  res.json(await reservaService.atualizarReserva(lerIdDoParametro(req), req.body));
}

export async function removerReserva(req: Request, res: Response): Promise<void> {
  await reservaService.removerReserva(lerIdDoParametro(req));
  res.status(204).end();
}
