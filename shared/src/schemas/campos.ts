import { z } from "zod";

export const MAIOR_ID_DO_BANCO: number = 2_147_483_647;

function converterTextoEmNumero(valorDoCampo: unknown): unknown {
  return typeof valorDoCampo === "string" && valorDoCampo.trim() !== "" ? Number(valorDoCampo) : valorDoCampo;
}

export function textoObrigatorio(mensagem: string, tamanhoMinimo: number) {
  return z.string({ error: mensagem }).trim().min(tamanhoMinimo, mensagem);
}

export function textoOpcional(mensagem: string) {
  return z.string({ error: mensagem }).trim().nullish();
}

export function inteiroPositivo(mensagem: string) {
  return z.preprocess(
    converterTextoEmNumero,
    z.number({ error: mensagem }).int(mensagem).positive(mensagem).max(MAIOR_ID_DO_BANCO, mensagem),
  );
}

export function numeroNaoNegativo(mensagem: string) {
  return z.preprocess(converterTextoEmNumero, z.number({ error: mensagem }).min(0, mensagem));
}

export const campoEmail = z
  .string({ error: "Informe um e-mail válido" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Informe um e-mail válido"));

export const campoSenha = z
  .string({ error: "A senha precisa ter ao menos 8 caracteres" })
  .min(8, "A senha precisa ter ao menos 8 caracteres");
