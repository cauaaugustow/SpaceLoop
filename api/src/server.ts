import express, { type Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { rotasDeUsuarios } from "./routes/usuarioRoute.js";
import { rotasDeAutenticacao } from "./routes/autenticacaoRoute.js";
import { rotasDeSalas } from "./routes/salaRoute.js";
import { rotasDeBlocos } from "./routes/blocoRoute.js";
import { rotasDeClientes } from "./routes/clienteRoute.js";
import { rotasDeReservas } from "./routes/reservaRoute.js";
import { tratarErros } from "./middlewares/tratarErros.js";
dotenv.config();

const app: Express = express();
const porta: string | number = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(rotasDeUsuarios);
app.use(rotasDeAutenticacao);
app.use(rotasDeBlocos);
app.use(rotasDeClientes);
app.use(rotasDeSalas);
app.use(rotasDeReservas);

app.use(tratarErros);

app.listen(porta, (): void => {
  console.log(`Servidor rodando na porta ${porta}`);
});
