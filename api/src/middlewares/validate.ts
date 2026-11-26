import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodSafeParseResult, ZodType } from "zod";

export function validate(schema: ZodType): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultado: ZodSafeParseResult<unknown> = schema.safeParse(req.body ?? {});

    if (!resultado.success) {
      next(resultado.error);
      return;
    }

    req.body = resultado.data;
    next();
  };
}
