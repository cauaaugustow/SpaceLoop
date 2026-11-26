import {
  criarSala as criarSalaRepository,
  buscarSalaPorId as buscarSalaPorIdRepository,
  listarSalas as listarSalasRepository,
  atualizarSalas as atualizarSalasRepository,
  deletarSalas as deletarSalasRepository,
  type SalaSelecionada,
} from "../repositories/salaRepository.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { RespostaDeRemocao } from "./respostaDeRemocao.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import {
  criarSalaSchema,
  updateSalaSchema,
  type DadosDeNovaSala,
  type DadosDeAtualizacaoDeSala,
} from "../schema/salaSchema.js";
import { disponibilidadeSchema, type DadosDeDisponibilidade } from "../schema/reservaSchema.js";

export type FiltrosDeConsultaDeSalas = { disponivel?: unknown; dia?: unknown; turno?: unknown };

export async function criarSala(dados: unknown): Promise<SalaSelecionada> {
  const { nome, capacidade, descricao, precoLocacao }: DadosDeNovaSala = criarSalaSchema.parse(dados);
  return criarSalaRepository({
    nome,
    capacidade,
    descricao: descricao ?? null,
    preco: precoLocacao,
  });
}

export async function getAllSalas(filtros: FiltrosDeConsultaDeSalas = {}): Promise<SalaSelecionada[]> {
  const { disponivel, dia, turno }: FiltrosDeConsultaDeSalas = filtros;

  if (disponivel !== "true" && disponivel !== true) {
    return listarSalasRepository();
  }

  const { dia: inicio, turno: turnoNormalizado }: DadosDeDisponibilidade = disponibilidadeSchema.parse({ dia, turno });

  const fim: Date = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 1);

  return listarSalasRepository({ inicio, fim, turno: turnoNormalizado });
}

export async function buscarSalaPorId(id: number): Promise<SalaSelecionada> {
  const sala: SalaSelecionada | null = await buscarSalaPorIdRepository(id);

  if (!sala) throw new ErroDeDominio("Sala não encontrada.", 404);
  return sala;
}

export async function atualizarSala(id: number, dados: unknown): Promise<SalaSelecionada> {
  const { precoLocacao, ...demaisDados }: DadosDeAtualizacaoDeSala = updateSalaSchema.parse(dados);
  const dadosAtualizados: Prisma.SalaUpdateInput = { ...demaisDados };
  await buscarSalaPorId(id);
  if (precoLocacao !== undefined) {
    dadosAtualizados.preco = precoLocacao;
  }

  return atualizarSalasRepository(id, dadosAtualizados);
}

export async function deletarSala(id: number): Promise<RespostaDeRemocao> {
  await buscarSalaPorId(id);

  await deletarSalasRepository(id);

  return { success: true, message: "Sala deletada com sucesso!" };
}
