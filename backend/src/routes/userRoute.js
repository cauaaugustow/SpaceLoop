import { Router } from "express";
import {
  atualizarUsuario,
  buscarUsuario,
  cadastrarUsuario,
  deletarUsuario,
  listarUsuarios,
} from "../controllers/userController.js";

export const userRoutes = Router();

userRoutes.post("/usuario", cadastrarUsuario);
userRoutes.get("/usuarios", listarUsuarios);
userRoutes.get("/usuarios/:id", buscarUsuario);
userRoutes.patch("/usuarios/:id", atualizarUsuario);
userRoutes.delete("/usuarios/:id", deletarUsuario);
