import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectBloco = {
  id: true,
  nome: true,
  descricao: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.BlocoSelect;

export type BlocoSelecionado = Prisma.BlocoGetPayload<{ select: typeof selectBloco }>;

export async function listarBlocos(): Promise<BlocoSelecionado[]> {
  return prisma.bloco.findMany({ select: selectBloco, orderBy: { nome: "asc" } });
}

export async function buscarBlocoPorId(id: number): Promise<BlocoSelecionado | null> {
  return prisma.bloco.findUnique({ where: { id }, select: selectBloco });
}

export async function buscarBlocoPorNome(nome: string): Promise<BlocoSelecionado | null> {
  return prisma.bloco.findUnique({ where: { nome }, select: selectBloco });
}

export async function criarBloco(dados: Prisma.BlocoCreateInput): Promise<BlocoSelecionado> {
  return prisma.bloco.create({ data: dados, select: selectBloco });
}

export async function atualizarBloco(id: number, dados: Prisma.BlocoUpdateInput): Promise<BlocoSelecionado> {
  return prisma.bloco.update({ where: { id }, data: dados, select: selectBloco });
}

export async function removerBloco(id: number): Promise<void> {
  await prisma.bloco.delete({ where: { id } });
}

export async function contarSalasDoBloco(idBloco: number): Promise<number> {
  return prisma.sala.count({ where: { idBloco } });
}
