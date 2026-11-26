import type { Request, Response } from "express";
import * as blocoService from "../services/blocoService.js";
import { lerIdDoParametro } from "../lib/lerIdDoParametro.js";

export async function listarBlocos(req: Request, res: Response): Promise<void> {
  res.json(await blocoService.listarBlocos());
}

export async function buscarBloco(req: Request, res: Response): Promise<void> {
  res.json(await blocoService.buscarBlocoPorId(lerIdDoParametro(req)));
}

export async function criarBloco(req: Request, res: Response): Promise<void> {
  res.status(201).json(await blocoService.criarBloco(req.body));
}

export async function atualizarBloco(req: Request, res: Response): Promise<void> {
  res.json(await blocoService.atualizarBloco(lerIdDoParametro(req), req.body));
}

export async function removerBloco(req: Request, res: Response): Promise<void> {
  await blocoService.removerBloco(lerIdDoParametro(req));
  res.status(204).end();
}
