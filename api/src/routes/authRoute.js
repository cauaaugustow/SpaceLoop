import { Router } from "express";
import { autenticarUsuario } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { authUsuarioSchema } from "../schema/authSchema.js";

export const authRoutes = Router();

authRoutes.post("/login", validate(authUsuarioSchema), autenticarUsuario);
