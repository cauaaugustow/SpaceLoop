import { z } from "zod";

export const criarUsuarioSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome precisa ter ao menos 3 caracteres"),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido")
    .transform((email) => email.toLowerCase()),

  senha: z
    .string()
    .min(8, "A senha precisa ter ao menos 8 caracteres"),

  telefone: z
    .string()
    .trim()
    .optional(),

  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
});

export const atualizarUsuarioSchema = criarUsuarioSchema
  .omit({ senha: true })
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
