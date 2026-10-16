import prisma from '../config/prisma.js';

export const selectSalas = {
    id: true,
    nome: true,
    capacidade: true,
    preco: true,
    criadoEm: true,
    atualizadoEm: true
}

export async function criarSala(dados){
    return prisma.usuario.create({
        data: dados,
        select: selectSalas
    })
}

export async function buscarSalaPorId(id) {
    return prisma.usuario.findUnique({
        where: {id},
        select: selectSalas
    })
}

export async function atualizarSalas(id, dados) {
    return prisma.usuario.update({
        where: {id},
        data: dados,
        select: selectSalas
    })
}

export async function deletarSalas(id) {
    return prisma.usuario.delete({
        where: {id},
        select: selectSalas
    })
}