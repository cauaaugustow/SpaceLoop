import express, { type Express } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { documentoOpenApi } from "./documentacao/documentoOpenApi.js";
import { tratarErros } from "./middlewares/tratarErros.js";
import { rotasDaApi } from "./routes/rotasDaApi.js";

export function criarAplicacao(): Express {
  const aplicacao: Express = express();

  aplicacao.use(cors());
  aplicacao.use(express.json());
  aplicacao.use("/docs", swaggerUi.serve, swaggerUi.setup(documentoOpenApi));
  for (const rotas of rotasDaApi) aplicacao.use(rotas);
  aplicacao.use(tratarErros);

  return aplicacao;
}
