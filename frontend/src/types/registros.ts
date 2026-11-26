import type { Turno } from "shared";

export type Registro = {
  id: number;
};

export type Bloco = Registro & {
  nome: string;
  descricao: string | null;
};

export type Cliente = Registro & {
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
};

export type Sala = Registro & {
  nome: string;
  capacidade: number;
  descricao: string | null;
  preco: number;
  idBloco: number;
  bloco: { nome: string };
};

export type Reserva = Registro & {
  dia: string;
  turno: Turno;
  idSala: number;
  idCliente: number;
  sala: { nome: string };
  cliente: { nome: string };
};
