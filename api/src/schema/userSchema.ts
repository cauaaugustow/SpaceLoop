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
    .transform((email: string): string => email.toLowerCase()),

  senha: z
    .string()
    .min(8, "A senha precisa ter ao menos 8 caracteres"),
});

export type DadosDeNovoUsuario = z.infer<typeof criarUsuarioSchema>;
