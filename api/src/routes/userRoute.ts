import { Router } from "express";
import { authValidate } from "../middlewares/authValidate.js";
import { exigirAdmin } from "../middlewares/exigirAdmin.js";
import { exigirProprioOuAdmin } from "../middlewares/exigirProprioOuAdm.js";
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

export const userRoutes: Router = Router();

userRoutes.post("/usuario", validate(criarUsuarioSchema), cadastrarUsuario);

userRoutes.get("/usuarios", authValidate, exigirAdmin, listarUsuarios);
userRoutes.get("/usuarios/:id", authValidate, exigirProprioOuAdmin, buscarUsuario);
userRoutes.patch("/usuarios/:id", authValidate, exigirProprioOuAdmin, validate(atualizarUsuarioSchema), atualizarUsuario);
userRoutes.delete("/usuarios/:id", authValidate, exigirProprioOuAdmin, deletarUsuario);
