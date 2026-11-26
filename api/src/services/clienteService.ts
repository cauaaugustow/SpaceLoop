import type { DadosDeCliente } from "shared";
import * as clienteRepository from "../repositories/clienteRepository.js";
import type { ClienteSelecionado } from "../repositories/clienteRepository.js";
import { contarReservasDoCliente } from "../repositories/reservaRepository.js";
import { ErroDeDominio } from "../erros/erroDeDominio.js";
import { lancarErroTraduzidoDoPrisma } from "../erros/lancarErroTraduzidoDoPrisma.js";

const erroDeClienteInexistente = (): ErroDeDominio => new ErroDeDominio("Cliente não encontrado", 404);
const erroDeCpfOuEmailRepetido = (): ErroDeDominio => new ErroDeDominio("CPF ou e-mail já cadastrado", 409);
const erroDeClienteComReservas = (): ErroDeDominio =>
  new ErroDeDominio("O cliente possui reservas e não pode ser removido", 409);

async function exigirCpfEEmailLivres({ cpf, email }: DadosDeCliente, idDoProprioCliente?: number): Promise<void> {
  const clienteComEsteCpf: ClienteSelecionado | null = await clienteRepository.buscarClientePorCpf(cpf);
  if (clienteComEsteCpf && clienteComEsteCpf.id !== idDoProprioCliente) {
    throw new ErroDeDominio("CPF já cadastrado", 409, "cpf");
  }

  const clienteComEsteEmail: ClienteSelecionado | null = await clienteRepository.buscarClientePorEmail(email);
  if (clienteComEsteEmail && clienteComEsteEmail.id !== idDoProprioCliente) {
    throw new ErroDeDominio("E-mail já cadastrado", 409, "email");
  }
}

export async function listarClientes(): Promise<ClienteSelecionado[]> {
  return clienteRepository.listarClientes();
}

export async function buscarClientePorId(id: number): Promise<ClienteSelecionado> {
  const cliente: ClienteSelecionado | null = await clienteRepository.buscarClientePorId(id);
  if (!cliente) throw erroDeClienteInexistente();
  return cliente;
}

export async function criarCliente(dadosDoCliente: DadosDeCliente): Promise<ClienteSelecionado> {
  await exigirCpfEEmailLivres(dadosDoCliente);
  try {
    return await clienteRepository.criarCliente({ ...dadosDoCliente, telefone: dadosDoCliente.telefone ?? null });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeCpfOuEmailRepetido() });
  }
}

export async function atualizarCliente(id: number, dadosDoCliente: DadosDeCliente): Promise<ClienteSelecionado> {
  await buscarClientePorId(id);
  await exigirCpfEEmailLivres(dadosDoCliente, id);
  try {
    return await clienteRepository.atualizarCliente(id, { ...dadosDoCliente, telefone: dadosDoCliente.telefone ?? null });
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2002: erroDeCpfOuEmailRepetido(), P2025: erroDeClienteInexistente() });
  }
}

export async function removerCliente(id: number): Promise<void> {
  await buscarClientePorId(id);
  if ((await contarReservasDoCliente(id)) > 0) throw erroDeClienteComReservas();
  try {
    await clienteRepository.removerCliente(id);
  } catch (erro: unknown) {
    lancarErroTraduzidoDoPrisma(erro, { P2003: erroDeClienteComReservas(), P2025: erroDeClienteInexistente() });
  }
}
