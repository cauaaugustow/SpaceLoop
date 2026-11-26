import type { OpenAPIV3 } from "openapi-types";
import { schemas } from "./componentes.js";
import { descreverCorpo, descreverCrud, descreverErros, descreverSucesso, type RecursoDocumentado } from "./operacoes.js";

const recursos: RecursoDocumentado[] = [
  {
    caminho: "/blocos",
    etiqueta: "Blocos",
    nomeNoSingular: "bloco",
    schemaDeEntrada: "DadosDeBloco",
    schemaDeResposta: "Bloco",
    errosAoCriar: { "409": "Já existe um bloco com este nome" },
    errosAoEditar: { "409": "Já existe um bloco com este nome" },
    errosAoRemover: { "409": "O bloco possui salas e não pode ser removido" },
  },
  {
    caminho: "/clientes",
    etiqueta: "Clientes",
    nomeNoSingular: "cliente",
    schemaDeEntrada: "DadosDeCliente",
    schemaDeResposta: "Cliente",
    errosAoCriar: { "409": "CPF ou e-mail já cadastrado" },
    errosAoEditar: { "409": "CPF ou e-mail já cadastrado" },
    errosAoRemover: { "409": "O cliente possui reservas e não pode ser removido" },
  },
  {
    caminho: "/salas",
    etiqueta: "Salas",
    nomeNoSingular: "sala",
    schemaDeEntrada: "DadosDeSala",
    schemaDeResposta: "Sala",
    errosAoCriar: { "404": "Bloco informado não encontrado" },
    errosAoEditar: { "404": "Sala ou bloco informado não encontrado" },
    errosAoRemover: { "409": "A sala possui reservas e não pode ser removida" },
  },
  {
    caminho: "/reservas",
    etiqueta: "Reservas",
    nomeNoSingular: "reserva",
    schemaDeEntrada: "DadosDeReserva",
    schemaDeResposta: "Reserva",
    errosAoCriar: {
      "404": "Sala ou cliente informado não encontrado",
      "409": "A sala já possui uma reserva neste dia e turno",
    },
    errosAoEditar: {
      "404": "Reserva, sala ou cliente não encontrado",
      "409": "A sala já possui uma reserva neste dia e turno",
    },
    errosAoRemover: {},
  },
];

const caminhosDeAcesso: OpenAPIV3.PathsObject = {
  "/usuario": {
    post: {
      tags: ["Acesso"],
      summary: "Cadastrar usuário",
      security: [],
      requestBody: descreverCorpo("NovoUsuario"),
      responses: {
        "201": descreverSucesso("Usuário criado, sem a senha na resposta", "Usuario"),
        ...descreverErros({ "400": "Dados inválidos", "409": "E-mail já cadastrado" }),
      },
    },
  },
  "/login": {
    post: {
      tags: ["Acesso"],
      summary: "Entrar e receber o token",
      security: [],
      requestBody: descreverCorpo("Login"),
      responses: {
        "200": descreverSucesso("Login realizado", "LoginRealizado"),
        ...descreverErros({ "400": "Dados inválidos", "401": "E-mail ou senha incorretos" }),
      },
    },
  },
};

export const documentoOpenApi: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "SpaceLoop API",
    version: "1.0.0",
    description:
      "API de reservas de salas. Para testar as rotas protegidas, faça o POST /login, copie o token e cole em Authorize.",
  },
  components: {
    schemas,
    securitySchemes: { tokenJwt: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  },
  security: [{ tokenJwt: [] }],
  paths: Object.assign({}, caminhosDeAcesso, ...recursos.map(descreverCrud)),
};
