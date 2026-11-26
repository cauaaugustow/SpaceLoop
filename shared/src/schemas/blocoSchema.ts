import { z } from "zod";
import { textoObrigatorio, textoOpcional } from "./campos.js";

export const blocoSchema = z.object({
  nome: textoObrigatorio("O nome do bloco precisa ter ao menos 2 caracteres", 2),
  descricao: textoOpcional("A descrição precisa ser um texto"),
});

export type DadosDeBloco = z.infer<typeof blocoSchema>;
