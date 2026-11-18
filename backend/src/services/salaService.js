import { 
    criarSala as criarSalaRepository,
    buscarSalaPorId as buscarSalaPorIdRepository,
    listarSalas as listarSalasRepository,
    atualizarSalas as atualizarSalasRepository,
    deletarSalas as deletarSalasRepository
 } from "../repositories/salaRepository.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";
import { criarSalaSchema, updateSalaSchema } from "../schema/salaSchema.js";
import { disponibilidadeSchema } from "../schema/reservaSchema.js";


export async function criarSala(dados) {
    const {nome, capacidade, descricao, precoLocacao} = criarSalaSchema.parse(dados);
    return criarSalaRepository({
        nome,
        capacidade,
        descricao: descricao ?? null,
        preco: precoLocacao,
    });
}


export async function getAllSalas(filters = {}) {
    const {disponivel, dia, turno} = filters;

    if(disponivel !== "true" && disponivel !== true){
        return listarSalasRepository();
    }

    const { dia: inicio, turno: turnoNormalizado } = disponibilidadeSchema.parse({ dia, turno });

    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 1);

    return listarSalasRepository({
        inicio,
        fim,
        turno: turnoNormalizado,
    });
}


export async function buscarSalaPorId(id) {
    const sala = await buscarSalaPorIdRepository(id)

    if(!sala) throw new ErroDeDominio("Sala não encontrada.",404);
    return sala;
}

export async function atualizarSala(id,dados){
    const dadosValidos = updateSalaSchema.parse(dados)
    const dadosAtualizados = {...dadosValidos};
    await buscarSalaPorId(id);
    if (dadosValidos.precoLocacao !== undefined) {
        dadosAtualizados.preco = dadosValidos.precoLocacao;
        delete dadosAtualizados.precoLocacao;
    }

    return atualizarSalasRepository(id, dadosAtualizados);
}

export async function deletarSala(id) {
    const sala = await buscarSalaPorId(id);
    if(!sala) throw new ErroDeDominio("Sala não encontrada.", 400);

    await deletarSalasRepository(id);

    return {success: true, message: "Sala deletada com sucesso!"};
    
}

//FAZER TESTES PARA O SERVICE DE SALA, TESTANDO TODOS OS CASOS DE ERRO POSSÍVEIS, COMO ID INVÁLIDO, DADOS INVÁLIDOS, SALA NÃO ENCONTRADA, ETC.
