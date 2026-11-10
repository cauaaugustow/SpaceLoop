import { 
    criarReserva as criarReservaRepository,
    buscarReservaPorId as buscarReservaPorIdRepository,
    listarReservas as listarReservasRepository,
    atualizarReservas as atualizarReservasRepository,
    deletarReservas as deletarReservasRepository,
    buscarReservaPorId
 } from "../repositories/reservaRepository.js";
import { buscarSalaPorId } from "./salaService.js";
import {buscarUserPorId} from "./usuarioService.js"
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { criarReservaSchema } from "../schema/reservaSchema.js";
import { atualizarReservaSchema } from "../schema/reservaSchema.js";


export async function criarReserva(dados) {
    const{ idUsuario, idSala, dia, turno} = criarReservaSchema.parse(dados);

    if(!(await buscarUserPorId(idUsuario))) throw new ErroDeDominio("Usuario não encontrado", 404);
    if(!(await buscarSalaPorId(idSala))) throw new ErroDeDominio("Sala não encontrada", 404);

    try{
        return await criarReservaRepository({ idUsuario, idSala, dia, turno });
    }catch (erro){
        if(erro.code = "P2002"){
            throw new ErroDeDominio("Esta sala já possui uma reserva", 409)
        }
        throw erro;
    }
}

export async function getAllReservas() {
    return listarReservasRepository()
}

export async function BuscarReservasPorId(id) {
    const usuario = buscarReservaPorIdRepository(id)
    if(!usuario) throw new ErroDeDominio("Usuario não encontrado", 404)
}

export async function AtualizarReserva(id, dados) {
    const dadosValidaos = atualizarReservaSchema.parse(dados);
    const reserva = await buscarReservaPorIdRepository(id);

    if(!reserva) throw new ErroDeDominio("Reserva não encontrada", 404);
    if(reserva.idUsuario !== idUsuario) throw new ErroDeDominio("Você não pode alterar essa reserva",403);

    if(dadosValidaos.idSala){
        await buscarSalaPorId(dadosValidaos.idSala);
    }

        try{
        return await atualizarReservasRepository({id, dadosValidaos});
    }catch (erro){
        if(erro.code = "P2002"){
            throw new ErroDeDominio("Esta sala já possui uma reserva", 409)
        }
        throw erro;
    }
}

export async function deletarReserva(id) {
    const reserva = await buscarReservaPorId(id);

    if(!reserva) throw new ErroDeDominio("Reserva não encontrada", 400);

    await deletarReservasRepository(id);

    return{success: true, message: "Reserva deletada com sucesso!"};
}
