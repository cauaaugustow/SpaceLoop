import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { lerTokenDaSessao } from "../utilitarios/sessao";

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
