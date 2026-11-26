import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { lerVariavelObrigatoria } from "../config/env.js";

export async function authValidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization: string | undefined = req.headers.authorization;
  const token: string | null = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ message: "Token não informado" });
    return;
  }

  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(token, lerVariavelObrigatoria("JWT_SECRET"));
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado" });
    return;
  }

  if (typeof payload === "string") {
    res.status(401).json({ message: "Token inválido" });
    return;
  }

  const id: number = Number(payload.sub);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(401).json({ message: "Token inválido" });
    return;
  }

  try {
    const usuario: { eadmin: boolean } | null = await prisma.usuario.findUnique({
      where: { id },
      select: { eadmin: true },
    });

    if (!usuario) {
      res.status(401).json({ message: "Usuário não encontrado" });
      return;
    }

    req.user = { ...payload, eadmin: usuario.eadmin };
    next();
  } catch (erro: unknown) {
    next(erro);
  }
}
