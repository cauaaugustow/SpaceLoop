import "dotenv/config";
import { criarAplicacao } from "./aplicacao.js";

const porta: string | number = process.env.PORT || 3000;

criarAplicacao().listen(porta, (): void => {
  console.log(`Servidor rodando na porta ${porta}. Swagger em http://localhost:${porta}/docs`);
});
