import type { OpenAPIV3 } from "openapi-types";

export type RecursoDocumentado = {
  caminho: string;
  etiqueta: string;
  nomeNoSingular: string;
  schemaDeEntrada: string;
  schemaDeResposta: string;
  errosAoCriar: Record<string, string>;
  errosAoEditar: Record<string, string>;
  errosAoRemover: Record<string, string>;
};

const apontarParaSchema = (nome: string): OpenAPIV3.ReferenceObject => ({ $ref: `#/components/schemas/${nome}` });

const descreverEmJson = (schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): Record<string, OpenAPIV3.MediaTypeObject> => ({
  "application/json": { schema },
});

export function descreverCorpo(nomeDoSchema: string): OpenAPIV3.RequestBodyObject {
  return { required: true, content: descreverEmJson(apontarParaSchema(nomeDoSchema)) };
}

export function descreverSucesso(descricao: string, nomeDoSchema: string): OpenAPIV3.ResponseObject {
  return { description: descricao, content: descreverEmJson(apontarParaSchema(nomeDoSchema)) };
}

function descreverLista(descricao: string, nomeDoSchema: string): OpenAPIV3.ResponseObject {
  return { description: descricao, content: descreverEmJson({ type: "array", items: apontarParaSchema(nomeDoSchema) }) };
}

export function descreverErros(descricoesPorStatus: Record<string, string>): OpenAPIV3.ResponsesObject {
  return Object.fromEntries(
    Object.entries(descricoesPorStatus).map(([status, descricao]: [string, string]) => [
      status,
      descreverSucesso(descricao, "Erro"),
    ]),
  );
}

const parametroId: OpenAPIV3.ParameterObject = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};

export function descreverCrud(recurso: RecursoDocumentado): OpenAPIV3.PathsObject {
  const { caminho, etiqueta, nomeNoSingular, schemaDeEntrada, schemaDeResposta } = recurso;
  const tags: string[] = [etiqueta];
  const erroDeLogin: Record<string, string> = { "401": "Token ausente, inválido ou expirado" };
  const errosDoItem: Record<string, string> = {
    ...erroDeLogin,
    "400": "ID inválido",
    "404": `Registro de ${nomeNoSingular} não encontrado`,
  };

  return {
    [caminho]: {
      get: {
        tags,
        summary: `Listar ${etiqueta.toLowerCase()}`,
        responses: { "200": descreverLista("Lista de registros", schemaDeResposta), ...descreverErros(erroDeLogin) },
      },
      post: {
        tags,
        summary: `Criar ${nomeNoSingular}`,
        requestBody: descreverCorpo(schemaDeEntrada),
        responses: {
          "201": descreverSucesso("Registro criado", schemaDeResposta),
          ...descreverErros({ ...erroDeLogin, "400": "Dados inválidos", ...recurso.errosAoCriar }),
        },
      },
    },
    [`${caminho}/{id}`]: {
      parameters: [parametroId],
      get: {
        tags,
        summary: `Buscar ${nomeNoSingular} por ID`,
        responses: { "200": descreverSucesso("Registro encontrado", schemaDeResposta), ...descreverErros(errosDoItem) },
      },
      put: {
        tags,
        summary: `Editar ${nomeNoSingular}`,
        requestBody: descreverCorpo(schemaDeEntrada),
        responses: {
          "200": descreverSucesso("Registro atualizado", schemaDeResposta),
          ...descreverErros({ ...errosDoItem, "400": "ID ou dados inválidos", ...recurso.errosAoEditar }),
        },
      },
      delete: {
        tags,
        summary: `Remover ${nomeNoSingular}`,
        responses: {
          "204": { description: "Registro removido, sem corpo na resposta" },
          ...descreverErros({ ...errosDoItem, ...recurso.errosAoRemover }),
        },
      },
    },
  };
}
