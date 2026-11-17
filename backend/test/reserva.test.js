import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { once } from "node:events";
import test from "node:test";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";

test("administrador gerencia usuários, salas e reservas; usuário comum fica limitado aos próprios dados", async () => {
  const arquivo = `reserva-test-${randomUUID()}.db`;
  process.env.DATABASE_URL = `file:./${arquivo}`;
  process.env.JWT_SECRET = "segredo-apenas-para-teste";

  const banco = new Database(arquivo);
  banco.exec(readFileSync("prisma/migrations/20260917175032_criar_tabelas_iniciais/migration.sql", "utf8"));
  banco.exec(readFileSync("prisma/migrations/20261110000000_reserva_sala_dia_turno_unicos/migration.sql", "utf8"));
  banco.close();

  let servidor;
  let prisma;
  try {
    ({ default: prisma } = await import("../src/config/prisma.js"));
    const { reservaRoutes } = await import("../src/routes/reservaRoute.js");
    const { userRoutes } = await import("../src/routes/userRoute.js");
    const { salaRoutes } = await import("../src/routes/salaRoute.js");
    const { authRoutes } = await import("../src/routes/authRoute.js");

    const dono = await prisma.usuario.create({
      data: { nome: "Dono", email: "dono@teste.local", cpf: "12345678901", senhaHash: "teste" },
    });
    const outro = await prisma.usuario.create({
      data: { nome: "Outro", email: "outro@teste.local", cpf: "10987654321", senhaHash: "teste" },
    });
    const admin = await prisma.usuario.create({
      data: { nome: "Admin", email: "admin@teste.local", cpf: "98765432109", senhaHash: await bcrypt.hash("senha-forte-123", 4), eadmin: true },
    });
    const sala = await prisma.sala.create({
      data: { nome: "Sala de teste", capacidade: 2, preco: 0 },
    });

    const app = express();
    app.use(express.json());
    app.use(authRoutes);
    app.use(userRoutes);
    app.use(salaRoutes);
    app.use(reservaRoutes);
    app.use((erro, req, res, next) => {
      if (erro.name === "ZodError") {
        return res.status(400).json({ message: "Dados inválidos", errors: erro.issues });
      }
      return res.status(erro.statusCode || 500).json({ message: erro.message });
    });
    servidor = app.listen(0, "127.0.0.1");
    await once(servidor, "listening");

    const base = `http://127.0.0.1:${servidor.address().port}`;
    const token = (id) => jwt.sign({ sub: String(id) }, process.env.JWT_SECRET);
    const requisitar = async (caminho, metodo = "GET", idUsuario, corpo) => {
      const resposta = await fetch(`${base}${caminho}`, {
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
    const loginAdmin = await requisitar("/login", "POST", null, { email: admin.email, senha: "senha-forte-123" });
    assert.equal(loginAdmin.status, 200);
    assert.equal(loginAdmin.dados.usuario.eadmin, true);
    assert.equal((await requisitar("/usuarios", "GET", dono.id)).status, 403);
    assert.equal((await requisitar("/usuarios", "GET", admin.id)).dados.length, 3);
    assert.equal((await requisitar(`/usuarios/${outro.id}`, "GET", dono.id)).status, 403);
    assert.equal((await requisitar(`/usuarios/${dono.id}`, "GET", dono.id)).status, 200);
    assert.equal((await requisitar(`/usuarios/${outro.id}`, "PATCH", dono.id, { nome: "Alterado" })).status, 403);
    assert.equal((await requisitar(`/usuarios/${outro.id}`, "PATCH", admin.id, { nome: "Alterado" })).status, 200);
    assert.equal((await requisitar("/salas", "POST", dono.id, { nome: "Nova sala", capacidade: 4, precoLocacao: 50 })).status, 403);
    const salaAdmin = await requisitar("/salas", "POST", admin.id, { nome: "Nova sala", capacidade: 4, precoLocacao: 50 });
    assert.equal(salaAdmin.status, 201);
    const salaEditada = await requisitar(`/salas/${salaAdmin.dados.id}`, "PATCH", admin.id, { precoLocacao: 75 });
    assert.equal(salaEditada.status, 200);
    assert.equal(salaEditada.dados.preco, 75);
    assert.equal((await requisitar(`/salas/${salaAdmin.dados.id}`, "DELETE", admin.id)).status, 200);

    const dados = { idSala: sala.id, dia: "2026-12-10", turno: "manha" };
    assert.equal((await requisitar("/reservas", "POST", dono.id, { ...dados, idUsuario: outro.id })).status, 400);

    const criada = await requisitar("/reservas", "POST", dono.id, dados);
    assert.equal(criada.status, 201);
    assert.equal(criada.dados.idUsuario, dono.id);
    assert.equal(criada.dados.turno, "MANHA");
    const idReserva = criada.dados.id;

    assert.equal((await requisitar("/reservas", "POST", outro.id, dados)).status, 409);
    assert.equal((await requisitar("/reservas", "GET", dono.id)).dados.length, 1);
    assert.equal((await requisitar("/reservas", "GET", outro.id)).dados.length, 0);
    assert.equal((await requisitar("/reservas", "GET", admin.id)).dados.length, 1);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", dono.id)).dados.id, idReserva);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", outro.id)).status, 403);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", admin.id)).status, 200);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", outro.id, { turno: "tarde" })).status, 403);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "DELETE", outro.id)).status, 403);

    const reservaAdmin = await requisitar("/reservas", "POST", admin.id, { ...dados, dia: "2026-12-11", idUsuario: outro.id });
    assert.equal(reservaAdmin.status, 201);
    assert.equal(reservaAdmin.dados.idUsuario, outro.id);
    assert.equal((await requisitar(`/reservas/${reservaAdmin.dados.id}`, "PATCH", admin.id, { turno: "noite" })).status, 200);
    assert.equal((await requisitar(`/reservas/${reservaAdmin.dados.id}`, "DELETE", admin.id)).status, 200);

    const atualizada = await requisitar(`/reservas/${idReserva}`, "PATCH", dono.id, { turno: "tarde" });
    assert.equal(atualizada.status, 200);
    assert.equal(atualizada.dados.turno, "TARDE");

    assert.equal((await requisitar(`/reservas/${idReserva}`, "DELETE", dono.id)).status, 200);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", dono.id)).status, 404);
  } finally {
    if (servidor) await new Promise((resolve) => servidor.close(resolve));
    if (prisma) await prisma.$disconnect();
    rmSync(arquivo, { force: true });
  }
});
