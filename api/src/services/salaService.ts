import type { DadosDeSala } from "shared";
import * as salaRepository from "../repositories/salaRepository.js";
import type { SalaSelecionada } from "../repositories/salaRepository.js";
import { buscarBlocoPorId } from "../repositories/blocoRepository.js";
import { contarReservasDaSala } from "../repositories/reservaRepository.js";
import type { Prisma } from "../generated/prisma/client.js";
import { ErroDeDominio } from "../erros/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../erros/lancarErroTraduzidoDoPrisma.js";

const erroDeSalaInexistente = (): ErroDeDominio => new ErroDeDominio("Sala não encontrada", 404);
const erroDeBlocoInexistente = (): ErroDeDominio => new ErroDeDominio("Bloco não encontrado", 404, "idBloco");
const erroDeSalaComReservas = (): ErroDeDominio =>
  new ErroDeDominio("A sala possui reservas e não pode ser removida", 409);

async function exigirBlocoExistente(idBloco: number): Promise<void> {
  if (!(await buscarBlocoPorId(idBloco))) throw erroDeBlocoInexistente();
}

function montarDadosDaSala({ nome, capacidade, descricao, precoLocacao, idBloco }: DadosDeSala): Prisma.SalaUncheckedCreateInput {
  return { nome, capacidade, descricao: descricao ?? null, preco: precoLocacao, idBloco };
}

export async function listarSalas(): Promise<SalaSelecionada[]> {
  return salaRepository.listarSalas();
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada> {
  const sala: SalaSelecionada | null = await salaRepository.buscarSalaPorId(id);
  if (!sala) throw erroDeSalaInexistente();
  return sala;
}

export async function criarSala(dadosDaSala: DadosDeSala): Promise<SalaSelecionada> {
  await exigirBlocoExistente(dadosDaSala.idBloco);
  try {
    return await salaRepository.criarSala(montarDadosDaSala(dadosDaSala));
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeBlocoInexistente() });
  }
}

export async function atualizarSala(id: number, dadosDaSala: DadosDeSala): Promise<SalaSelecionada> {
  await buscarSalaPorId(id);
  await exigirBlocoExistente(dadosDaSala.idBloco);
  try {
    return await salaRepository.atualizarSala(id, montarDadosDaSala(dadosDaSala));
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeBlocoInexistente(), P2025: erroDeSalaInexistente() });
  }
}

export async function removerSala(id: number): Promise<void> {
  await buscarSalaPorId(id);
  if ((await contarReservasDaSala(id)) > 0) throw erroDeSalaComReservas();
  try {
    await salaRepository.removerSala(id);
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeSalaComReservas(), P2025: erroDeSalaInexistente() });
  }
}
