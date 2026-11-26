import { Router } from "express";
import { blocoSchema } from "shared";
import { autenticarRequisicao } from "../middlewares/autenticarRequisicao.js";
import { validarBody } from "../middlewares/validarSchema.js";
import { atualizarBloco, buscarBloco, criarBloco, listarBlocos, removerBloco } from "../controllers/blocoController.js";

export const rotasDeBlocos: Router = Router();

rotasDeBlocos.get("/blocos", autenticarRequisicao, listarBlocos);
rotasDeBlocos.get("/blocos/:id", autenticarRequisicao, buscarBloco);
rotasDeBlocos.post("/blocos", autenticarRequisicao, validarBody(blocoSchema), criarBloco);
rotasDeBlocos.put("/blocos/:id", autenticarRequisicao, validarBody(blocoSchema), atualizarBloco);
rotasDeBlocos.delete("/blocos/:id", autenticarRequisicao, removerBloco);
