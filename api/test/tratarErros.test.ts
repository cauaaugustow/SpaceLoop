import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test, { type TestContext } from "node:test";
import express, { type Express, type Request, type Response } from "express";
import { criarUsuarioSchema } from "shared";
import { tratarErros } from "../src/middlewares/tratarErros.js";

test("JSON malformado vira 400 em português e erro inesperado vira 500 registrado no log", async (contexto: TestContext) => {
  const registrarErroSpy = contexto.mock.method(console, "error", (): void => {});
  const app: Express = express();
  app.use(express.json());
  app.post("/falha", (req: Request, res: Response): void => {
    throw new Error("detalhe que não pode ser exposto");
  });
  app.use(tratarErros);
  const servidor: Server = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  const enderecoDaRota: string = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}/falha`;
  const enviarCorpo = (corpo: string): Promise<globalThis.Response> =>
    fetch(enderecoDaRota, { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo });

  try {
    const respostaDeJsonInvalido: globalThis.Response = await enviarCorpo('{"email":');
    assert.equal(respostaDeJsonInvalido.status, 400);
    assert.deepEqual(await respostaDeJsonInvalido.json(), { message: "JSON inválido" });
    assert.equal(registrarErroSpy.mock.callCount(), 0);

    const respostaDeErroInterno: globalThis.Response = await enviarCorpo("{}");
    assert.equal(respostaDeErroInterno.status, 500);
    assert.deepEqual(await respostaDeErroInterno.json(), { message: "Erro interno do servidor" });
    assert.equal(registrarErroSpy.mock.callCount(), 1);
  } finally {
    await new Promise<void>((resolve) => servidor.close(() => resolve()));
  }
});

test("cadastro recusa senha maior que o limite do bcrypt", () => {
  const validarSenha = (senha: string): boolean =>
    criarUsuarioSchema.safeParse({ nome: "Teste", email: "teste@teste.local", senha }).success;

  assert.equal(validarSenha("a".repeat(72)), true);
  assert.equal(validarSenha("a".repeat(73)), false);
  assert.equal(validarSenha("ã".repeat(37)), false);
});
