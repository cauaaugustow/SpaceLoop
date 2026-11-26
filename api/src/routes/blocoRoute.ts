import { Router } from "express";
import { blocoSchema } from "shared";
import { authValidate } from "../middlewares/authValidate.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { atualizarBloco, buscarBloco, criarBloco, listarBlocos, removerBloco } from "../controllers/blocoController.js";

export const blocoRoutes: Router = Router();

blocoRoutes.get("/blocos", authValidate, listarBlocos);
blocoRoutes.get("/blocos/:id", authValidate, buscarBloco);
blocoRoutes.post("/blocos", authValidate, validarBody(blocoSchema), criarBloco);
blocoRoutes.put("/blocos/:id", authValidate, validarBody(blocoSchema), atualizarBloco);
blocoRoutes.delete("/blocos/:id", authValidate, removerBloco);
