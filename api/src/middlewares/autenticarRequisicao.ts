import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { buscarUsuarioPorId, type UsuarioSelecionado } from "../repositories/usuarioRepository.js";
import { lerVariavelObrigatoria } from "../config/env.js";

export async function autenticarRequisicao(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization: string | undefined = req.headers.authorization;
  const token: string | null = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ mensagem: "Token não informado" });
    return;
  }

  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(token, lerVariavelObrigatoria("JWT_SECRET"));
  } catch {
    res.status(401).json({ mensagem: "Token inválido ou expirado" });
    return;
  }

  if (typeof payload === "string") {
    res.status(401).json({ mensagem: "Token inválido" });
    return;
  }

  const id: number = Number(payload.sub);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(401).json({ mensagem: "Token inválido" });
    return;
  }

  try {
    const usuario: UsuarioSelecionado | null = await buscarUsuarioPorId(id);

    if (!usuario) {
      res.status(401).json({ mensagem: "Usuário não encontrado" });
      return;
    }

    req.user = payload;
    next();
  } catch (erro: unknown) {
    next(erro);
  }
}
