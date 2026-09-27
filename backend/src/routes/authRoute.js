import { Router } from "express";
import { autenticarUsuario } from "../controllers/authController";
import { userRoutes } from "./userRoute";

export const authRoutes = Router()

userRoutes.post("/login", autenticarUsuario)
