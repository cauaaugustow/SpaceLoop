import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { once } from "node:events";
import { execFile } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import type { PrismaClient, Reserva, Sala, Usuario } from "../src/generated/prisma/client.js";

type Resposta = { status: number; dados: any };

const execFileAsync: typeof execFile.__promisify__ = promisify(execFile);

test("administrador gerencia usuários, salas e reservas; usuário comum fica limitado aos próprios dados", async () => {
  const dia: string = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const diaSeguinte: string = new Date(Date.now() + 31 * 86_400_000).toISOString().slice(0, 10);
  const arquivo: string = `reserva-test-${randomUUID()}.db`;
  process.env.DATABASE_URL = `file:./${arquivo}`;
  const segredoDeTeste: string = "segredo-apenas-para-teste";
  process.env.JWT_SECRET = segredoDeTeste;

  const banco: Database.Database = new Database(arquivo);
  banco.exec(readFileSync("prisma/migrations/20260917175032_criar_tabelas_iniciais/migration.sql", "utf8"));
  banco.exec(readFileSync("prisma/migrations/20261110000000_reserva_sala_dia_turno_unicos/migration.sql", "utf8"));
  banco.close();

  let servidor: Server | undefined;
  let prisma: PrismaClient | undefined;
  try {
    const { default: prismaDoTeste }: typeof import("../src/config/prisma.js") = await import("../src/config/prisma.js");
    prisma = prismaDoTeste;
    const { reservaRoutes } = await import("../src/routes/reservaRoute.js");
    const { userRoutes } = await import("../src/routes/userRoute.js");
    const { salaRoutes } = await import("../src/routes/salaRoute.js");
    const { authRoutes } = await import("../src/routes/authRoute.js");

    const dono: Usuario = await prisma.usuario.create({
      data: { nome: "Dono", email: "dono@teste.local", cpf: "12345678901", senhaHash: "teste" },
    });
    const outro: Usuario = await prisma.usuario.create({
      data: { nome: "Outro", email: "outro@teste.local", cpf: "10987654321", senhaHash: "teste" },
    });
    const admin: Usuario = await prisma.usuario.create({
      data: { nome: "Admin", email: "admin@teste.local", cpf: "98765432109", senhaHash: await bcrypt.hash("senha-forte-123", 4), eadmin: true },
    });
    const sala: Sala = await prisma.sala.create({
      data: { nome: "Sala de teste", capacidade: 2, preco: 0 },
    });

    const app: Express = express();
    app.use(express.json());
    app.use(authRoutes);
    app.use(userRoutes);
    app.use(salaRoutes);
    app.use(reservaRoutes);
    app.use((erro: Error & { statusCode?: number; issues?: unknown }, req: Request, res: Response, next: NextFunction) => {
      if (erro.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: erro.issues });
      }
      return res.status(erro.statusCode || 500).json({ message: erro.message });
    });
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
    const loginAdmin: Resposta = await requisitar("/login", "POST", null, { email: admin.email, senha: "senha-forte-123" });
    assert.equal(loginAdmin.status, 200);
    assert.equal(loginAdmin.dados.usuario.eadmin, true);
    assert.equal((await requisitar("/usuarios", "GET", dono.id)).status, 403);
    assert.equal((await requisitar("/usuarios", "GET", admin.id)).dados.length, 3);
    assert.equal((await requisitar(`/usuarios/${outro.id}`, "GET", dono.id)).status, 403);
    assert.equal((await requisitar(`/usuarios/${dono.id}`, "GET", dono.id)).status, 200);
    assert.equal((await requisitar(`/usuarios/${outro.id}`, "PATCH", dono.id, { nome: "Alterado" })).status, 403);
    assert.equal((await requisitar(`/usuarios/${outro.id}`, "PATCH", admin.id, { nome: "Alterado" })).status, 200);
    assert.equal((await requisitar("/usuario", "POST", null, { nome: "Duplicado", email: dono.email, cpf: "22233344455", senha: "senha-forte-123" })).status, 409);
    assert.equal((await requisitar("/usuario", "POST", null, { nome: "Duplicado", email: "novo@teste.local", cpf: dono.cpf, senha: "senha-forte-123" })).status, 409);
    assert.equal((await requisitar("/salas", "POST", dono.id, { nome: "Nova sala", capacidade: 4, precoLocacao: 50 })).status, 403);
    assert.equal((await requisitar("/salas", "POST", admin.id, { nome: "Nova sala", capacidade: 0, precoLocacao: 50 })).status, 400);
    assert.equal((await requisitar("/salas/999999", "GET")).status, 404);
    const salaAdmin: Resposta = await requisitar("/salas", "POST", admin.id, { nome: "Nova sala", capacidade: 4, precoLocacao: 50 });
    assert.equal(salaAdmin.status, 201);
    const salaEditada: Resposta = await requisitar(`/salas/${salaAdmin.dados.id}`, "PATCH", admin.id, { precoLocacao: 75 });
    assert.equal(salaEditada.status, 200);
    assert.equal(salaEditada.dados.preco, 75);
    assert.equal((await requisitar(`/salas/${salaAdmin.dados.id}`, "PATCH", admin.id, { capacidade: -1 })).status, 400);
    assert.equal((await requisitar(`/salas/${salaAdmin.dados.id}`, "DELETE", admin.id)).status, 200);

    const dados: { idSala: number; dia: string; turno: string } = { idSala: sala.id, dia, turno: "manha" };
    assert.equal((await requisitar("/reservas", "POST", dono.id, { ...dados, idUsuario: outro.id })).status, 400);
    assert.equal((await requisitar("/reservas", "POST", dono.id, { ...dados, dia: "2020-01-01" })).status, 400);
    assert.equal((await requisitar("/reservas", "POST", dono.id, { ...dados, turno: "madrugada" })).status, 400);

    const criada: Resposta = await requisitar("/reservas", "POST", dono.id, dados);
    assert.equal(criada.status, 201);
    assert.equal(criada.dados.idUsuario, dono.id);
    assert.equal(criada.dados.turno, "MANHA");
    const idReserva: number = criada.dados.id;

    const disponiveis: Resposta = await requisitar(`/salas?disponivel=true&dia=${dia}&turno=manha`);
    assert.equal(disponiveis.status, 200);
    assert.equal(disponiveis.dados.some((item: Sala) => item.id === sala.id), false);
    assert.equal((await requisitar(`/salas?disponivel=true&dia=${dia}&turno=tarde`)).dados.some((item: Sala) => item.id === sala.id), true);
    assert.equal((await requisitar("/salas?disponivel=true&dia=2026-02-30&turno=manha")).status, 400);
    assert.equal((await requisitar("/salas?disponivel=true&dia=2020-01-01&turno=manha")).status, 400);
    assert.equal((await requisitar(`/salas?disponivel=true&dia=${dia}&turno=madrugada`)).status, 400);

    assert.equal((await requisitar("/reservas", "POST", outro.id, dados)).status, 409);
    assert.equal((await requisitar("/reservas", "GET", dono.id)).dados.length, 1);
    assert.equal((await requisitar("/reservas", "GET", outro.id)).dados.length, 0);
    assert.equal((await requisitar("/reservas", "GET", admin.id)).dados.length, 1);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", dono.id)).dados.id, idReserva);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", outro.id)).status, 403);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", admin.id)).status, 200);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", outro.id, { turno: "tarde" })).status, 403);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "DELETE", outro.id)).status, 403);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", dono.id, { dia: "2020-01-01" })).status, 400);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", dono.id, { turno: "madrugada" })).status, 400);

    const reservaConflitante: Resposta = await requisitar("/reservas", "POST", outro.id, { ...dados, turno: "tarde" });
    assert.equal(reservaConflitante.status, 201);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", dono.id, { turno: "tarde" })).status, 409);
    assert.equal((await requisitar(`/reservas/${reservaConflitante.dados.id}`, "DELETE", outro.id)).status, 200);

    const reservaAdmin: Resposta = await requisitar("/reservas", "POST", admin.id, { ...dados, dia: diaSeguinte, idUsuario: outro.id });
    assert.equal(reservaAdmin.status, 201);
    assert.equal(reservaAdmin.dados.idUsuario, outro.id);
    assert.equal((await requisitar(`/reservas/${reservaAdmin.dados.id}`, "PATCH", admin.id, { turno: "noite" })).status, 200);
    assert.equal((await requisitar(`/reservas/${reservaAdmin.dados.id}`, "DELETE", admin.id)).status, 200);

    const atualizada: Resposta = await requisitar(`/reservas/${idReserva}`, "PATCH", dono.id, { turno: "tarde" });
    assert.equal(atualizada.status, 200);
    assert.equal(atualizada.dados.turno, "TARDE");

    assert.equal((await requisitar(`/reservas/${idReserva}`, "DELETE", dono.id)).status, 200);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", dono.id)).status, 404);

    const reservaAntiga: Reserva = await prisma.reserva.create({
      data: { idSala: sala.id, idUsuario: dono.id, dia: new Date("2020-01-01T00:00:00.000Z"), turno: "MANHA" },
    });
    assert.equal((await requisitar(`/reservas/${reservaAntiga.id}`, "PATCH", dono.id, { turno: "TARDE" })).status, 400);
    assert.equal((await requisitar(`/reservas/${reservaAntiga.id}`, "PATCH", dono.id, { dia: diaSeguinte })).status, 200);

    const futuroAdmin: Usuario = await prisma.usuario.create({
      data: { nome: "Futuro Admin", email: "futuro@teste.local", cpf: "55566677788", senhaHash: "teste" },
    });
    await execFileAsync(process.execPath, ["--import", "tsx", "scripts/promoverAdmin.ts", futuroAdmin.email.toUpperCase()], {
      env: { ...process.env, DATABASE_URL: `file:./${arquivo}` },
    });
    assert.equal((await prisma.usuario.findUniqueOrThrow({ where: { id: futuroAdmin.id } })).eadmin, true);
  } finally {
    const servidorAberto: Server | undefined = servidor;
    if (servidorAberto) await new Promise<void>((resolve) => servidorAberto.close(() => resolve()));
    if (prisma) await prisma.$disconnect();
    rmSync(arquivo, { force: true });
  }
});
