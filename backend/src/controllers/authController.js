import { authUsuario } from "../services/authService.js";


export async function autenticarUsuario (req, res) {
  const usuario = await authUsuario(email, senha);
  const token = gerarToken(usuario)
  res.status(200).json({usuario, token});
}
