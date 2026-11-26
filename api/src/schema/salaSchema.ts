import { z } from "zod"

export const criarSalaSchema = z.object({
    nome: z
    .string()
    .min(2, "O nome da sala deve ter pelo menos 2 caracteres"),

   capacidade: z.coerce
    .number()
    .int("A capacidade da sala deve ser um número inteiro maior que zero.")
    .positive("A capacidade da sala deve ser um número inteiro maior que zero."),

  descricao: z.string().optional().nullable(),

  precoLocacao: z.coerce
    .number()
    .min(0, "O preço de locação deve ser um valor numérico válido maior ou igual a zero."),
})

export const updateSalaSchema = criarSalaSchema.partial();


export type DadosDeNovaSala = z.infer<typeof criarSalaSchema>;
export type DadosDeAtualizacaoDeSala = z.infer<typeof updateSalaSchema>;
