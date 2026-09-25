import {
  criarUser,
  deleteUser,
  getAllUsers,
  getUsersById,
  updateUser,
} from "../services/usuarioService.js";

function idDoParametro(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    const erro = new Error("ID inválido");
    erro.statusCode = 400;
    throw erro;
  }
  return id;
}

export async function cadastrarUsuario(req, res) {
  const usuario = await criarUser(req.body);
  res.status(201).json(usuario);
}

export async function listarUsuarios(req, res) {
  res.json(await getAllUsers());
}

export async function buscarUsuario(req, res) {
  res.json(await getUsersById(idDoParametro(req)));
}

export async function atualizarUsuario(req, res) {
  res.json(await updateUser(idDoParametro(req), req.body));
}

export async function deletarUsuario(req, res) {
  res.json(await deleteUser(idDoParametro(req)));
}

