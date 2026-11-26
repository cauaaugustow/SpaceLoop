import { Router } from "express";
import { clienteSchema } from "shared";
import { authValidate } from "../middlewares/authValidate.js";
import { validarBody } from "../middlewares/validarSchema.js";
import {
  atualizarCliente,
  buscarCliente,
  criarCliente,
  listarClientes,
  removerCliente,
} from "../controllers/clienteController.js";

export const clienteRoutes: Router = Router();

clienteRoutes.get("/clientes", authValidate, listarClientes);
clienteRoutes.get("/clientes/:id", authValidate, buscarCliente);
clienteRoutes.post("/clientes", authValidate, validarBody(clienteSchema), criarCliente);
clienteRoutes.put("/clientes/:id", authValidate, validarBody(clienteSchema), atualizarCliente);
clienteRoutes.delete("/clientes/:id", authValidate, removerCliente);
