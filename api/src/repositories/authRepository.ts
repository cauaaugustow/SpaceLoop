import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../config/prisma.js";

export const selectUserAuth = {
  id: true,
  nome: true,
  email: true,
  eadmin: true,
  senhaHash: true,
  criadoEm: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioParaAutenticar = Prisma.UsuarioGetPayload<{ select: typeof selectUserAuth }>;

export async function buscarUserPorAuth(email: string): Promise<UsuarioParaAutenticar | null> {
  return prisma.usuario.findUnique({
    where: { email },
    select: selectUserAuth,
  });
}
