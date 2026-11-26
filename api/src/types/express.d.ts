import type { JwtPayload } from "jsonwebtoken";

export type UsuarioAutenticado = JwtPayload & { eadmin: boolean };

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioAutenticado;
    }
  }
}
