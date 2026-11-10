import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { once } from "node:events";
import test from "node:test";
import Database from "better-sqlite3";
import express from "express";
import jwt from "jsonwebtoken";

test("reservas exigem autenticação, respeitam o dono e evitam horários duplicados", async () => {
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

    const dono = await prisma.usuario.create({
      data: { nome: "Dono", email: "dono@teste.local", cpf: "12345678901", senhaHash: "teste" },
    });
    const outro = await prisma.usuario.create({
      data: { nome: "Outro", email: "outro@teste.local", cpf: "10987654321", senhaHash: "teste" },
    });
    const sala = await prisma.sala.create({
      data: { nome: "Sala de teste", capacidade: 2, preco: 0 },
    });

    const app = express();
    app.use(express.json());
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

    const dados = { idSala: sala.id, dia: "2026-12-10", turno: "manha" };
    assert.equal((await requisitar("/reservas", "POST", dono.id, { ...dados, idUsuario: outro.id })).status, 400);

    const criada = await requisitar("/reservas", "POST", dono.id, dados);
    assert.equal(criada.status, 201);
    assert.equal(criada.dados.idUsuario, dono.id);
    assert.equal(criada.dados.turno, "MANHA");
    const idReserva = criada.dados.id;

    assert.equal((await requisitar("/reservas", "POST", outro.id, dados)).status, 409);
    assert.equal((await requisitar("/reservas", "GET", dono.id)).dados.length, 1);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "GET", dono.id)).dados.id, idReserva);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "PATCH", outro.id, { turno: "tarde" })).status, 403);
    assert.equal((await requisitar(`/reservas/${idReserva}`, "DELETE", outro.id)).status, 403);

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
