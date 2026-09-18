import prisma from "../config/prisma.js";
import { buscarUserPorCpf } from "../repositories/userRepository";
import { buscarUserPorEmail } from "../repositories/userRepository";
import { criarUser as criarUserRepository } from "../repositories/userRepository";
import { hashearSenha } from "./senhaService";

const normalizarEmail = (email) =>{
    return email.trim().toLowerCase();
}

const conflitoEmail = (erro)=>{
    return erro.code === "P2002" && erro.meta.target.includes("email");
}

export async function criarUser(dados) {
    const cpf = dados.cpf.replace(/\D/g, "")

    const userComCpf = await buscarUserPorCpf(cpf)

    if(userComCpf){
        const erro = new Error('Cpf já cadastrado')
        erro.statusCode = 409
        throw erro
    }

    const userComEmail = await buscarUserPorEmail(dados.email)

    if(userComEmail){
        const erro = new Error("Email já cadastrado")
        erro.statusCode = 409
        throw erro
    }

    return criarUserRepository({
        ...dados,
        cpf,
        senhaHash: await hashearSenha(dados.senha)
    })
}
