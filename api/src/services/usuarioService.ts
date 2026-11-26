import type { DadosDeNovoUsuario } from "shared";
import {
  buscarUserPorEmail,
  criarUser as criarUserRepository,
  type UsuarioSelecionado,
} from "../repositories/userRepository.js";
import { hashearSenha } from "./senhaService.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../error/lancarErroTraduzidoDoPrisma.js";

const erroDeEmailRepetido = (): ErroDeDominio => new ErroDeDominio("E-mail já cadastrado", 409, "email");

export async function criarUser({ nome, email, senha }: DadosDeNovoUsuario): Promise<UsuarioSelecionado> {
  if (await buscarUserPorEmail(email)) throw erroDeEmailRepetido();

  try {
    return await criarUserRepository({ nome, email, senhaHash: await hashearSenha(senha) });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeEmailRepetido() });
  }
}
