import {
  buscarUserPorEmail,
  criarUser as criarUserRepository,
  type UsuarioSelecionado,
} from "../repositories/userRepository.js";
import { hashearSenha } from "./senhaService.js";
import { criarUsuarioSchema, type DadosDeNovoUsuario } from "../schema/userSchema.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { codigoDoErroPrisma } from "../error/codigoDoErroPrisma.js";

export async function criarUser(dados: unknown): Promise<UsuarioSelecionado> {
  const { nome, email, senha }: DadosDeNovoUsuario = criarUsuarioSchema.parse(dados);

  if (await buscarUserPorEmail(email)) throw new ErroDeDominio("E-mail já cadastrado", 409);

  try {
    return await criarUserRepository({ nome, email, senhaHash: await hashearSenha(senha) });
  } catch (erro: unknown) {
    if (codigoDoErroPrisma(erro) === "P2002") {
      throw new ErroDeDominio("E-mail já cadastrado", 409);
    }
    throw erro;
  }
}
