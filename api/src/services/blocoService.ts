import type { DadosDeBloco } from "shared";
import * as blocoRepository from "../repositories/blocoRepository.js";
import type { BlocoSelecionado } from "../repositories/blocoRepository.js";
import { contarSalasDoBloco } from "../repositories/salaRepository.js";
import { ErroDeDominio } from "../erros/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../erros/lancarErroTraduzidoDoPrisma.js";

const erroDeBlocoInexistente = (): ErroDeDominio => new ErroDeDominio("Bloco não encontrado", 404);
const erroDeNomeRepetido = (): ErroDeDominio => new ErroDeDominio("Já existe um bloco com este nome", 409, "nome");
const erroDeBlocoComSalas = (): ErroDeDominio => new ErroDeDominio("O bloco possui salas e não pode ser removido", 409);

async function exigirNomeLivre(nome: string, idDoProprioBloco?: number): Promise<void> {
  const blocoComEsteNome: BlocoSelecionado | null = await blocoRepository.buscarBlocoPorNome(nome);
  if (blocoComEsteNome && blocoComEsteNome.id !== idDoProprioBloco) throw erroDeNomeRepetido();
}

export async function listarBlocos(): Promise<BlocoSelecionado[]> {
  return blocoRepository.listarBlocos();
}

export async function buscarBlocoPorId(id: number): Promise<BlocoSelecionado> {
  const bloco: BlocoSelecionado | null = await blocoRepository.buscarBlocoPorId(id);
  if (!bloco) throw erroDeBlocoInexistente();
  return bloco;
}

export async function criarBloco({ nome, descricao }: DadosDeBloco): Promise<BlocoSelecionado> {
  await exigirNomeLivre(nome);
  try {
    return await blocoRepository.criarBloco({ nome, descricao: descricao ?? null });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeNomeRepetido() });
  }
}

export async function atualizarBloco(id: number, { nome, descricao }: DadosDeBloco): Promise<BlocoSelecionado> {
  await buscarBlocoPorId(id);
  await exigirNomeLivre(nome, id);
  try {
    return await blocoRepository.atualizarBloco(id, { nome, descricao: descricao ?? null });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeNomeRepetido(), P2025: erroDeBlocoInexistente() });
  }
}

export async function removerBloco(id: number): Promise<void> {
  await buscarBlocoPorId(id);
  if ((await contarSalasDoBloco(id)) > 0) throw erroDeBlocoComSalas();
  try {
    await blocoRepository.removerBloco(id);
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeBlocoComSalas(), P2025: erroDeBlocoInexistente() });
  }
}
