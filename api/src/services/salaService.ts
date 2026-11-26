import {
  criarSala as criarSalaRepository,
  buscarSalaPorId as buscarSalaPorIdRepository,
  listarSalas as listarSalasRepository,
  atualizarSalas as atualizarSalasRepository,
  deletarSalas as deletarSalasRepository,
  contarReservasDaSala,
  type SalaSelecionada,
} from "../repositories/salaRepository.js";
import { buscarBlocoPorId } from "../repositories/blocoRepository.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { RespostaDeRemocao } from "./respostaDeRemocao.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { converterDiaEmData } from "../lib/converterDiaEmData.js";
import {
  disponibilidadeSchema,
  type DadosDeAtualizacaoDeSala,
  type DadosDeDisponibilidade,
  type DadosDeNovaSala,
} from "shared";

export type FiltrosDeConsultaDeSalas = { disponivel?: unknown; dia?: unknown; turno?: unknown };

async function exigirBlocoExistente(idBloco: number): Promise<void> {
  if (!(await buscarBlocoPorId(idBloco))) {
    throw new ErroDeDominio("Bloco não encontrado", 404);
  }
}

export async function criarSala({ nome, capacidade, descricao, precoLocacao, idBloco }: DadosDeNovaSala): Promise<SalaSelecionada> {
  await exigirBlocoExistente(idBloco);
  return criarSalaRepository({
    nome,
    capacidade,
    descricao: descricao ?? null,
    preco: precoLocacao,
    idBloco,
  });
}

export async function getAllSalas(filtros: FiltrosDeConsultaDeSalas = {}): Promise<SalaSelecionada[]> {
  const { disponivel, dia, turno }: FiltrosDeConsultaDeSalas = filtros;

  if (disponivel !== "true" && disponivel !== true) {
    return listarSalasRepository();
  }

  const disponibilidade: DadosDeDisponibilidade = disponibilidadeSchema.parse({ dia, turno });
  const inicio: Date = converterDiaEmData(disponibilidade.dia);

  const fim: Date = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 1);

  return listarSalasRepository({ inicio, fim, turno: disponibilidade.turno });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada> {
  const sala: SalaSelecionada | null = await buscarSalaPorIdRepository(id);

  if (!sala) throw new ErroDeDominio("Sala não encontrada.", 404);
  return sala;
}

export async function atualizarSala(id: number, { precoLocacao, ...demaisDados }: DadosDeAtualizacaoDeSala): Promise<SalaSelecionada> {
  const dadosAtualizados: Prisma.SalaUncheckedUpdateInput = { ...demaisDados };
  await buscarSalaPorId(id);
  if (demaisDados.idBloco !== undefined) {
    await exigirBlocoExistente(demaisDados.idBloco);
  }
  if (precoLocacao !== undefined) {
    dadosAtualizados.preco = precoLocacao;
  }

  return atualizarSalasRepository(id, dadosAtualizados);
}

export async function deletarSala(id: number): Promise<RespostaDeRemocao> {
  await buscarSalaPorId(id);

  if ((await contarReservasDaSala(id)) > 0) {
    throw new ErroDeDominio("A sala possui reservas e não pode ser removida", 409);
  }

  await deletarSalasRepository(id);

  return { success: true, message: "Sala deletada com sucesso!" };
}
