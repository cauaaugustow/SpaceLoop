import axios, { isAxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { encerrarSessao, lerTokenDaSessao } from "../utilitarios/sessao";

const enderecoDaApi: string = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api: AxiosInstance = axios.create({
  baseURL: enderecoDaApi,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((configuracao: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token: string | null = lerTokenDaSessao();
  if (token) configuracao.headers.Authorization = `Bearer ${token}`;
  return configuracao;
});

function isSessaoRecusada(erro: unknown): boolean {
  return isAxiosError(erro) && erro.response?.status === 401 && erro.config?.url !== "/login";
}

api.interceptors.response.use(
  (resposta: AxiosResponse): AxiosResponse => resposta,
  (erro: unknown): Promise<never> => {
    if (isSessaoRecusada(erro)) {
      encerrarSessao();
      window.location.reload();
    }
    return Promise.reject(erro);
  },
);
