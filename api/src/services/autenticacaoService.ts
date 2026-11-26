import { ErroDeDominio } from "../erros/erroDeDominio.js";
import { buscarUsuarioParaAutenticar, type UsuarioParaAutenticar } from "../repositories/autenticacaoRepository.js";
import { compararSenha } from "./senhaService.js";

export type UsuarioAutenticado = Omit<UsuarioParaAutenticar, "senhaHash">;

export async function autenticarUsuario(email: string, senha: string): Promise<UsuarioAutenticado> {
  const usuario: UsuarioParaAutenticar | null = await buscarUsuarioParaAutenticar(email);

  if (!usuario) {
    throw new ErroDeDominio("Email ou senha não encontrados", 401);
  }

  const isSenhaCorreta: boolean = await compararSenha(senha, usuario.senhaHash);

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
