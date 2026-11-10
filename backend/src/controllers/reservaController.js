import {
  criarReserva as criarReservaService,
  getAllReservas,
  buscarReservaPorId,
  atualizarReserva,
  deletarReserva,
} from "../services/reservaService.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

function idDoParametro(req) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

function idDoUsuario(req) {
  const id = Number(req.user?.sub);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ErroDeDominio("Token inválido", 401);
  }
  return id;
}

export async function criarReserva(req, res) {
  const reserva = await criarReservaService(req.body, idDoUsuario(req));
  res.status(201).json(reserva);
}

export async function listarReservas(req, res) {
  res.json(await getAllReservas());
}

export async function buscarReservas(req, res) {
  res.json(await buscarReservaPorId(idDoParametro(req)));
}

export async function atualizarReservas(req, res) {
  res.json(await atualizarReserva(idDoParametro(req), req.body, idDoUsuario(req)));
}

export async function deletarReservas(req, res) {
  res.json(await deletarReserva(idDoParametro(req), idDoUsuario(req)));
}
