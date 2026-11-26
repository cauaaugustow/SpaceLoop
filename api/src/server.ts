import express, { type Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { userRoutes } from "./routes/userRoute.js";
import { authRoutes } from "./routes/authRoute.js";
import { salaRoutes } from "./routes/salaRoute.js";
import { blocoRoutes } from "./routes/blocoRoute.js";
import { clienteRoutes } from "./routes/clienteRoute.js";
import { reservaRoutes } from "./routes/reservaRoute.js";
import { tratarErros } from "./middlewares/tratarErros.js";
dotenv.config();

const app: Express = express();
const PORT: string | number = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(userRoutes);
app.use(authRoutes);
app.use(blocoRoutes);
app.use(clienteRoutes);
app.use(salaRoutes);
app.use(reservaRoutes);

app.use(tratarErros);

app.listen(PORT, (): void => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
