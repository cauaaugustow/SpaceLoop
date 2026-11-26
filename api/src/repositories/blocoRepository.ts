import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const camposDoBloco = {
  id: true,
  nome: true,
  descricao: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.BlocoSelect;

export type BlocoSelecionado = Prisma.BlocoGetPayload<{ select: typeof camposDoBloco }>;

export async function listarBlocos(): Promise<BlocoSelecionado[]> {
  return prisma.bloco.findMany({ select: camposDoBloco, orderBy: { nome: "asc" } });
}

export async function buscarBlocoPorId(id: number): Promise<BlocoSelecionado | null> {
  return prisma.bloco.findUnique({ where: { id }, select: camposDoBloco });
}

export async function buscarBlocoPorNome(nome: string): Promise<BlocoSelecionado | null> {
  return prisma.bloco.findUnique({ where: { nome }, select: camposDoBloco });
}

export async function criarBloco(dadosDoBloco: Prisma.BlocoCreateInput): Promise<BlocoSelecionado> {
  return prisma.bloco.create({ data: dadosDoBloco, select: camposDoBloco });
}

export async function atualizarBloco(id: number, dadosDoBloco: Prisma.BlocoUpdateInput): Promise<BlocoSelecionado> {
  return prisma.bloco.update({ where: { id }, data: dadosDoBloco, select: camposDoBloco });
}

export async function removerBloco(id: number): Promise<void> {
  await prisma.bloco.delete({ where: { id } });
}

export async function contarSalasDoBloco(idBloco: number): Promise<number> {
  return prisma.sala.count({ where: { idBloco } });
}
