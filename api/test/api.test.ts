import "dotenv/config";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test, { after, before } from "node:test";
import express, { type Express, type Router } from "express";
import { criarBancoTemporario, type BancoTemporario } from "./bancoTemporario.js";
import { tratarErros, type ErroDeCampo } from "../src/middlewares/tratarErros.js";
import type { PrismaClient, Reserva } from "../src/generated/prisma/client.js";

type Resposta = { status: number; corpo: any };

type CrudDeExemplo = {
  caminho: string;
  criacao: () => object;
  edicao: () => object;
  campoEditado: string;
  valorEsperado: unknown;
};

const diaAPartirDeHoje = (dias: number): string => new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);

let banco: BancoTemporario;
let prisma: PrismaClient;
let servidor: Server;
let enderecoBase: string;
let token: string = "";

async function requisitar(caminho: string, metodo: string = "GET", corpo?: object, tokenEnviado: string = token): Promise<Resposta> {
  const resposta: globalThis.Response = await fetch(`${enderecoBase}${caminho}`, {
    method: metodo,
    headers: {
      ...(tokenEnviado && { Authorization: `Bearer ${tokenEnviado}` }),
      ...(corpo && { "Content-Type": "application/json" }),
    },
    ...(corpo && { body: JSON.stringify(corpo) }),
  });
  const texto: string = await resposta.text();
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null };
}

const listarCamposComErro = (resposta: Resposta): string[] =>
  resposta.corpo.erros.map((erro: ErroDeCampo) => erro.campo).sort();

before(async () => {
  banco = await criarBancoTemporario();
  process.env.DATABASE_URL = banco.url;
  process.env.JWT_SECRET = "segredo-apenas-para-teste";

  prisma = (await import("../src/config/prisma.js")).default;
  const rotas: Router[] = [
    (await import("../src/routes/usuarioRoute.js")).rotasDeUsuarios,
    (await import("../src/routes/autenticacaoRoute.js")).rotasDeAutenticacao,
    (await import("../src/routes/blocoRoute.js")).rotasDeBlocos,
    (await import("../src/routes/clienteRoute.js")).rotasDeClientes,
    (await import("../src/routes/salaRoute.js")).rotasDeSalas,
    (await import("../src/routes/reservaRoute.js")).rotasDeReservas,
  ];

  const app: Express = express();
  app.use(express.json());
  for (const rota of rotas) app.use(rota);
  app.use(tratarErros);
  servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  enderecoBase = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
});

after(async () => {
  if (servidor) await new Promise<void>((resolve) => servidor.close(() => resolve()));
  if (prisma) await prisma.$disconnect();
  if (banco) await banco.apagar();
});

test("cadastro e login não devolvem a senha e validam cada campo", async () => {
  const cadastroVazio: Resposta = await requisitar("/usuario", "POST", {});
  assert.equal(cadastroVazio.status, 400);
  assert.deepEqual(listarCamposComErro(cadastroVazio), ["email", "nome", "senha"]);

  const usuario: object = { nome: "Professor", email: "PROFESSOR@teste.local", senha: "senha-forte-123" };
  const cadastro: Resposta = await requisitar("/usuario", "POST", usuario);
  assert.equal(cadastro.status, 201);
  assert.equal(cadastro.corpo.email, "professor@teste.local");
  assert.equal("senhaHash" in cadastro.corpo, false);
  assert.equal("senha" in cadastro.corpo, false);

  const cadastroRepetido: Resposta = await requisitar("/usuario", "POST", usuario);
  assert.equal(cadastroRepetido.status, 409);
  assert.deepEqual(listarCamposComErro(cadastroRepetido), ["email"]);

  assert.deepEqual(listarCamposComErro(await requisitar("/login", "POST", { email: "invalido", senha: "curta" })), ["email", "senha"]);
  assert.equal((await requisitar("/login", "POST", { email: "professor@teste.local", senha: "senha-errada-123" })).status, 401);

  const login: Resposta = await requisitar("/login", "POST", { email: "professor@teste.local", senha: "senha-forte-123" });
  assert.equal(login.status, 200);
  assert.equal("senhaHash" in login.corpo.usuario, false);
  token = login.corpo.token;
});

