import type { Router } from "express";
import { rotasDeAutenticacao } from "./autenticacaoRoutes.js";
import { rotasDeBlocos } from "./blocoRoutes.js";
import { rotasDeClientes } from "./clienteRoutes.js";
import { rotasDeReservas } from "./reservaRoutes.js";
import { rotasDeSalas } from "./salaRoutes.js";
import { rotasDeUsuarios } from "./usuarioRoutes.js";

export const rotasDaApi: Router[] = [
  rotasDeUsuarios,
  rotasDeAutenticacao,
  rotasDeBlocos,
  rotasDeClientes,
  rotasDeSalas,
  rotasDeReservas,
];
