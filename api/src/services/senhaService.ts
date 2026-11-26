import bcrypt from "bcryptjs";

export const RODADAS_BCRYPT: number = 10;

export async function gerarHashDaSenha(senha: string): Promise<string> {
  return await bcrypt.hash(senha, RODADAS_BCRYPT);
}

export async function compararSenha(senha: string, senhaHash: string): Promise<boolean> {
  return await bcrypt.compare(senha, senhaHash);
}
