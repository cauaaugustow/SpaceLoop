import jwt from "jsonwebtoken";
import { lerVariavelObrigatoria } from "../config/env.js";

export function gerarToken(usuario: { id: number }): string {
  return jwt.sign(
    { sub: String(usuario.id) },
    lerVariavelObrigatoria("JWT_SECRET"),
    { expiresIn: "1h" },
  );
}
