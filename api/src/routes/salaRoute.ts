import { Router } from "express";
import {
    criarSalas,
    listarSalas,
    buscarSalas,
    atualizarSalas,
    deletarSalas
} from "../controllers/salaController.js"
import { authValidate } from "../middlewares/authValidate.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { atualizarSalaSchema, criarSalaSchema } from "shared";

export const salaRoutes: Router = Router();

salaRoutes.post("/salas", authValidate, validarBody(criarSalaSchema), criarSalas);
salaRoutes.get("/salas",  listarSalas);
salaRoutes.get("/salas/:id", buscarSalas);
salaRoutes.patch("/salas/:id", authValidate, validarBody(atualizarSalaSchema), atualizarSalas);
salaRoutes.delete("/salas/:id", authValidate, deletarSalas);