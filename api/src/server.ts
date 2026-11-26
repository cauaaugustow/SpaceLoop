import express, { type Express, type NextFunction, type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ZodError } from "zod";
import { userRoutes } from "./routes/userRoute.js";
import { authRoutes } from "./routes/authRoute.js";
import { salaRoutes } from "./routes/salaRoute.js";
import { reservaRoutes } from "./routes/reservaRoute.js";
dotenv.config();

const app: Express = express();
const PORT: string | number = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(userRoutes);
app.use(authRoutes);
app.use(salaRoutes);
app.use(reservaRoutes);

app.use((erro: Error & { statusCode?: number }, req: Request, res: Response, next: NextFunction): void => {
  if (erro instanceof ZodError) {
    res.status(400).json({ message: "Dados inválidos", errors: erro.issues });
    return;
  }

  res.status(erro.statusCode || 500).json({
    message: erro.statusCode ? erro.message : "Erro interno do servidor",
  });
});

app.listen(PORT, (): void => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
