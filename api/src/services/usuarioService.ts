import {
  buscarUserPorEmail,
  criarUser as criarUserRepository,
  type UsuarioSelecionado,
} from "../repositories/userRepository.js";
import { hashearSenha } from "./senhaService.js";
import type { DadosDeNovoUsuario } from "shared";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { codigoDoErroPrisma } from "../error/codigoDoErroPrisma.js";

export async function criarUser({ nome, email, senha }: DadosDeNovoUsuario): Promise<UsuarioSelecionado> {
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
