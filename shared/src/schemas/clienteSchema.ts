import { z } from "zod";
import { campoEmail, textoObrigatorio, textoOpcional } from "./campos.js";

export const clienteSchema = z.object({
  nome: textoObrigatorio("O nome precisa ter ao menos 3 caracteres", 3),
  cpf: z
    .string({ error: "CPF inválido" })
    .trim()
    .regex(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, "CPF inválido")
    .transform((cpf: string): string => cpf.replace(/\D/g, "")),
  email: campoEmail,
  telefone: textoOpcional("O telefone precisa ser um texto"),
});

export type DadosDeCliente = z.infer<typeof clienteSchema>;
