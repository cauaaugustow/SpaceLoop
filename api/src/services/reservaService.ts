import {
  criarReserva as criarReservaRepository,
  buscarReservaPorId as buscarReservaPorIdRepository,
  listaReservas as listaReservasRepository,
  atualizarReserva as atualizarReservaRepository,
  deletarReserva as deletarReservaRepository,
  type ReservaSelecionada,
} from "../repositories/reservaRepository.js";
import { buscarClientePorId } from "../repositories/clienteRepository.js";
import { buscarSalaPorId } from "./salaService.js";
import type { RespostaDeRemocao } from "./respostaDeRemocao.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { codigoDoErroPrisma } from "../error/codigoDoErroPrisma.js";
import {
  criarReservaSchema,
  atualizarReservaSchema,
  type DadosDeNovaReserva,
  type DadosDeAtualizacaoDeReserva,
} from "../schema/reservaSchema.js";
import { hojeNoFusoDaAplicacao } from "../lib/dataReserva.js";

async function exigirClienteExistente(idCliente: number): Promise<void> {
  if (!(await buscarClientePorId(idCliente))) {
    throw new ErroDeDominio("Cliente não encontrado", 404);
  }
}

export async function criarReserva(dados: unknown): Promise<ReservaSelecionada> {
  const { idSala, idCliente, dia, turno }: DadosDeNovaReserva = criarReservaSchema.parse(dados);

  await exigirClienteExistente(idCliente);
  await buscarSalaPorId(idSala);

  try {
    return await criarReservaRepository({ idCliente, idSala, dia, turno });
  } catch (erro: unknown) {
    if (codigoDoErroPrisma(erro) === "P2002") {
      throw new ErroDeDominio("Esta sala já possui uma reserva neste dia e turno", 409);
    }
    throw erro;
  }
}

export async function getAllReservas(): Promise<ReservaSelecionada[]> {
  return listaReservasRepository();
}

export async function buscarReservaPorId(id: number): Promise<ReservaSelecionada> {
  const reserva: ReservaSelecionada | null = await buscarReservaPorIdRepository(id);
  if (!reserva) throw new ErroDeDominio("Reserva não encontrada", 404);
  return reserva;
}

export async function atualizarReserva(id: number, dados: unknown): Promise<ReservaSelecionada> {
  const reserva: ReservaSelecionada = await buscarReservaPorId(id);

  const dadosValidados: DadosDeAtualizacaoDeReserva = atualizarReservaSchema.parse(dados);
  const diaFinal: Date = dadosValidados.dia ?? reserva.dia;
  if (diaFinal.toISOString().slice(0, 10) < hojeNoFusoDaAplicacao()) {
    throw new ErroDeDominio("A data da reserva não pode estar no passado", 400);
  }
  if (dadosValidados.idSala) {
    await buscarSalaPorId(dadosValidados.idSala);
  }
  if (dadosValidados.idCliente) {
    await exigirClienteExistente(dadosValidados.idCliente);
  }

  try {
    return await atualizarReservaRepository(id, dadosValidados);
  } catch (erro: unknown) {
    if (codigoDoErroPrisma(erro) === "P2002") {
      throw new ErroDeDominio("Esta sala já possui uma reserva neste dia e turno", 409);
    }
    if (codigoDoErroPrisma(erro) === "P2025") {
      throw new ErroDeDominio("Reserva não encontrada", 404);
    }
    throw erro;
  }
}

export async function deletarReserva(id: number): Promise<RespostaDeRemocao> {
  await buscarReservaPorId(id);

  try {
    await deletarReservaRepository(id);
  } catch (erro: unknown) {
    if (codigoDoErroPrisma(erro) === "P2025") {
      throw new ErroDeDominio("Reserva não encontrada", 404);
    }
    throw erro;
  }

  return { success: true, message: "Reserva deletada com sucesso!" };
}
