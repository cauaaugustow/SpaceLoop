import type { Request, Response } from "express";
import { authUsuario, type UsuarioLogado } from "../services/authService.js";
import { gerarToken } from "../services/tokenService.js";
import type { DadosDeLogin } from "shared";

export async function autenticarUsuario(req: Request, res: Response): Promise<void> {
  const { email, senha }: DadosDeLogin = req.body;
  const usuario: UsuarioLogado = await authUsuario(email, senha);
  const token: string = gerarToken(usuario);
  res.status(200).json({ usuario, token });
}
