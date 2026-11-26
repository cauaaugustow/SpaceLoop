import { Router } from "express";
import { salaSchema } from "shared";
import { authValidate } from "../middlewares/authValidate.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { atualizarSala, buscarSala, criarSala, listarSalas, removerSala } from "../controllers/salaController.js";

export const salaRoutes: Router = Router();

salaRoutes.get("/salas", authValidate, listarSalas);
salaRoutes.get("/salas/:id", authValidate, buscarSala);
salaRoutes.post("/salas", authValidate, validarBody(salaSchema), criarSala);
salaRoutes.put("/salas/:id", authValidate, validarBody(salaSchema), atualizarSala);
salaRoutes.delete("/salas/:id", authValidate, removerSala);
