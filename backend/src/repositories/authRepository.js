import prisma from "../config/prisma.js";

export const selectUserAuth = {
  id: true,
  nome: true,
  email: true,
  senhaHash: true,
  criadoEm: true
};

export async function buscarUserPorAuth(email) {
    return prisma.usuario.findUnique({
        where: {email},
        select: selectUserAuth
    })
}