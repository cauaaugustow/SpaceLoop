import { z } from "zod";

function converterTextoEmNumero(valor: unknown): unknown {
  return typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor;
}

export function textoObrigatorio(mensagem: string, tamanhoMinimo: number) {
  return z.string({ error: mensagem }).trim().min(tamanhoMinimo, mensagem);
}

export function textoOpcional(mensagem: string) {
  return z.string({ error: mensagem }).trim().nullish();
}

export function inteiroPositivo(mensagem: string) {
  return z.preprocess(converterTextoEmNumero, z.number({ error: mensagem }).int(mensagem).positive(mensagem));
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

export function hasAlgumCampo(dados: object): boolean {
  return Object.keys(dados).length > 0;
}

export const mensagemDeAtualizacaoVazia: string = "Informe ao menos um campo para atualizar";
