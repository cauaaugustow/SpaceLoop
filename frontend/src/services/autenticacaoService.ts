import type { AxiosResponse } from "axios";
import type { DadosDeLogin, DadosDeNovoUsuario } from "shared";
import type { RespostaDeLogin, Usuario } from "../types/usuario";
import { api } from "./api";

export async function fazerLogin(credenciais: DadosDeLogin): Promise<RespostaDeLogin> {
  const resposta: AxiosResponse<RespostaDeLogin> = await api.post<RespostaDeLogin>("/login", credenciais);
  return resposta.data;
}

export async function cadastrarUsuario(novoUsuario: DadosDeNovoUsuario): Promise<Usuario> {
  const resposta: AxiosResponse<Usuario> = await api.post<Usuario>("/usuario", novoUsuario);
  return resposta.data;
}