test("as quatro tabelas têm CRUD protegido com os status esperados", async () => {
  const blocoDeApoio: Resposta = await requisitar("/blocos", "POST", { nome: "Bloco de apoio" });
  const salaDeApoio: Resposta = await requisitar("/salas", "POST", { nome: "Sala de apoio", capacidade: 2, precoLocacao: 0, idBloco: blocoDeApoio.corpo.id });
  const clienteDeApoio: Resposta = await requisitar("/clientes", "POST", { nome: "Cliente de apoio", cpf: "111.222.333-44", email: "apoio@teste.local" });
  assert.equal(clienteDeApoio.corpo.cpf, "11122233344");

  const cruds: CrudDeExemplo[] = [
    {
      caminho: "/blocos",
      criacao: () => ({ nome: "Bloco A", descricao: "Térreo" }),
      edicao: () => ({ nome: "Bloco A reformado" }),
      campoEditado: "nome",
      valorEsperado: "Bloco A reformado",
    },
    {
      caminho: "/clientes",
      criacao: () => ({ nome: "Ana Souza", cpf: "55566677788", email: "ana@teste.local", telefone: "85999990000" }),
      edicao: () => ({ nome: "Ana Lima", cpf: "55566677788", email: "ana@teste.local" }),
      campoEditado: "telefone",
      valorEsperado: null,
    },
    {
      caminho: "/salas",
      criacao: () => ({ nome: "Sala Farol", capacidade: 4, precoLocacao: 50, idBloco: blocoDeApoio.corpo.id }),
      edicao: () => ({ nome: "Sala Farol", capacidade: 4, precoLocacao: "75", idBloco: blocoDeApoio.corpo.id }),
      campoEditado: "preco",
      valorEsperado: 75,
    },
    {
      caminho: "/reservas",
      criacao: () => ({ dia: diaAPartirDeHoje(30), turno: "manha", idSala: salaDeApoio.corpo.id, idCliente: clienteDeApoio.corpo.id }),
      edicao: () => ({ dia: diaAPartirDeHoje(31), turno: "noite", idSala: salaDeApoio.corpo.id, idCliente: clienteDeApoio.corpo.id }),
      campoEditado: "turno",
      valorEsperado: "NOITE",
    },
  ];

  for (const { caminho, criacao, edicao, campoEditado, valorEsperado } of cruds) {
    assert.equal((await requisitar(caminho, "GET", undefined, "")).status, 401, caminho);
    assert.equal((await requisitar(caminho, "POST", {})).status, 400, caminho);

    const criado: Resposta = await requisitar(caminho, "POST", criacao());
    assert.equal(criado.status, 201, caminho);
    const caminhoDoItem: string = `${caminho}/${criado.corpo.id}`;

    assert.equal((await requisitar(caminho)).corpo.some((item: { id: number }) => item.id === criado.corpo.id), true, caminho);
    assert.equal((await requisitar(caminhoDoItem)).status, 200, caminho);
    assert.equal((await requisitar(caminhoDoItem, "PUT", {})).status, 400, caminho);

    const editado: Resposta = await requisitar(caminhoDoItem, "PUT", edicao());
    assert.equal(editado.status, 200, caminho);
    assert.equal(editado.corpo[campoEditado], valorEsperado, caminho);

    const removido: Resposta = await requisitar(caminhoDoItem, "DELETE");
    assert.equal(removido.status, 204, caminho);
    assert.equal(removido.corpo, null, caminho);

    assert.equal((await requisitar(caminhoDoItem)).status, 404, caminho);
    assert.equal((await requisitar(caminhoDoItem, "PUT", edicao())).status, 404, caminho);
    assert.equal((await requisitar(caminhoDoItem, "DELETE")).status, 404, caminho);
    assert.equal((await requisitar(`${caminho}/abc`)).status, 400, caminho);
    assert.equal((await requisitar(`${caminho}/9999999999`)).status, 400, caminho);
  }
});

