import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export type ErroDeCampo = { campo: string; message: string };

type ErroDaAplicacao = Error & { statusCode?: number; campo?: string; type?: string };

function listarErrosPorCampo(erro: ZodError): ErroDeCampo[] {
  const mensagensPorCampo: Map<string, string> = new Map();
  for (const problema of erro.issues) {
    const campo: string = problema.path.join(".") || "corpo";
    if (!mensagensPorCampo.has(campo)) mensagensPorCampo.set(campo, problema.message);
  }
  return [...mensagensPorCampo].map(([campo, message]: [string, string]): ErroDeCampo => ({ campo, message }));
}

export function tratarErros(erro: ErroDaAplicacao, req: Request, res: Response, next: NextFunction): void {
  if (erro instanceof ZodError) {
    res.status(400).json({ message: "Dados inválidos", errors: listarErrosPorCampo(erro) });
    return;
  }

  if (erro.type === "entity.parse.failed") {
    res.status(400).json({ message: "JSON inválido" });
    return;
  }

  const statusCode: number = erro.statusCode || 500;
  const isErroInterno: boolean = statusCode >= 500;
  if (isErroInterno) console.error(erro);

  const message: string = isErroInterno ? "Erro interno do servidor" : erro.message;
  const errors: ErroDeCampo[] | undefined = erro.campo ? [{ campo: erro.campo, message }] : undefined;
  res.status(statusCode).json({ message, errors });
}
