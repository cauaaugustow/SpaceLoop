import { Router } from "express";
import { clienteSchema } from "shared";
import { autenticarRequisicao } from "../middlewares/autenticarRequisicao.js";
import { validarBody } from "../middlewares/validarSchema.js";
import {
  atualizarCliente,
  buscarCliente,
  criarCliente,
  listarClientes,
  removerCliente,
} from "../controllers/clienteController.js";

export const rotasDeClientes: Router = Router();

rotasDeClientes.get("/clientes", autenticarRequisicao, listarClientes);
rotasDeClientes.get("/clientes/:id", autenticarRequisicao, buscarCliente);
rotasDeClientes.post("/clientes", autenticarRequisicao, validarBody(clienteSchema), criarCliente);
rotasDeClientes.put("/clientes/:id", autenticarRequisicao, validarBody(clienteSchema), atualizarCliente);
rotasDeClientes.delete("/clientes/:id", autenticarRequisicao, removerCliente);
