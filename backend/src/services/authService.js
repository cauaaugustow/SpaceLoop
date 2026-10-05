import { ErroDeDominio } from "../error/erroDeDominio.js";
import { buscarUserPorAuth } from "../repositories/authRepository.js";
import { authUsuarioSchema } from "../schema/authSchema.js";
import { compararSenha } from "./senhaService.js";

export async function authUsuario(email, senha) {
  const dadosValidados = authUsuarioSchema.parse({ email, senha });
  const usuario = await buscarUserPorAuth(dadosValidados.email);

  if (!usuario) {
    throw new ErroDeDominio("Email ou senha não encontrados", 401);
  }

  const senhaCorreta = await compararSenha(dadosValidados.senha, usuario.senhaHash);

  if (!senhaCorreta) {
    throw new ErroDeDominio("Email ou senha não encontrados", 401);
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criadoEm,
  };
}
