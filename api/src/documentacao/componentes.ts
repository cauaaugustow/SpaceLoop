import type { OpenAPIV3 } from "openapi-types";
import { TURNOS, hojeNoFusoDaAplicacao } from "shared";

export type PropriedadesDoSchema = Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;

const texto = (exemplo: string): OpenAPIV3.SchemaObject => ({ type: "string", example: exemplo });
const textoOpcional = (exemplo: string): OpenAPIV3.SchemaObject => ({ type: "string", nullable: true, example: exemplo });
const inteiro = (exemplo: number): OpenAPIV3.SchemaObject => ({ type: "integer", minimum: 1, example: exemplo });
const dataEHora: OpenAPIV3.SchemaObject = { type: "string", format: "date-time" };
const turno: OpenAPIV3.SchemaObject = { type: "string", enum: [...TURNOS], example: "MANHA" };

function calcularDiaDeExemplo(): string {
  const dia: Date = new Date(`${hojeNoFusoDaAplicacao()}T00:00:00.000Z`);
  dia.setUTCDate(dia.getUTCDate() + 7);
  return dia.toISOString().slice(0, 10);
}

function criarObjeto(propriedades: PropriedadesDoSchema, camposOpcionais: string[] = []): OpenAPIV3.SchemaObject {
  return {
    type: "object",
    properties: propriedades,
    required: Object.keys(propriedades).filter((campo: string): boolean => !camposOpcionais.includes(campo)),
  };
}

function criarRegistro(propriedades: PropriedadesDoSchema): OpenAPIV3.SchemaObject {
  return criarObjeto({ id: inteiro(1), ...propriedades, criadoEm: dataEHora, atualizadoEm: dataEHora });
}

const apenasNome = (exemplo: string): OpenAPIV3.SchemaObject => criarObjeto({ nome: texto(exemplo) });

const camposDeUsuario: PropriedadesDoSchema = { nome: texto("Maria Silva"), email: texto("maria@example.com") };

const camposDeBloco: PropriedadesDoSchema = { nome: texto("Bloco C"), descricao: textoOpcional("Salas do térreo") };

const camposDeCliente: PropriedadesDoSchema = {
  nome: texto("João Pereira"),
  cpf: texto("123.456.789-09"),
  email: texto("joao@example.com"),
  telefone: textoOpcional("85999990000"),
};

const camposComunsDaSala: PropriedadesDoSchema = {
  nome: texto("Sala Mirante"),
  capacidade: inteiro(10),
  descricao: textoOpcional("Sala com TV"),
  idBloco: inteiro(1),
};

const preco: OpenAPIV3.SchemaObject = { type: "number", minimum: 0, example: 80 };

const referenciasDaReserva: PropriedadesDoSchema = { turno, idSala: inteiro(1), idCliente: inteiro(1) };

export const schemas: Record<string, OpenAPIV3.SchemaObject> = {
  NovoUsuario: criarObjeto({ ...camposDeUsuario, senha: { type: "string", minLength: 8, example: "senha-forte-123" } }),
  Usuario: criarRegistro(camposDeUsuario),
  Login: criarObjeto({
    email: texto("professor@spaceloop.com"),
    senha: { type: "string", minLength: 8, example: "professor123" },
  }),
  LoginRealizado: criarObjeto({
    usuario: criarObjeto({ id: inteiro(1), ...camposDeUsuario, criadoEm: dataEHora }),
    token: texto("cole-este-valor-em-Authorize"),
  }),
  DadosDeBloco: criarObjeto(camposDeBloco, ["descricao"]),
  Bloco: criarRegistro(camposDeBloco),
  DadosDeCliente: criarObjeto(camposDeCliente, ["telefone"]),
  Cliente: criarRegistro(camposDeCliente),
  DadosDeSala: criarObjeto({ ...camposComunsDaSala, precoLocacao: preco }, ["descricao"]),
  Sala: criarRegistro({ ...camposComunsDaSala, preco, bloco: apenasNome("Bloco A") }),
  DadosDeReserva: criarObjeto({
    dia: { type: "string", format: "date", example: calcularDiaDeExemplo() },
    ...referenciasDaReserva,
  }),
  Reserva: criarRegistro({
    dia: dataEHora,
    ...referenciasDaReserva,
    sala: apenasNome("Sala Farol"),
    cliente: apenasNome("Ana Souza"),
  }),
  Erro: criarObjeto(
    {
      mensagem: texto("Dados inválidos"),
      erros: { type: "array", items: criarObjeto({ campo: texto("nome"), mensagem: texto("Informe o nome") }) },
    },
    ["erros"],
  ),
};
