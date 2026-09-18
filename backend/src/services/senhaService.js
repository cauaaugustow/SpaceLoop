import bcrypt from "bcryptjs";

export const RODADAS_BCRYPT = 10;

export async function hashearSenha(senha) {
    return await bcrypt.hash(senha, RODADAS_BCRYPT);
}

export async function compararSenha(senha, senhaHash) {
    return await bcrypt.compare(senha, senhaHash);
}