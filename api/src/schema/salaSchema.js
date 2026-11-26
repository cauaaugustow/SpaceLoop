import { z } from "zod"

export const criarSalaSchema = z.object({
    nome: z
    .string({requeried_error: "Campos 'nome', 'capacidade' e 'precoLocacao' são obrigatorios"})
    .min(2, "O nome da sala deve ter pelo menos 2 caracteres"),

   capacidade: z.coerce
    .number({
      required_error: "Campos 'nome', 'capacidade' e 'precoLocacao' são obrigatórios.",
      invalid_type_error: "A capacidade da sala deve ser um número inteiro maior que zero.",
    })
    .int("A capacidade da sala deve ser um número inteiro maior que zero.")
    .positive("A capacidade da sala deve ser um número inteiro maior que zero."),

  descricao: z.string().optional().nullable(),

  precoLocacao: z.coerce
    .number({
      required_error: "Campos 'nome', 'capacidade' e 'precoLocacao' são obrigatórios.",
      invalid_type_error: "O preço de locação deve ser um valor numérico válido maior ou igual a zero.",
    })
    .min(0, "O preço de locação deve ser um valor numérico válido maior ou igual a zero."),
})

export const updateSalaSchema = criarSalaSchema.partial();