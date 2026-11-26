import "dotenv/config";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import type { Express } from "express";
import type { OpenAPIV3 } from "openapi-types";
import { blocoSchema, clienteSchema, criarUsuarioSchema, loginSchema, reservaSchema, salaSchema } from "shared";
import { documentoOpenApi } from "../src/documentacao/documentoOpenApi.js";
import { schemas } from "../src/documentacao/componentes.js";

const metodosDocumentaveis: string[] = ["get", "post", "put", "delete"];

function listarOperacoesDocumentadas(): string[] {
  return Object.entries(documentoOpenApi.paths)
    .flatMap(([caminho, item]) =>
      Object.keys(item ?? {})
        .filter((chave: string) => metodosDocumentaveis.includes(chave))
        .map((metodo: string) => `${metodo} ${caminho}`),
    )
    .sort();
}

test("o Swagger documenta exatamente as rotas registradas na API", async () => {
  const { rotasDaApi } = await import("../src/routes/rotasDaApi.js");
  const operacoesRegistradas: string[] = rotasDaApi
    .flatMap((rotas) => rotas.stack)
    .flatMap(({ route }) => {
      assert.ok(route);
      const caminho: string = route.path.replace(/:(\w+)/g, "{$1}");
      return route.stack.map(({ method }) => `${method} ${caminho}`);
    });

  assert.deepEqual(listarOperacoesDocumentadas(), [...new Set(operacoesRegistradas)].sort());
});

test("os campos de entrada do Swagger são os mesmos dos schemas do shared", () => {
  const schemasPorNomeDocumentado = {
    NovoUsuario: criarUsuarioSchema,
    Login: loginSchema,
    DadosDeBloco: blocoSchema,
    DadosDeCliente: clienteSchema,
    DadosDeSala: salaSchema,
    DadosDeReserva: reservaSchema,
  };

  for (const [nomeDocumentado, schemaDoShared] of Object.entries(schemasPorNomeDocumentado)) {
    const documentado: OpenAPIV3.SchemaObject | undefined = schemas[nomeDocumentado];
    assert.deepEqual(Object.keys(documentado?.properties ?? {}).sort(), Object.keys(schemaDoShared.shape).sort(), nomeDocumentado);
  }
});

test("a página do Swagger abre em /docs sem exigir login", async () => {
  const { criarAplicacao } = await import("../src/aplicacao.js");
  const aplicacao: Express = criarAplicacao();
  const servidor: Server = aplicacao.listen(0, "127.0.0.1");
  await once(servidor, "listening");

  try {
    const resposta: globalThis.Response = await fetch(`http://127.0.0.1:${(servidor.address() as AddressInfo).port}/docs/`);
    assert.equal(resposta.status, 200);
    assert.match(await resposta.text(), /swagger-ui/);
  } finally {
    await new Promise<void>((resolve) => servidor.close(() => resolve()));
  }
});
