import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodSafeParseResult, ZodType } from "zod";

export function validarBody(schema: ZodType): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultadoDaValidacao: ZodSafeParseResult<unknown> = schema.safeParse(req.body ?? {});

    if (!resultadoDaValidacao.success) {
      next(resultadoDaValidacao.error);
      return;
    }

    req.body = resultadoDaValidacao.data;
    next();
  };
}
