import { z } from "zod";
import { campoEmail, campoSenha, textoObrigatorio } from "./campos.js";

const MAIOR_TAMANHO_DE_SENHA_EM_BYTES: number = 72;

function isSenhaDentroDoLimiteDoBcrypt(senha: string): boolean {
  return new TextEncoder().encode(senha).length <= MAIOR_TAMANHO_DE_SENHA_EM_BYTES;
}

export const criarUsuarioSchema = z.object({
  nome: textoObrigatorio("O nome precisa ter ao menos 3 caracteres", 3),
  email: campoEmail,
  senha: campoSenha.refine(isSenhaDentroDoLimiteDoBcrypt, "A senha é longa demais (máximo de 72 bytes)"),
});

export const loginSchema = z.object({
  email: campoEmail,
  senha: campoSenha,
});

export type DadosDeNovoUsuario = z.infer<typeof criarUsuarioSchema>;
export type DadosDeLogin = z.infer<typeof loginSchema>;
