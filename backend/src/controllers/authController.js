import { authUsuario } from "../services/authService.js";
import { gerarToken } from "../services/tokenService.js";


export async function autenticarUsuario (req, res) {
  const { email, senha } = req.body;
  const usuario = await authUsuario(email, senha);
  const token = gerarToken(usuario);
  res.status(200).json({usuario, token});
}
