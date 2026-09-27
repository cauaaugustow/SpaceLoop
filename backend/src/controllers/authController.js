import { authUsuario } from "../services/authService.js";


export async function autenticarUsuario (req, res) {
  const usuario = await authUsuario(req.body);
  res.status(200).json(usuario);
}