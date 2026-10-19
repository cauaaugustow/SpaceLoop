import { 
    criarSala as criarSalaRepository,
    buscarSalaPorId as buscarSalaPorIdRepository,
    listarSalas as listarSalasRepository,
    atualizarSalas as atualizarSalasRepository,
    deletarSalas as deletarSalasRepository
 } from "../repositories/salaRepository";
import { ErroDeDominio } from "../error/erroDeDominio";
import { criarSalaSchema, updateSalaSchema } from "../schema/salaSchema";


export async function criarSala(dados) {
    const dadosValidos = criarSalaSchema.parse(dados);
    const { nome, capacidade, descricao, precoLocacao } = dadosValidos;
    return criarSalaRepository({
        dados:{
            nome,
            capacidade,
            descricao: descricao || null,
            precoLocacao,
        }
    });
}


export async function getAllSalas(filters = {}) {
    const {disponivel, dia, turno} = filters;

    if(disponivel !== "true" && disponivel !== true){
        return listarSalasRepository();
    }

    if(!dia || !turno) throw new ErroDeDominio("Para filtrar por disponibilidade, informe dia (AAAA-MM-DD) e turno.", 400);

    const inicio = new Date(`${dia}T00:00:00.000Z`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dia) || isNaN(dataReserva.getTime()) || inicio.toISOString().slice(0, 10) !== dia) {
        throw new ErroDeDominio("A data informada no parâmetro'dia' é invalido", 400);
    }

    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 1);

    return listarSalasRepository({
        inicio,
        fim,
        turno: String(turno).trim().toUpperCase(),
    });
}


export async function buscarSalaPorId(id) {
    const sala = await buscarSalaPorIdRepository(id)

    if(!sala) throw new ErroDeDominio("Sala não encontrada.",404);
    return sala;
}

export async function atualizarSala(id,dados){
    const dadosValidos = updateSalaSchema.parse(dados)
    const sala = await buscarSalaPorId(id);
    const dadosAtualizados = {...dadosValidos};

    if(!sala) throw new ErroDeDominio("Sala não encontrada.",400);

    return atualizarSalasRepository(id, dadosAtualizados);
}

export async function deletarSala(id) {
    const sala = await buscarSalaPorId(id);
    if(!sala) throw new ErroDeDominio("Sala não encontrada.", 400);

    await deletarSalasRepository(id);

    return {success: true, message: "Sala deletada com sucesso!"};
    
}
