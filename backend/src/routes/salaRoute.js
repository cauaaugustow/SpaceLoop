import { Router } from "express";
import {
    criarSalas,
    listarSalas,
    buscarSalas,
    atualizarSalas,
    deletarSalas
} from "../controllers/salaController.js"

export const salaRoutes = Router();

salaRoutes.post("/salas", criarSalas);
salaRoutes.get("/salas", listarSalas);
salaRoutes.get("/salas/:id", buscarSalas);
salaRoutes.patch("/salas/:id",  atualizarSalas);
salaRoutes.delete("/salas/:id", deletarSalas);