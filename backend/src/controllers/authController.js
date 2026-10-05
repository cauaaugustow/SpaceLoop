import { authUsuario } from "../services/authService.js";


export async function autenticarUsuario (req, res) {
  const { email, senha } = req.body;
  const usuario = await authUsuario(email, senha);
  res.status(200).json(usuario);
}
