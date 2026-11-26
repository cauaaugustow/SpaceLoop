import { Router } from "express";
import { autenticarUsuario } from "../controllers/autenticacaoController.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { loginSchema } from "shared";

export const rotasDeAutenticacao: Router = Router();

rotasDeAutenticacao.post("/login", validarBody(loginSchema), autenticarUsuario);
