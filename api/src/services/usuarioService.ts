import type { DadosDeNovoUsuario } from "shared";
import * as usuarioRepository from "../repositories/usuarioRepository.js";
import type { UsuarioSelecionado } from "../repositories/usuarioRepository.js";
import { gerarHashDaSenha } from "./senhaService.js";
import { ErroDeDominio } from "../erros/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../erros/lancarErroTraduzidoDoPrisma.js";

const erroDeEmailRepetido = (): ErroDeDominio => new ErroDeDominio("E-mail já cadastrado", 409, "email");

export async function criarUsuario({ nome, email, senha }: DadosDeNovoUsuario): Promise<UsuarioSelecionado> {
  if (await usuarioRepository.buscarUsuarioPorEmail(email)) throw erroDeEmailRepetido();

  try {
    return await usuarioRepository.criarUsuario({ nome, email, senhaHash: await gerarHashDaSenha(senha) });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeEmailRepetido() });
  }
}
