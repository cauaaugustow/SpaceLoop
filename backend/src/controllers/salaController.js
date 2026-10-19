import{
    criarSala,
    getAllSalas,
    listarSalas,
    buscarSalaPorId,
    atualizarSala,
    deletarSala
} from "../services/salaService.js"
import { ErroDeDominio } from "../error/erroDeDominio.js"

function idDoParametro(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeDominio("ID inválido", 400);
  }
  return id;
}

export async function criarSalas(req, res) {
  const sala = await criarSala(req.body);
  res.status(201).json(sala);
}

export async function listarSalas(req, res) {
  res.json(await getAllSalas());
}

export async function buscarSalas(req, res) {
  res.json(await buscarSalaPorId(idDoParametro(req)));
}

export async function atualizarSalas(req, res) {
  res.json(await atualizarSala(idDoParametro(req), req.body));
}

export async function deletarSalas(req, res) {
  res.json(await deletarSala(idDoParametro(req)));
}