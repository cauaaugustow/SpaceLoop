import type { Request, Response } from "express";
import {
  criarUser,
  deleteUser,
  getAllUsers,
  getUsersById,
  updateUser,
} from "../services/usuarioService.js";
import type { UsuarioSelecionado } from "../repositories/userRepository.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

function idDoParametro(req: Request): number {
  const id: number = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

export async function cadastrarUsuario(req: Request, res: Response): Promise<void> {
  const usuario: UsuarioSelecionado = await criarUser(req.body);
  res.status(201).json(usuario);
}

export async function listarUsuarios(req: Request, res: Response): Promise<void> {
  res.json(await getAllUsers());
}

export async function buscarUsuario(req: Request, res: Response): Promise<void> {
  res.json(await getUsersById(idDoParametro(req)));
}

export async function atualizarUsuario(req: Request, res: Response): Promise<void> {
  res.json(await updateUser(idDoParametro(req), req.body));
}

export async function deletarUsuario(req: Request, res: Response): Promise<void> {
  res.json(await deleteUser(idDoParametro(req)));
}
