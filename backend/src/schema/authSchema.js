import { z } from "zod"

export const authUsuarioSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido")
    .transform((email) => email.toLowerCase()),

  senha: z
    .string()
    .min(8, "A senha precisa ter ao menos 8 caracteres"),
});