import type { DadosDeBloco, DadosDeCliente, DadosDeReserva, DadosDeSala } from "shared";
import type { Bloco, Cliente, Reserva, Sala } from "../types/registros";
import { criarServicoDeCrud, type ServicoDeCrud } from "./servicoDeCrud";

export const blocoService: ServicoDeCrud<Bloco, DadosDeBloco> = criarServicoDeCrud("/blocos");

export const clienteService: ServicoDeCrud<Cliente, DadosDeCliente> = criarServicoDeCrud("/clientes");

export const salaService: ServicoDeCrud<Sala, DadosDeSala> = criarServicoDeCrud("/salas");

export const reservaService: ServicoDeCrud<Reserva, DadosDeReserva> = criarServicoDeCrud("/reservas");
