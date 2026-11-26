import type { Request, Response } from "express";
import {
  criarSala,
  getAllSalas,
  buscarSalaPorId,
  atualizarSala,
  deletarSala,
} from "../services/salaService.js";
import type { SalaSelecionada } from "../repositories/salaRepository.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

function idDoParametro(req: Request): number {
  const id: number = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

export async function criarSalas(req: Request, res: Response): Promise<void> {
  const sala: SalaSelecionada = await criarSala(req.body);
  res.status(201).json(sala);
}

export async function listarSalas(req: Request, res: Response): Promise<void> {
  res.json(await getAllSalas(req.query));
}

export async function buscarSalas(req: Request, res: Response): Promise<void> {
  res.json(await buscarSalaPorId(idDoParametro(req)));
}

export async function atualizarSalas(req: Request, res: Response): Promise<void> {
  res.json(await atualizarSala(idDoParametro(req), req.body));
}

export async function deletarSalas(req: Request, res: Response): Promise<void> {
  res.json(await deletarSala(idDoParametro(req)));
}
