import { disponibilidadeSchema, type DadosDeDisponibilidade, type DadosDeSala } from "shared";
import * as salaRepository from "../repositories/salaRepository.js";
import type { SalaSelecionada } from "../repositories/salaRepository.js";
import { buscarBlocoPorId } from "../repositories/blocoRepository.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../error/lancarErroTraduzidoDoPrisma.js";
import { converterDiaEmData } from "../lib/converterDiaEmData.js";

export type FiltrosDeConsultaDeSalas = { disponivel?: unknown; dia?: unknown; turno?: unknown };

const erroDeSalaInexistente = (): ErroDeDominio => new ErroDeDominio("Sala não encontrada", 404);
const erroDeBlocoInexistente = (): ErroDeDominio => new ErroDeDominio("Bloco não encontrado", 404, "idBloco");
const erroDeSalaComReservas = (): ErroDeDominio =>
  new ErroDeDominio("A sala possui reservas e não pode ser removida", 409);

async function exigirBlocoExistente(idBloco: number): Promise<void> {
  if (!(await buscarBlocoPorId(idBloco))) throw erroDeBlocoInexistente();
}

function montarDadosDaSala({ nome, capacidade, descricao, precoLocacao, idBloco }: DadosDeSala) {
  return { nome, capacidade, descricao: descricao ?? null, preco: precoLocacao, idBloco };
}

export async function listarSalas({ disponivel, dia, turno }: FiltrosDeConsultaDeSalas = {}): Promise<SalaSelecionada[]> {
  if (disponivel !== "true") return salaRepository.listarSalas();

  const disponibilidade: DadosDeDisponibilidade = disponibilidadeSchema.parse({ dia, turno });
  return salaRepository.listarSalas({ dia: converterDiaEmData(disponibilidade.dia), turno: disponibilidade.turno });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada> {
  const sala: SalaSelecionada | null = await salaRepository.buscarSalaPorId(id);
  if (!sala) throw erroDeSalaInexistente();
  return sala;
}

export async function criarSala(dados: DadosDeSala): Promise<SalaSelecionada> {
  await exigirBlocoExistente(dados.idBloco);
  try {
    return await salaRepository.criarSala(montarDadosDaSala(dados));
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeBlocoInexistente() });
  }
}

export async function atualizarSala(id: number, dados: DadosDeSala): Promise<SalaSelecionada> {
  await buscarSalaPorId(id);
  await exigirBlocoExistente(dados.idBloco);
  try {
    return await salaRepository.atualizarSala(id, montarDadosDaSala(dados));
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeBlocoInexistente(), P2025: erroDeSalaInexistente() });
  }
}

export async function removerSala(id: number): Promise<void> {
  await buscarSalaPorId(id);
  if ((await salaRepository.contarReservasDaSala(id)) > 0) throw erroDeSalaComReservas();
  try {
    await salaRepository.removerSala(id);
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeSalaComReservas(), P2025: erroDeSalaInexistente() });
  }
}
