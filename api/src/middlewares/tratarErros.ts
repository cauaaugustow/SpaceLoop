import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export type ErroDeCampo = { campo: string; message: string };

function listarErrosPorCampo(erro: ZodError): ErroDeCampo[] {
  const mensagensPorCampo: Map<string, string> = new Map();
  for (const problema of erro.issues) {
    const campo: string = problema.path.join(".") || "corpo";
    if (!mensagensPorCampo.has(campo)) mensagensPorCampo.set(campo, problema.message);
  }
  return [...mensagensPorCampo].map(([campo, message]: [string, string]): ErroDeCampo => ({ campo, message }));
}

export function tratarErros(erro: Error & { statusCode?: number }, req: Request, res: Response, next: NextFunction): void {
  if (erro instanceof ZodError) {
    res.status(400).json({ message: "Dados inválidos", errors: listarErrosPorCampo(erro) });
    return;
  }

  res.status(erro.statusCode || 500).json({
    message: erro.statusCode ? erro.message : "Erro interno do servidor",
  });
}
