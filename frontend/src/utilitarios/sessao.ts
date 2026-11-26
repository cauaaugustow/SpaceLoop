import type { RespostaDeLogin, Usuario } from "../types/usuario";

const chaveDoToken: string = "token";
const chaveDoUsuario: string = "usuario";

function isTokenValido(token: string): boolean {
  const conteudoEmBase64: string = (token.split(".")[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
  const conteudo: { exp?: number } = JSON.parse(atob(conteudoEmBase64));
  return Boolean(conteudo.exp) && Number(conteudo.exp) * 1000 > Date.now();
}

export function lerTokenDaSessao(): string | null {
  return localStorage.getItem(chaveDoToken);
}

export function salvarSessao({ token, usuario }: RespostaDeLogin): void {
  localStorage.setItem(chaveDoToken, token);
  localStorage.setItem(chaveDoUsuario, JSON.stringify(usuario));
}

export function encerrarSessao(): void {
  localStorage.removeItem(chaveDoToken);
  localStorage.removeItem(chaveDoUsuario);
}

export function lerUsuarioDaSessao(): Usuario | null {
  try {
    const token: string | null = lerTokenDaSessao();
    const usuarioSalvo: string | null = localStorage.getItem(chaveDoUsuario);
    if (!token || !usuarioSalvo) return null;
    if (!isTokenValido(token)) {
      encerrarSessao();
      return null;
    }
    return JSON.parse(usuarioSalvo) as Usuario;
  } catch {
    encerrarSessao();
    return null;
  }
}
