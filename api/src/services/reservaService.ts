import type { DadosDeReserva } from "shared";
import * as reservaRepository from "../repositories/reservaRepository.js";
import type { ReservaSelecionada } from "../repositories/reservaRepository.js";
import { buscarSalaPorId } from "../repositories/salaRepository.js";
import { buscarClientePorId } from "../repositories/clienteRepository.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../error/lancarErroTraduzidoDoPrisma.js";
import { converterDiaEmData } from "../lib/converterDiaEmData.js";

const erroDeReservaInexistente = (): ErroDeDominio => new ErroDeDominio("Reserva não encontrada", 404);
const erroDeHorarioOcupado = (): ErroDeDominio =>
  new ErroDeDominio("Esta sala já possui uma reserva neste dia e turno", 409, "turno");

async function exigirSalaEClienteExistentes({ idSala, idCliente }: DadosDeReserva): Promise<void> {
  if (!(await buscarSalaPorId(idSala))) throw new ErroDeDominio("Sala não encontrada", 404, "idSala");
  if (!(await buscarClientePorId(idCliente))) throw new ErroDeDominio("Cliente não encontrado", 404, "idCliente");
}

export async function listarReservas(): Promise<ReservaSelecionada[]> {
  return reservaRepository.listarReservas();
}

export async function buscarReservaPorId(id: number): Promise<ReservaSelecionada> {
  const reserva: ReservaSelecionada | null = await reservaRepository.buscarReservaPorId(id);
  if (!reserva) throw erroDeReservaInexistente();
  return reserva;
}

export async function criarReserva(dados: DadosDeReserva): Promise<ReservaSelecionada> {
  await exigirSalaEClienteExistentes(dados);
  try {
    return await reservaRepository.criarReserva({ ...dados, dia: converterDiaEmData(dados.dia) });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeHorarioOcupado() });
  }
}

export async function atualizarReserva(id: number, dados: DadosDeReserva): Promise<ReservaSelecionada> {
  await buscarReservaPorId(id);
  await exigirSalaEClienteExistentes(dados);
  try {
    return await reservaRepository.atualizarReserva(id, { ...dados, dia: converterDiaEmData(dados.dia) });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeHorarioOcupado(), P2025: erroDeReservaInexistente() });
  }
}

export async function removerReserva(id: number): Promise<void> {
  await buscarReservaPorId(id);
  try {
    await reservaRepository.removerReserva(id);
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2025: erroDeReservaInexistente() });
  }
}
