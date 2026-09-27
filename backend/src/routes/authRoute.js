import { Router } from "express";
import { autenticarUsuario } from "../controllers/authController";
import { userRoutes } from "./userRoute";
import { validate } from "../middlewares/validate";
import { authUsuarioSchema } from "../schema/authSchema";

export const authRoutes = Router()

userRoutes.post("/login", validate(authUsuarioSchema), autenticarUsuario)
