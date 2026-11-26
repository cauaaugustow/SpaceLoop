import { Router } from "express";
import {
    criarSalas,
    listarSalas,
    buscarSalas,
    atualizarSalas,
    deletarSalas
} from "../controllers/salaController.js"
import { authValidate } from "../middlewares/authValidate.js";
import { exigirAdmin } from "../middlewares/exigirAdmin.js";

export const salaRoutes: Router = Router();

salaRoutes.post("/salas", authValidate, exigirAdmin, criarSalas);
salaRoutes.get("/salas",  listarSalas);
salaRoutes.get("/salas/:id", buscarSalas);
salaRoutes.patch("/salas/:id", authValidate, exigirAdmin ,atualizarSalas);
salaRoutes.delete("/salas/:id", authValidate, exigirAdmin, deletarSalas);