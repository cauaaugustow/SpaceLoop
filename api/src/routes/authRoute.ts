import { Router } from "express";
import { autenticarUsuario } from "../controllers/authController.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { loginSchema } from "shared";

export const authRoutes: Router = Router();

authRoutes.post("/login", validarBody(loginSchema), autenticarUsuario);
