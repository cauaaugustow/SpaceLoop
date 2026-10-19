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
    return prisma.sala.create({
        data: dados,
        select: selectSalas
    })
}

export async function buscarSalaPorId(id) {
    return prisma.sala.findUnique({
        where: {id},
        select: selectSalas
    })
}

export async function listarSalas({inicio,fim,turno} = {}) {
    const where = inicio
    ?{
        reservas: {
            none:{
                dia: {gte: inicio, lt: fim},
                turno,
            },
        },
    }
    : {};

    return prisma.sala.findMany({where, select: selectSalas})
}

export async function atualizarSalas(id, dados) {
    return prisma.sala.update({
        where: {id},
        data: dados,
        select: selectSalas
    })
}

export async function deletarSalas(id) {
    return prisma.sala.delete({
        where: {id},
        select: selectSalas
    })
}