import type { Router } from "express";
import { rotasDeAutenticacao } from "./autenticacaoRoute.js";
import { rotasDeBlocos } from "./blocoRoute.js";
import { rotasDeClientes } from "./clienteRoute.js";
import { rotasDeReservas } from "./reservaRoute.js";
import { rotasDeSalas } from "./salaRoute.js";
import { rotasDeUsuarios } from "./usuarioRoute.js";

export const rotasDaApi: Router[] = [
  rotasDeUsuarios,
  rotasDeAutenticacao,
  rotasDeBlocos,
  rotasDeClientes,
  rotasDeSalas,
  rotasDeReservas,
];
