import type { Request, Response } from "express";
import { criarUser } from "../services/usuarioService.js";
import type { UsuarioSelecionado } from "../repositories/userRepository.js";

export async function cadastrarUsuario(req: Request, res: Response): Promise<void> {
  const usuario: UsuarioSelecionado = await criarUser(req.body);
  res.status(201).json(usuario);
}
