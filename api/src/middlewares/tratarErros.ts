import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ErroDeCampo, RespostaDeErro } from "shared";

type ErroDaAplicacao = Error & { statusCode?: number; campo?: string; type?: string };

function listarErrosPorCampo(erroDeValidacao: ZodError): ErroDeCampo[] {
  const mensagensPorCampo: Map<string, string> = new Map();
  for (const problema of erroDeValidacao.issues) {
    const campo: string = problema.path.join(".") || "corpo";
    if (!mensagensPorCampo.has(campo)) mensagensPorCampo.set(campo, problema.message);
  }
  return [...mensagensPorCampo].map(([campo, mensagem]: [string, string]): ErroDeCampo => ({ campo, mensagem }));
}

function responderComErro(res: Response, statusCode: number, resposta: RespostaDeErro): void {
  res.status(statusCode).json(resposta);
}

export function tratarErros(erro: ErroDaAplicacao, req: Request, res: Response, next: NextFunction): void {
  if (erro instanceof ZodError) {
    responderComErro(res, 400, { mensagem: "Dados inválidos", erros: listarErrosPorCampo(erro) });
    return;
  }

  if (erro.type === "entity.parse.failed") {
    responderComErro(res, 400, { mensagem: "JSON inválido" });
    return;
  }

  const statusCode: number = erro.statusCode || 500;
  const isErroInterno: boolean = statusCode >= 500;
  if (isErroInterno) console.error(erro);

  const mensagem: string = isErroInterno ? "Erro interno do servidor" : erro.message;
  const erros: ErroDeCampo[] | undefined = erro.campo ? [{ campo: erro.campo, mensagem }] : undefined;
  responderComErro(res, statusCode, { mensagem, erros });
}
