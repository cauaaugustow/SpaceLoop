import type { AxiosResponse } from "axios";
import type { Registro } from "../types/registros";
import { api } from "./api";

export type ServicoDeCrud<RegistroDaTela extends Registro, Dados> = {
  listar: () => Promise<RegistroDaTela[]>;
  criar: (dadosDoRegistro: Dados) => Promise<RegistroDaTela>;
  atualizar: (id: number, dadosDoRegistro: Dados) => Promise<RegistroDaTela>;
  remover: (id: number) => Promise<void>;
};

export function criarServicoDeCrud<RegistroDaTela extends Registro, Dados>(caminho: string): ServicoDeCrud<RegistroDaTela, Dados> {
  return {
    async listar(): Promise<RegistroDaTela[]> {
      const resposta: AxiosResponse<RegistroDaTela[]> = await api.get<RegistroDaTela[]>(caminho);
      return resposta.data;
    },
    async criar(dadosDoRegistro: Dados): Promise<RegistroDaTela> {
      const resposta: AxiosResponse<RegistroDaTela> = await api.post<RegistroDaTela>(caminho, dadosDoRegistro);
      return resposta.data;
    },
    async atualizar(id: number, dadosDoRegistro: Dados): Promise<RegistroDaTela> {
      const resposta: AxiosResponse<RegistroDaTela> = await api.put<RegistroDaTela>(`${caminho}/${id}`, dadosDoRegistro);
      return resposta.data;
    },
    async remover(id: number): Promise<void> {
      await api.delete(`${caminho}/${id}`);
    },
  };
}
