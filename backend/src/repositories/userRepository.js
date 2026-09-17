import prisma from "../config/prisma.js";

export const selectUser = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  cpf: true,
  criadoEm: true,
  atualizadoEm: true,
  eadmin: true,
};

export async function buscarUserPorEmail(email) {
    return prisma.usuario.findUnique({
        where: {email}
    })
}

export async function buscarUserPorCpf(email) {
    return prisma.usuario.findUnique({
        where: {cpf}
    })
}

export async function criarUser(email) {
    return prisma.usuario.create({
        data: dados,
        select: selectUser
    })
}