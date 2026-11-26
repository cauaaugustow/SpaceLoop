import { z } from "zod";
import { campoEmail, campoSenha, textoObrigatorio } from "./campos.js";

export const criarUsuarioSchema = z.object({
  nome: textoObrigatorio("O nome precisa ter ao menos 3 caracteres", 3),
  email: campoEmail,
  senha: campoSenha,
});

export const loginSchema = z.object({
  email: campoEmail,
  senha: campoSenha,
});

export type DadosDeNovoUsuario = z.infer<typeof criarUsuarioSchema>;
export type DadosDeLogin = z.infer<typeof loginSchema>;
