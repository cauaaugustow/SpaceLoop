import "dotenv/config";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import bcrypt from "bcryptjs";
import express, { type Express } from "express";
import jwt from "jsonwebtoken";
import { criarBancoTemporario, type BancoTemporario } from "./bancoTemporario.js";
import { tratarErros, type ErroDeCampo } from "../src/middlewares/tratarErros.js";
import type { Bloco, Cliente, PrismaClient, Reserva, Sala, Usuario } from "../src/generated/prisma/client.js";

type Resposta = { status: number; dados: any };

test("usuário logado gerencia salas e reservas com as regras de conflito e data", async () => {
  const dia: string = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const diaSeguinte: string = new Date(Date.now() + 31 * 86_400_000).toISOString().slice(0, 10);
  const banco: BancoTemporario = await criarBancoTemporario();
  process.env.DATABASE_URL = banco.url;
  const segredoDeTeste: string = "segredo-apenas-para-teste";
  process.env.JWT_SECRET = segredoDeTeste;

  let servidor: Server | undefined;
  let prisma: PrismaClient | undefined;
  try {
    const { default: prismaDoTeste }: typeof import("../src/config/prisma.js") = await import("../src/config/prisma.js");
    prisma = prismaDoTeste;
    const { reservaRoutes } = await import("../src/routes/reservaRoute.js");
    const { userRoutes } = await import("../src/routes/userRoute.js");
    const { salaRoutes } = await import("../src/routes/salaRoute.js");
    const { authRoutes } = await import("../src/routes/authRoute.js");

    const usuario: Usuario = await prisma.usuario.create({
      data: { nome: "Professor", email: "professor@teste.local", senhaHash: await bcrypt.hash("senha-forte-123", 4) },
    });
    const bloco: Bloco = await prisma.bloco.create({ data: { nome: "Bloco A" } });
    const cliente: Cliente = await prisma.cliente.create({
      data: { nome: "Cliente Um", cpf: "12345678901", email: "um@teste.local" },
    });
    const outroCliente: Cliente = await prisma.cliente.create({
      data: { nome: "Cliente Dois", cpf: "10987654321", email: "dois@teste.local" },
    });
    const sala: Sala = await prisma.sala.create({
      data: { nome: "Sala de teste", capacidade: 2, preco: 0, idBloco: bloco.id },
    });

    const app: Express = express();
    app.use(express.json());
    app.use(authRoutes);
    app.use(userRoutes);
    app.use(salaRoutes);
    app.use(reservaRoutes);
    app.use(tratarErros);
    servidor = app.listen(0, "127.0.0.1");
    await once(servidor, "listening");

    const base: string = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
    const token = (id: number): string => jwt.sign({ sub: String(id) }, segredoDeTeste);
    const requisitar = async (caminho: string, metodo: string = "GET", idUsuario?: number | null, corpo?: object): Promise<Resposta> => {
      const resposta: globalThis.Response = await fetch(`${base}${caminho}`, {
        method: metodo,
        headers: {
          ...(idUsuario && { Authorization: `Bearer ${token(idUsuario)}` }),
          ...(corpo && { "Content-Type": "application/json" }),
        },
        ...(corpo && { body: JSON.stringify(corpo) }),
      });
      return { status: resposta.status, dados: await resposta.json() };
    };

    assert.equal((await requisitar("/reservas")).status, 401);

    const listarCamposComErro = (resposta: Resposta): string[] => resposta.dados.errors.map((erro: ErroDeCampo) => erro.campo).sort();

    const cadastroVazio: Resposta = await requisitar("/usuario", "POST", null, {});
    assert.equal(cadastroVazio.status, 400);
    assert.deepEqual(listarCamposComErro(cadastroVazio), ["email", "nome", "senha"]);
    assert.deepEqual(listarCamposComErro(await requisitar("/login", "POST", null, { email: "invalido", senha: "curta" })), ["email", "senha"]);

    const salaVazia: Resposta = await requisitar("/salas", "POST", usuario.id, {});
    assert.equal(salaVazia.status, 400);
    assert.deepEqual(listarCamposComErro(salaVazia), ["capacidade", "idBloco", "nome", "precoLocacao"]);
    assert.deepEqual(listarCamposComErro(await requisitar("/salas", "POST", usuario.id, { nome: "Sem preço", capacidade: "4", precoLocacao: null, idBloco: bloco.id })), ["precoLocacao"]);

    const reservaVazia: Resposta = await requisitar("/reservas", "POST", usuario.id, {});
    assert.deepEqual(listarCamposComErro(reservaVazia), ["dia", "idCliente", "idSala", "turno"]);
    const reservaComDataInexistente: Resposta = await requisitar("/reservas", "POST", usuario.id, { idSala: sala.id, idCliente: cliente.id, dia: "2099-02-30", turno: "manha" });
    assert.deepEqual(reservaComDataInexistente.dados.errors, [{ campo: "dia", message: "Informe uma data válida" }]);
    assert.equal((await requisitar(`/salas/${sala.id}`, "PATCH", usuario.id, {})).status, 400);

    const cadastro: Resposta = await requisitar("/usuario", "POST", null, { nome: "Novo", email: "NOVO@teste.local", senha: "senha-forte-123" });
    assert.equal(cadastro.status, 201);
    assert.equal(cadastro.dados.email, "novo@teste.local");
    assert.equal("senhaHash" in cadastro.dados, false);
    assert.equal("senha" in cadastro.dados, false);
    assert.equal((await requisitar("/usuario", "POST", null, { nome: "Duplicado", email: usuario.email, senha: "senha-forte-123" })).status, 409);

    const login: Resposta = await requisitar("/login", "POST", null, { email: usuario.email, senha: "senha-forte-123" });
    assert.equal(login.status, 200);
    assert.equal("senhaHash" in login.dados.usuario, false);
    assert.equal((await requisitar("/login", "POST", null, { email: usuario.email, senha: "senha-errada-123" })).status, 401);

    const novaSala: { nome: string; capacidade: number; precoLocacao: number; idBloco: number } = { nome: "Nova sala", capacidade: 4, precoLocacao: 50, idBloco: bloco.id };
    assert.equal((await requisitar("/salas", "POST", null, novaSala)).status, 401);
    assert.equal((await requisitar("/salas", "POST", usuario.id, { ...novaSala, capacidade: 0 })).status, 400);
    assert.equal((await requisitar("/salas", "POST", usuario.id, { ...novaSala, idBloco: 999999 })).status, 404);
    assert.equal((await requisitar("/salas/999999", "GET")).status, 404);
    const salaCriada: Resposta = await requisitar("/salas", "POST", usuario.id, novaSala);
    assert.equal(salaCriada.status, 201);
    assert.equal(salaCriada.dados.idBloco, bloco.id);
    const salaEditada: Resposta = await requisitar(`/salas/${salaCriada.dados.id}`, "PATCH", usuario.id, { precoLocacao: 75 });
    assert.equal(salaEditada.status, 200);
    assert.equal(salaEditada.dados.preco, 75);
    assert.equal((await requisitar(`/salas/${salaCriada.dados.id}`, "PATCH", usuario.id, { idBloco: 999999 })).status, 404);
    assert.equal((await requisitar(`/salas/${salaCriada.dados.id}`, "DELETE", usuario.id)).status, 200);

    const dados: { idSala: number; idCliente: number; dia: string; turno: string } = { idSala: sala.id, idCliente: cliente.id, dia, turno: "manha" };
    assert.equal((await requisitar("/reservas", "POST", usuario.id, { ...dados, dia: "2020-01-01" })).status, 400);
    assert.equal((await requisitar("/reservas", "POST", usuario.id, { ...dados, turno: "madrugada" })).status, 400);
    assert.equal((await requisitar("/reservas", "POST", usuario.id, { ...dados, idCliente: 999999 })).status, 404);

    const criada: Resposta = await requisitar("/reservas", "POST", usuario.id, dados);
    assert.equal(criada.status, 201);
    assert.equal(criada.dados.idCliente, cliente.id);
    assert.equal(criada.dados.turno, "MANHA");
    assert.equal(criada.dados.dia.slice(0, 10), dia);
    const idReserva: number = criada.dados.id;

    const disponiveis: Resposta = await requisitar(`/salas?disponivel=true&dia=${dia}&turno=manha`);
    assert.equal(disponiveis.status, 200);
    assert.equal(disponiveis.dados.some((item: Sala) => item.id === sala.id), false);
    assert.equal((await requisitar(`/salas?disponivel=true&dia=${dia}&turno=tarde`)).dados.some((item: Sala) => item.id === sala.id), true);
    assert.equal((await requisitar("/salas?disponivel=true&dia=2026-02-30&turno=manha")).status, 400);
    assert.equal((await requisitar("/salas?disponivel=true&dia=2020-01-01&turno=manha")).status, 400);

    assert.equal((await requisitar("/reservas", "POST", usuario.id, { ...dados, idCliente: outroCliente.id })).status, 409);
    assert.equal((await requisitar("/reservas", "GET", usuario.id)).dados.length, 1);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", usuario.id)).dados.id, idReserva);
    assert.equal((await requisitar(`/salas/${sala.id}`, "DELETE", usuario.id)).status, 409);

    const reservaDaTarde: Resposta = await requisitar("/reservas", "POST", usuario.id, { ...dados, turno: "tarde" });
    assert.equal(reservaDaTarde.status, 201);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", usuario.id, { turno: "tarde" })).status, 409);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", usuario.id, { idCliente: 999999 })).status, 404);
    const atualizada: Resposta = await requisitar(`/reservas/${idReserva}`, "PATCH", usuario.id, { dia: diaSeguinte, idCliente: outroCliente.id });
    assert.equal(atualizada.status, 200);
    assert.equal(atualizada.dados.idCliente, outroCliente.id);

    assert.equal((await requisitar(`/reservas/${idReserva}`, "DELETE", usuario.id)).status, 200);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", usuario.id)).status, 404);

    const reservaAntiga: Reserva = await prisma.reserva.create({
      data: { idSala: sala.id, idCliente: cliente.id, dia: new Date("2020-01-01T00:00:00.000Z"), turno: "MANHA" },
    });
    assert.equal((await requisitar(`/reservas/${reservaAntiga.id}`, "PATCH", usuario.id, { turno: "TARDE" })).status, 400);
    assert.equal((await requisitar(`/reservas/${reservaAntiga.id}`, "PATCH", usuario.id, { dia: diaSeguinte })).status, 200);
  } finally {
    const servidorAberto: Server | undefined = servidor;
    if (servidorAberto) await new Promise<void>((resolve) => servidorAberto.close(() => resolve()));
    if (prisma) await prisma.$disconnect();
    await banco.apagar();
  }
});
