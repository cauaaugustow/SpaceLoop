import prisma from "../src/config/prisma.js";
import { hashearSenha } from "../src/services/senhaService.js";
import type { Bloco, Cliente, Reserva, Sala } from "../src/generated/prisma/client.js";

type BlocoDeExemplo = { nome: string; descricao: string };

type SalaDeExemplo = { nome: string; capacidade: number; descricao: string; preco: number; nomeDoBloco: string };

type ClienteDeExemplo = { nome: string; cpf: string; email: string; telefone: string };

type ReservaDeExemplo = { nomeDaSala: string; cpfDoCliente: string; turno: string; diasAPartirDeHoje: number };

const emailDoProfessor: string = "professor@spaceloop.com";
const senhaDoProfessor: string = "professor123";

const blocosDeExemplo: BlocoDeExemplo[] = [
  { nome: "Bloco A", descricao: "Salas de reunião" },
  { nome: "Bloco B", descricao: "Salas de treinamento e eventos" },
];

const salasDeExemplo: SalaDeExemplo[] = [
  { nome: "Sala Jangada", capacidade: 6, descricao: "Reuniões pequenas, com TV", preco: 60, nomeDoBloco: "Bloco A" },
  { nome: "Sala Farol", capacidade: 12, descricao: "Reuniões com projetor", preco: 110, nomeDoBloco: "Bloco A" },
  { nome: "Auditório Duna", capacidade: 60, descricao: "Palestras e eventos", preco: 450, nomeDoBloco: "Bloco B" },
];

const clientesDeExemplo: ClienteDeExemplo[] = [
  { nome: "Ana Souza", cpf: "11122233344", email: "ana.souza@example.com", telefone: "85911112222" },
  { nome: "Bruno Lima", cpf: "55566677788", email: "bruno.lima@example.com", telefone: "85933334444" },
  { nome: "Carla Mendes", cpf: "99988877766", email: "carla.mendes@example.com", telefone: "85955556666" },
];

const reservasDeExemplo: ReservaDeExemplo[] = [
  { nomeDaSala: "Sala Jangada", cpfDoCliente: "11122233344", turno: "MANHA", diasAPartirDeHoje: 3 },
  { nomeDaSala: "Sala Farol", cpfDoCliente: "55566677788", turno: "TARDE", diasAPartirDeHoje: 5 },
  { nomeDaSala: "Auditório Duna", cpfDoCliente: "99988877766", turno: "NOITE", diasAPartirDeHoje: 10 },
];

function calcularDiaAPartirDeHoje(quantidadeDeDias: number): Date {
  const dia: Date = new Date();
  dia.setUTCHours(0, 0, 0, 0);
  dia.setUTCDate(dia.getUTCDate() + quantidadeDeDias);
  return dia;
}

function obterIdObrigatorio(idsPorChave: Map<string, number>, chave: string): number {
  const id: number | undefined = idsPorChave.get(chave);
  if (id === undefined) throw new Error(`O seed não encontrou o registro de exemplo "${chave}".`);
  return id;
}

async function salvarUsuarioDoProfessor(): Promise<void> {
  const senhaHash: string = await hashearSenha(senhaDoProfessor);
  await prisma.usuario.upsert({
    where: { email: emailDoProfessor },
    update: { senhaHash },
    create: { nome: "Professor", email: emailDoProfessor, senhaHash },
  });
}

async function salvarBlocos(): Promise<Map<string, number>> {
  const idsPorNomeDoBloco: Map<string, number> = new Map();
  for (const blocoDeExemplo of blocosDeExemplo) {
    const bloco: Bloco = await prisma.bloco.upsert({
      where: { nome: blocoDeExemplo.nome },
      update: {},
      create: blocoDeExemplo,
    });
    idsPorNomeDoBloco.set(bloco.nome, bloco.id);
  }
  return idsPorNomeDoBloco;
}

async function salvarSalas(idsPorNomeDoBloco: Map<string, number>): Promise<Map<string, number>> {
  const idsPorNomeDaSala: Map<string, number> = new Map();
  for (const { nomeDoBloco, ...salaDeExemplo } of salasDeExemplo) {
    const idBloco: number = obterIdObrigatorio(idsPorNomeDoBloco, nomeDoBloco);
    const salaExistente: Sala | null = await prisma.sala.findFirst({ where: { nome: salaDeExemplo.nome, idBloco } });
    const sala: Sala = salaExistente ?? (await prisma.sala.create({ data: { ...salaDeExemplo, idBloco } }));
    idsPorNomeDaSala.set(sala.nome, sala.id);
  }
  return idsPorNomeDaSala;
}

async function salvarClientes(): Promise<Map<string, number>> {
  const idsPorCpf: Map<string, number> = new Map();
  for (const clienteDeExemplo of clientesDeExemplo) {
    const cliente: Cliente = await prisma.cliente.upsert({
      where: { cpf: clienteDeExemplo.cpf },
      update: {},
      create: clienteDeExemplo,
    });
    idsPorCpf.set(cliente.cpf, cliente.id);
  }
  return idsPorCpf;
}

async function salvarReservas(idsPorNomeDaSala: Map<string, number>, idsPorCpf: Map<string, number>): Promise<void> {
  for (const { nomeDaSala, cpfDoCliente, turno, diasAPartirDeHoje } of reservasDeExemplo) {
    const idSala: number = obterIdObrigatorio(idsPorNomeDaSala, nomeDaSala);
    const idCliente: number = obterIdObrigatorio(idsPorCpf, cpfDoCliente);
    const reservaDeExemploExistente: Reserva | null = await prisma.reserva.findFirst({
      where: { idSala, idCliente, turno },
    });
    if (reservaDeExemploExistente) continue;

    const dia: Date = calcularDiaAPartirDeHoje(diasAPartirDeHoje);
    await prisma.reserva.upsert({
      where: { idSala_dia_turno: { idSala, dia, turno } },
      update: {},
      create: { idSala, dia, turno, idCliente },
    });
  }
}

try {
  await salvarUsuarioDoProfessor();
  const idsPorNomeDoBloco: Map<string, number> = await salvarBlocos();
  const idsPorNomeDaSala: Map<string, number> = await salvarSalas(idsPorNomeDoBloco);
  const idsPorCpf: Map<string, number> = await salvarClientes();
  await salvarReservas(idsPorNomeDaSala, idsPorCpf);
  console.log(`Seed concluído. Entre com ${emailDoProfessor} / ${senhaDoProfessor}`);
} finally {
  await prisma.$disconnect();
}
