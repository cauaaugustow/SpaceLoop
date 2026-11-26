import { Router } from "express";
import { cadastrarUsuario } from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { criarUsuarioSchema } from "../schema/userSchema.js";

export const userRoutes: Router = Router();

userRoutes.post("/usuario", validate(criarUsuarioSchema), cadastrarUsuario);
