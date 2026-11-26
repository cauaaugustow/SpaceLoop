import type { Request, Response } from "express";
import { criarUsuario } from "../services/usuarioService.js";
import type { UsuarioSelecionado } from "../repositories/usuarioRepository.js";

export async function cadastrarUsuario(req: Request, res: Response): Promise<void> {
  const usuario: UsuarioSelecionado = await criarUsuario(req.body);
  res.status(201).json(usuario);
}
