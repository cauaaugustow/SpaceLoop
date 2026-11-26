import { z } from "zod";
import {
  hasAlgumCampo,
  inteiroPositivo,
  mensagemDeAtualizacaoVazia,
  numeroNaoNegativo,
  textoObrigatorio,
  textoOpcional,
} from "./campos.js";

export const criarSalaSchema = z.object({
  nome: textoObrigatorio("O nome da sala deve ter pelo menos 2 caracteres", 2),
  capacidade: inteiroPositivo("A capacidade da sala deve ser um número inteiro maior que zero"),
  descricao: textoOpcional("A descrição precisa ser um texto"),
  precoLocacao: numeroNaoNegativo("O preço de locação deve ser um número maior ou igual a zero"),
  idBloco: inteiroPositivo("Selecione o bloco"),
});

export const atualizarSalaSchema = criarSalaSchema.partial().refine(hasAlgumCampo, mensagemDeAtualizacaoVazia);

export type DadosDeNovaSala = z.infer<typeof criarSalaSchema>;
export type DadosDeAtualizacaoDeSala = z.infer<typeof atualizarSalaSchema>;
