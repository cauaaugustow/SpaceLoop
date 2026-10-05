import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { userRoutes } from './routes/userRoute.js';
import { authRoutes } from './routes/authRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(userRoutes);
app.use(authRoutes);

app.use((erro, req, res, next) => {
  if (erro.name === 'ZodError') {
    return res.status(400).json({ message: 'Dados inválidos', errors: erro.issues });
  }

  res.status(erro.statusCode || 500).json({
    message: erro.statusCode ? erro.message : 'Erro interno do servidor',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
