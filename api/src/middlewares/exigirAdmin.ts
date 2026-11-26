import type { NextFunction, Request, Response } from "express";

export function exigirAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.eadmin !== true) {
    res.status(403).json({
      message: "Acesso restrito ao administrador",
    });
    return;
  }

  next();
}
