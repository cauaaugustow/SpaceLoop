import prisma from "../src/config/prisma.js";
import { hashearSenha } from "../src/services/senhaService.js";
import type { Bloco, Cliente, Sala } from "../src/generated/prisma/client.js";

type SalaDeExemplo = { nome: string; capacidade: number; descricao: string; preco: number; nomeDoBloco: string };

type ReservaDeExemplo = { indiceDaSala: number; cpfDoCliente: string; turno: string; diasAPartirDeHoje: number };

const emailDoProfessor: string = "professor@spaceloop.com";
const senhaDoProfessor: string = "professor123";

const blocosDeExemplo: { nome: string; descricao: string }[] = [
  { nome: "Bloco A", descricao: "Salas de reunião" },
  { nome: "Bloco B", descricao: "Salas de treinamento e eventos" },
];

const salasDeExemplo: SalaDeExemplo[] = [
  { nome: "Sala Jangada", capacidade: 6, descricao: "Reuniões pequenas, com TV", preco: 60, nomeDoBloco: "Bloco A" },
  { nome: "Sala Farol", capacidade: 12, descricao: "Reuniões com projetor", preco: 110, nomeDoBloco: "Bloco A" },
  { nome: "Auditório Duna", capacidade: 60, descricao: "Palestras e eventos", preco: 450, nomeDoBloco: "Bloco B" },
];

const clientesDeExemplo: { nome: string; cpf: string; email: string; telefone: string }[] = [
  { nome: "Ana Souza", cpf: "11122233344", email: "ana.souza@example.com", telefone: "85911112222" },
  { nome: "Bruno Lima", cpf: "55566677788", email: "bruno.lima@example.com", telefone: "85933334444" },
  { nome: "Carla Mendes", cpf: "99988877766", email: "carla.mendes@example.com", telefone: "85955556666" },
];

const reservasDeExemplo: ReservaDeExemplo[] = [
  { indiceDaSala: 0, cpfDoCliente: "11122233344", turno: "MANHA", diasAPartirDeHoje: 3 },
  { indiceDaSala: 1, cpfDoCliente: "55566677788", turno: "TARDE", diasAPartirDeHoje: 5 },
  { indiceDaSala: 2, cpfDoCliente: "99988877766", turno: "NOITE", diasAPartirDeHoje: 10 },
];

function diaAPartirDeHoje(dias: number): Date {
  const dia: Date = new Date();
  dia.setUTCHours(0, 0, 0, 0);
  dia.setUTCDate(dia.getUTCDate() + dias);
  return dia;
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
  for (const dados of blocosDeExemplo) {
    const bloco: Bloco = await prisma.bloco.upsert({ where: { nome: dados.nome }, update: {}, create: dados });
    idsPorNomeDoBloco.set(bloco.nome, bloco.id);
  }
  return idsPorNomeDoBloco;
}

async function salvarSalas(idsPorNomeDoBloco: Map<string, number>): Promise<number[]> {
  const idsDasSalas: number[] = [];
  for (const { nomeDoBloco, ...dados } of salasDeExemplo) {
    const idBloco: number = idsPorNomeDoBloco.get(nomeDoBloco)!;
    const salaExistente: Sala | null = await prisma.sala.findFirst({ where: { nome: dados.nome, idBloco } });
    const sala: Sala = salaExistente ?? (await prisma.sala.create({ data: { ...dados, idBloco } }));
    idsDasSalas.push(sala.id);
  }
  return idsDasSalas;
}

async function salvarClientes(): Promise<Map<string, number>> {
  const idsPorCpf: Map<string, number> = new Map();
  for (const dados of clientesDeExemplo) {
    const cliente: Cliente = await prisma.cliente.upsert({ where: { cpf: dados.cpf }, update: {}, create: dados });
    idsPorCpf.set(cliente.cpf, cliente.id);
  }
  return idsPorCpf;
}

async function salvarReservas(idsDasSalas: number[], idsPorCpf: Map<string, number>): Promise<void> {
  for (const { indiceDaSala, cpfDoCliente, turno, diasAPartirDeHoje } of reservasDeExemplo) {
    const idSala: number = idsDasSalas[indiceDaSala]!;
    const dia: Date = diaAPartirDeHoje(diasAPartirDeHoje);
    await prisma.reserva.upsert({
      where: { idSala_dia_turno: { idSala, dia, turno } },
      update: {},
      create: { idSala, dia, turno, idCliente: idsPorCpf.get(cpfDoCliente)! },
    });
  }
}

try {
  await salvarUsuarioDoProfessor();
  const idsPorNomeDoBloco: Map<string, number> = await salvarBlocos();
  const idsDasSalas: number[] = await salvarSalas(idsPorNomeDoBloco);
  const idsPorCpf: Map<string, number> = await salvarClientes();
  await salvarReservas(idsDasSalas, idsPorCpf);
  console.log(`Seed concluído. Entre com ${emailDoProfessor} / ${senhaDoProfessor}`);
} finally {
  await prisma.$disconnect();
}
