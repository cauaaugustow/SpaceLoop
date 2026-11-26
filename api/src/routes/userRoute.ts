import { Router } from "express";
import { cadastrarUsuario } from "../controllers/userController.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { criarUsuarioSchema } from "shared";

export const userRoutes: Router = Router();

userRoutes.post("/usuario", validarBody(criarUsuarioSchema), cadastrarUsuario);
