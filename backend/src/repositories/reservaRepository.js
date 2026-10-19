import prisma from '../config/prisma.js';

export const selectReservas = {
    id: true,
    dia: true,
    turno: true,
    criadoEm: true,
    atualizadoEm: true,
    idUsuario: true,
    idSala: true,
}

export async function criarReserva(dados){
    return prisma.reserva.create({
        data: dados,
        select: selectReservas
    })
}

export async function buscarReservaPorId(id){
    return prisma.reserva.findUnique({
        where: {id},
        select: selectReservas
    })
}

export async function listaReservas() {
    return prisma.reserva.findMany({select: selectReservas})
}

export async function atualizarReserva(id, dados){
    return prisma.reserva.update({
        where: {id},
        data: dados,
        select: selectReservas
    })
}

export async function deletarReserva(id){
    return prisma.reserva.delete({
        where: {id},
        select: selectReservas
    })
}