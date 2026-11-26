import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const camposParaAutenticar = {
  id: true,
  nome: true,
  email: true,
  senhaHash: true,
  criadoEm: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioParaAutenticar = Prisma.UsuarioGetPayload<{ select: typeof camposParaAutenticar }>;

export async function buscarUsuarioParaAutenticar(email: string): Promise<UsuarioParaAutenticar | null> {
  return prisma.usuario.findUnique({
    where: { email },
    select: camposParaAutenticar,
  });
}
