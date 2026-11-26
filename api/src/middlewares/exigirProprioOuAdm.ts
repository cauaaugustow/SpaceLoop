import type { NextFunction, Request, Response } from "express";

export function exigirProprioOuAdmin(req: Request, res: Response, next: NextFunction): void {
  const idAlvo: number = Number(req.params.id);

  if (!Number.isSafeInteger(idAlvo) || idAlvo <= 0) {
    res.status(400).json({ message: "ID inválido" });
    return;
  }

  if (req.user?.eadmin || Number(req.user?.sub) === idAlvo) {
    next();
    return;
  }

  res.status(403).json({ message: "Acesso negado" });
}
