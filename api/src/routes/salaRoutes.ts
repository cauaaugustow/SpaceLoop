import { Router } from "express";
import { salaSchema } from "shared";
import { autenticarRequisicao } from "../middlewares/autenticarRequisicao.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { atualizarSala, buscarSala, criarSala, listarSalas, removerSala } from "../controllers/salaController.js";

export const rotasDeSalas: Router = Router();

rotasDeSalas.get("/salas", autenticarRequisicao, listarSalas);
rotasDeSalas.get("/salas/:id", autenticarRequisicao, buscarSala);
rotasDeSalas.post("/salas", autenticarRequisicao, validarBody(salaSchema), criarSala);
rotasDeSalas.put("/salas/:id", autenticarRequisicao, validarBody(salaSchema), atualizarSala);
rotasDeSalas.delete("/salas/:id", autenticarRequisicao, removerSala);
