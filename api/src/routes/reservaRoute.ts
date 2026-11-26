import { Router } from "express";
import { authValidate } from "../middlewares/authValidate.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { atualizarReservaSchema, criarReservaSchema } from "shared";
import {
    criarReserva,
    listarReservas,
    buscarReservas,
    atualizarReservas,
    deletarReservas
} from "../controllers/reservaController.js"

export const reservaRoutes: Router = Router();

reservaRoutes.use(authValidate);

reservaRoutes.post("/reservas", validarBody(criarReservaSchema), criarReserva);
reservaRoutes.get("/reservas", listarReservas);
reservaRoutes.get("/reservas/:id", buscarReservas);
reservaRoutes.patch("/reservas/:id", validarBody(atualizarReservaSchema), atualizarReservas);
reservaRoutes.delete("/reservas/:id", deletarReservas);
