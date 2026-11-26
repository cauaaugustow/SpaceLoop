import { Router } from "express";
import { cadastrarUsuario } from "../controllers/usuarioController.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { criarUsuarioSchema } from "shared";

export const rotasDeUsuarios: Router = Router();

rotasDeUsuarios.post("/usuario", validarBody(criarUsuarioSchema), cadastrarUsuario);
