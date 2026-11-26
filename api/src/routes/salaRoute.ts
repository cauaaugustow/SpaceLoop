import { Router } from "express";
import {
    criarSalas,
    listarSalas,
    buscarSalas,
    atualizarSalas,
    deletarSalas
} from "../controllers/salaController.js"
import { authValidate } from "../middlewares/authValidate.js";

export const salaRoutes: Router = Router();

salaRoutes.post("/salas", authValidate, criarSalas);
salaRoutes.get("/salas",  listarSalas);
salaRoutes.get("/salas/:id", buscarSalas);
salaRoutes.patch("/salas/:id", authValidate, atualizarSalas);
salaRoutes.delete("/salas/:id", authValidate, deletarSalas);