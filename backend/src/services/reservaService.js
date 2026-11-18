import {
  criarReserva as criarReservaRepository,
  buscarReservaPorId as buscarReservaPorIdRepository,
  listaReservas as listaReservasRepository,
  atualizarReserva as atualizarReservaRepository,
  deletarReserva as deletarReservaRepository,
} from "../repositories/reservaRepository.js";
import { buscarSalaPorId } from "./salaService.js";
import { getUsersById } from "./usuarioService.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { criarReservaSchema, atualizarReservaSchema } from "../schema/reservaSchema.js";
import { hojeNoFusoDaAplicacao } from "../lib/dataReserva.js";

export async function criarReserva(dados, idUsuario) {
  const { idSala, dia, turno } = criarReservaSchema.parse(dados);

  await getUsersById(idUsuario);
  await buscarSalaPorId(idSala);

  try {
    return await criarReservaRepository({ idUsuario, idSala, dia, turno });
  } catch (erro) {
    if (erro.code === "P2002") {
      throw new ErroDeDominio("Esta sala já possui uma reserva neste dia e turno", 409);
    }
    throw erro;
  }
}

export async function getAllReservas(idUsuario, eadmin) {
  return listaReservasRepository(idUsuario, eadmin);
}

export async function buscarReservaPorId(id, idUsuario, eadmin) {
  const reserva = await buscarReservaPorIdRepository(id);
  if (!reserva) throw new ErroDeDominio("Reserva não encontrada", 404);

  if (!eadmin && reserva.idUsuario !== idUsuario) {
    throw new ErroDeDominio("Acesso negado", 403);
  }
  return reserva;
}

export async function atualizarReserva(id, dados, idUsuario, eadmin) {
  const reserva = await buscarReservaPorId(id, idUsuario, eadmin);

  const dadosValidados = atualizarReservaSchema.parse(dados);
  const diaFinal = dadosValidados.dia ?? reserva.dia;
  if (diaFinal.toISOString().slice(0, 10) < hojeNoFusoDaAplicacao()) {
    throw new ErroDeDominio("A data da reserva não pode estar no passado", 400);
  }
  if (dadosValidados.idSala) {
    await buscarSalaPorId(dadosValidados.idSala);
  }

  try {
    return await atualizarReservaRepository(id, dadosValidados);
  } catch (erro) {
    if (erro.code === "P2002") {
      throw new ErroDeDominio("Esta sala já possui uma reserva neste dia e turno", 409);
    }
    if (erro.code === "P2025") {
      throw new ErroDeDominio("Reserva não encontrada", 404);
    }
    throw erro;
  }
}

export async function deletarReserva(id, idUsuario, eadmin) {
  await buscarReservaPorId(id, idUsuario, eadmin);

  try {
    await deletarReservaRepository(id);
  } catch (erro) {
    if (erro.code === "P2025") {
      throw new ErroDeDominio("Reserva não encontrada", 404);
    }
    throw erro;
  }

  return { success: true, message: "Reserva deletada com sucesso!" };
}
