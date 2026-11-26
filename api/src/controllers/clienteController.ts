import type { Request, Response } from "express";
import * as clienteService from "../services/clienteService.js";
import { lerIdDoParametro } from "../lib/lerIdDoParametro.js";

export async function listarClientes(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.listarClientes());
}

export async function buscarCliente(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.buscarClientePorId(lerIdDoParametro(req)));
}

export async function criarCliente(req: Request, res: Response): Promise<void> {
  res.status(201).json(await clienteService.criarCliente(req.body));
}

export async function atualizarCliente(req: Request, res: Response): Promise<void> {
  res.json(await clienteService.atualizarCliente(lerIdDoParametro(req), req.body));
}

export async function removerCliente(req: Request, res: Response): Promise<void> {
  await clienteService.removerCliente(lerIdDoParametro(req));
  res.status(204).end();
}
