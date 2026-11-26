import { Router } from "express";
import { reservaSchema } from "shared";
import { authValidate } from "../middlewares/authValidate.js";
import { validarBody } from "../middlewares/validarSchema.js";
import {
  atualizarReserva,
  buscarReserva,
  criarReserva,
  listarReservas,
  removerReserva,
} from "../controllers/reservaController.js";

export const reservaRoutes: Router = Router();

reservaRoutes.get("/reservas", authValidate, listarReservas);
reservaRoutes.get("/reservas/:id", authValidate, buscarReserva);
reservaRoutes.post("/reservas", authValidate, validarBody(reservaSchema), criarReserva);
reservaRoutes.put("/reservas/:id", authValidate, validarBody(reservaSchema), atualizarReserva);
reservaRoutes.delete("/reservas/:id", authValidate, removerReserva);
