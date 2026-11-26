import type { Request, Response } from "express";
import * as salaService from "../services/salaService.js";
import { lerIdDoParametro } from "../utilitarios/lerIdDoParametro.js";

export async function listarSalas(req: Request, res: Response): Promise<void> {
  res.json(await salaService.listarSalas(req.query));
}

export async function buscarSala(req: Request, res: Response): Promise<void> {
  res.json(await salaService.buscarSalaPorId(lerIdDoParametro(req)));
}

export async function criarSala(req: Request, res: Response): Promise<void> {
  res.status(201).json(await salaService.criarSala(req.body));
}

export async function atualizarSala(req: Request, res: Response): Promise<void> {
  res.json(await salaService.atualizarSala(lerIdDoParametro(req), req.body));
}

export async function removerSala(req: Request, res: Response): Promise<void> {
  await salaService.removerSala(lerIdDoParametro(req));
  res.status(204).end();
}
