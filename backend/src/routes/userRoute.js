import { Router } from "express";
import {
  atualizarUsuario,
  buscarUsuario,
  cadastrarUsuario,
  deletarUsuario,
  listarUsuarios,
} from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
} from "../schema/userSchema.js";

export const userRoutes = Router();

userRoutes.post("/usuario", validate(criarUsuarioSchema),cadastrarUsuario);
userRoutes.get("/usuarios", listarUsuarios);
userRoutes.get("/usuarios/:id", buscarUsuario);
userRoutes.patch("/usuarios/:id", validate(atualizarUsuarioSchema), atualizarUsuario);
userRoutes.delete("/usuarios/:id", deletarUsuario);
