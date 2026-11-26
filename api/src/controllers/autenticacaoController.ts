import type { Request, Response } from "express";
import type { DadosDeLogin } from "shared";
import * as autenticacaoService from "../services/autenticacaoService.js";
import type { UsuarioAutenticado } from "../services/autenticacaoService.js";
import { gerarToken } from "../services/tokenService.js";

export async function autenticarUsuario(req: Request, res: Response): Promise<void> {
  const { email, senha }: DadosDeLogin = req.body;
  const usuario: UsuarioAutenticado = await autenticacaoService.autenticarUsuario(email, senha);
  const token: string = gerarToken(usuario);
  res.status(200).json({ usuario, token });
}
