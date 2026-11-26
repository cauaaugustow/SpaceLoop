import { Router } from "express";
import { reservaSchema } from "shared";
import { autenticarRequisicao } from "../middlewares/autenticarRequisicao.js";
import { validarBody } from "../middlewares/validarSchema.js";
import {
  atualizarReserva,
  buscarReserva,
  criarReserva,
  listarReservas,
  removerReserva,
} from "../controllers/reservaController.js";

export const rotasDeReservas: Router = Router();

rotasDeReservas.get("/reservas", autenticarRequisicao, listarReservas);
rotasDeReservas.get("/reservas/:id", autenticarRequisicao, buscarReserva);
rotasDeReservas.post("/reservas", autenticarRequisicao, validarBody(reservaSchema), criarReserva);
rotasDeReservas.put("/reservas/:id", autenticarRequisicao, validarBody(reservaSchema), atualizarReserva);
rotasDeReservas.delete("/reservas/:id", autenticarRequisicao, removerReserva);
