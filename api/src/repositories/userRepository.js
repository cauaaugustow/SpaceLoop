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
        where: {email},
        select: selectUser
    })
}

export async function buscarUserPorCpf(cpf) {
    return prisma.usuario.findUnique({
        where: {cpf},
        select: selectUser
    })
}

export async function criarUser(dados) {
    return prisma.usuario.create({
        data: dados,
        select: selectUser
    })
}

export async function listarUsers() {
    return prisma.usuario.findMany({ select: selectUser });
}

export async function buscarUserPorId(id) {
    return prisma.usuario.findUnique({
        where: {id},
        select: selectUser
    })
}

export async function atualizarUser(id, dados) {
    return prisma.usuario.update({
        where: {id},
        data: dados,
        select: selectUser
    })
}

export async function deletarUser(id) {
    return prisma.usuario.delete({
        where: {id},
        select: selectUser
    })
}
