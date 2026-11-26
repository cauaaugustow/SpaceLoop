import type { Request } from "express";
import { MAIOR_ID_DO_BANCO } from "shared";
import { ErroDeDominio } from "../error/erroDeDominio.js";

export function lerIdDoParametro(req: Request): number {
  const id: number = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0 || id > MAIOR_ID_DO_BANCO) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}
