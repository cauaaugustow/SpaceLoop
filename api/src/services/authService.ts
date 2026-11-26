import { ErroDeDominio } from "../error/erroDeDominio.js";
import { buscarUserPorAuth, type UsuarioParaAutenticar } from "../repositories/authRepository.js";
import { authUsuarioSchema, type DadosDeLogin } from "../schema/authSchema.js";
import { compararSenha } from "./senhaService.js";

export type UsuarioLogado = Omit<UsuarioParaAutenticar, "senhaHash">;

export async function authUsuario(email: string, senha: string): Promise<UsuarioLogado> {
  const dadosValidados: DadosDeLogin = authUsuarioSchema.parse({ email, senha });
  const usuario: UsuarioParaAutenticar | null = await buscarUserPorAuth(dadosValidados.email);

  if (!usuario) {
    throw new ErroDeDominio("Email ou senha não encontrados", 401);
  }

  const isSenhaCorreta: boolean = await compararSenha(dadosValidados.senha, usuario.senhaHash);

  if (!isSenhaCorreta) {
    throw new ErroDeDominio("Email ou senha não encontrados", 401);
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criadoEm,
  };
}