test("valores repetidos, relações e regras de reserva", async () => {
  const bloco: Resposta = await requisitar("/blocos", "POST", { nome: "Bloco B" });
  const nomeRepetido: Resposta = await requisitar("/blocos", "POST", { nome: "Bloco B" });
  assert.equal(nomeRepetido.status, 409);
  assert.deepEqual(listarCamposComErro(nomeRepetido), ["nome"]);

  const cliente: Resposta = await requisitar("/clientes", "POST", { nome: "Bruno", cpf: "98765432100", email: "bruno@teste.local" });
  const cpfRepetido: Resposta = await requisitar("/clientes", "POST", { nome: "Outro", cpf: "987.654.321-00", email: "outro@teste.local" });
  assert.equal(cpfRepetido.status, 409);
  assert.deepEqual(listarCamposComErro(cpfRepetido), ["cpf"]);
  const emailRepetido: Resposta = await requisitar("/clientes", "POST", { nome: "Outro", cpf: "12312312312", email: "BRUNO@teste.local" });
  assert.deepEqual(listarCamposComErro(emailRepetido), ["email"]);
  assert.equal((await requisitar(`/clientes/${cliente.corpo.id}`, "PUT", { nome: "Bruno", cpf: "98765432100", email: "bruno@teste.local" })).status, 200);

  const dadosDaSala: object = { nome: "Sala Duna", capacidade: 8, precoLocacao: 90, idBloco: bloco.corpo.id };
  assert.deepEqual(listarCamposComErro(await requisitar("/salas", "POST", { ...dadosDaSala, idBloco: 999999 })), ["idBloco"]);
  assert.deepEqual(listarCamposComErro(await requisitar("/salas", "POST", { ...dadosDaSala, precoLocacao: null })), ["precoLocacao"]);
  const sala: Resposta = await requisitar("/salas", "POST", dadosDaSala);
  assert.equal(sala.corpo.bloco.nome, "Bloco B");

  const dia: string = diaAPartirDeHoje(40);
  const dadosDaReserva = { dia, turno: "manha", idSala: sala.corpo.id, idCliente: cliente.corpo.id };
  assert.equal((await requisitar("/reservas", "POST", { ...dadosDaReserva, dia: "2020-01-01" })).status, 400);
  assert.deepEqual((await requisitar("/reservas", "POST", { ...dadosDaReserva, dia: "2099-02-30" })).corpo.erros, [{ campo: "dia", mensagem: "Informe uma data válida" }]);
  assert.deepEqual(listarCamposComErro(await requisitar("/reservas", "POST", { ...dadosDaReserva, idCliente: 999999 })), ["idCliente"]);

  const reserva: Resposta = await requisitar("/reservas", "POST", dadosDaReserva);
  assert.equal(reserva.status, 201);
  assert.equal(reserva.corpo.dia.slice(0, 10), dia);
  const reservaListada: Reserva & { sala: { nome: string }; cliente: { nome: string } } = (await requisitar("/reservas")).corpo.find(
    (item: Reserva) => item.id === reserva.corpo.id,
  );
  assert.equal(reservaListada.sala.nome, "Sala Duna");
  assert.equal(reservaListada.cliente.nome, "Bruno");

  assert.equal((await requisitar("/reservas", "POST", dadosDaReserva)).status, 409);
  const reservaDaTarde: Resposta = await requisitar("/reservas", "POST", { ...dadosDaReserva, turno: "tarde" });
  assert.equal((await requisitar(`/reservas/${reservaDaTarde.corpo.id}`, "PUT", dadosDaReserva)).status, 409);

  const temSalaDisponivel = async (turno: string): Promise<boolean> =>
    (await requisitar(`/salas?disponivel=true&dia=${dia}&turno=${turno}`)).corpo.some((item: { id: number }) => item.id === sala.corpo.id);
  assert.equal(await temSalaDisponivel("manha"), false);
  assert.equal(await temSalaDisponivel("noite"), true);
  assert.equal((await requisitar("/salas?disponivel=true&dia=2026-02-30&turno=manha")).status, 400);

  assert.equal((await requisitar(`/blocos/${bloco.corpo.id}`, "DELETE")).status, 409);
  assert.equal((await requisitar(`/salas/${sala.corpo.id}`, "DELETE")).status, 409);
  assert.equal((await requisitar(`/clientes/${cliente.corpo.id}`, "DELETE")).status, 409);
});
