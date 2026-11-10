import { Router } from "express";
import { authValidate } from "../middlewares/authValidate.js";
import {
    criarReserva,
    listarReservas,
    buscarReservas,
    atualizarReservas,
    deletarReservas
} from "../controllers/reservaController.js"

export const reservaRoutes = Router();

reservaRoutes.use(authValidate);

reservaRoutes.post("/reservas", criarReserva);
reservaRoutes.get("/reservas", listarReservas);
reservaRoutes.get("/reservas/:id", buscarReservas);
reservaRoutes.patch("/reservas/:id", atualizarReservas);
reservaRoutes.delete("/reservas/:id", deletarReservas);
