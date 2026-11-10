import{
    criarReserva,
    getAllReservas,
    buscarReservaPorId,
    atualizarReserva,
    deletarReserva
} from "../services/reservaService.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

function idDoParametro(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

export async function criarReserva(req, res) {
  const reserva = await criarReservas(req.body);
  res.status(201).json(reserva);
}

export async function listarReservas(req, res) {
  res.json(await getAllReservas());
}

export async function buscarReservas(req, res) {
  res.json(await buscarReservaPorId(idDoParametro(req)));
}

export async function atualizarReservas(req, res) {
  res.json(await atualizarReserva(idDoParametro(req), req.body));
}

export async function deletarReservas(req, res) {
  res.json(await deletarReserva(idDoParametro(req)));
}
