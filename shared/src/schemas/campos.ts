import { z } from "zod";

export const MAIOR_ID_DO_BANCO: number = 2_147_483_647;

export type CampoDeTexto = z.ZodString;

export type CampoDeTextoOpcional = z.ZodOptional<z.ZodNullable<z.ZodString>>;

export type CampoNumerico = z.ZodPreprocess<z.ZodNumber, unknown>;

function converterTextoEmNumero(valorDoCampo: unknown): unknown {
  return typeof valorDoCampo === "string" && valorDoCampo.trim() !== "" ? Number(valorDoCampo) : valorDoCampo;
}

export function textoObrigatorio(mensagem: string, tamanhoMinimo: number): CampoDeTexto {
  return z.string({ error: mensagem }).trim().min(tamanhoMinimo, mensagem);
}

export function textoOpcional(mensagem: string): CampoDeTextoOpcional {
  return z.string({ error: mensagem }).trim().nullish();
}

export function inteiroPositivo(mensagem: string): CampoNumerico {
  return z.preprocess(
    converterTextoEmNumero,
    z.number({ error: mensagem }).int(mensagem).positive(mensagem).max(MAIOR_ID_DO_BANCO, mensagem),
  );
}

export function numeroNaoNegativo(mensagem: string): CampoNumerico {
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
