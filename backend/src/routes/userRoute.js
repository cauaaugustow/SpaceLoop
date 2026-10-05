import { Router } from "express";
import { authValidate } from "../middlewares/authValidate.js";
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

userRoutes.get("/usuarios", authValidate, listarUsuarios);
userRoutes.get("/usuarios/:id", authValidate, buscarUsuario);
userRoutes.patch("/usuarios/:id", authValidate, validate(atualizarUsuarioSchema), atualizarUsuario);
userRoutes.delete("/usuarios/:id", authValidate, deletarUsuario);
