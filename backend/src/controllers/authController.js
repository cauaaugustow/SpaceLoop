import { authUsuario } from "../services/authService.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

function idDoParametro(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

export async function autenticarUsuario (req, res) {
  const usuario = await authUsuario(req.body);
  res.status(200).json(usuario);
}