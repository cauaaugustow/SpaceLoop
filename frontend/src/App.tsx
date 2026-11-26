import { useState, type JSX } from "react";
import { PaginaDeCadastro } from "./pages/PaginaDeCadastro";
import { PaginaDeLogin } from "./pages/PaginaDeLogin";
import { PaginaInicial } from "./pages/PaginaInicial";
import type { PaginaDeAcesso } from "./types/paginas";
import type { RespostaDeLogin, Usuario } from "./types/usuario";
import { encerrarSessao, lerUsuarioDaSessao, salvarSessao } from "./utilitarios/sessao";

export function App(): JSX.Element {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioDaSessao);
  const [paginaDeAcesso, setPaginaDeAcesso] = useState<PaginaDeAcesso>("login");
  const [emailCadastrado, setEmailCadastrado] = useState<string>("");
  const [avisoDeSucesso, setAvisoDeSucesso] = useState<string>("");

  function abrirPaginaDeAcesso(pagina: PaginaDeAcesso): void {
    setAvisoDeSucesso("");
    setPaginaDeAcesso(pagina);
  }

  function concluirCadastro(email: string): void {
    setEmailCadastrado(email);
    setAvisoDeSucesso("Conta criada com sucesso! Agora é só entrar.");
    setPaginaDeAcesso("login");
  }

  function iniciarSessao(login: RespostaDeLogin): void {
    salvarSessao(login);
    setUsuario(login.usuario);
  }

  function sair(): void {
    encerrarSessao();
    setUsuario(null);
    setEmailCadastrado("");
    abrirPaginaDeAcesso("login");
  }

  if (usuario) return <PaginaInicial usuario={usuario} aoSair={sair} />;

  if (paginaDeAcesso === "cadastro") {
    return <PaginaDeCadastro aoEscolherPagina={abrirPaginaDeAcesso} aoCadastrar={concluirCadastro} />;
  }

  return (
    <PaginaDeLogin
      emailInicial={emailCadastrado}
      avisoDeSucesso={avisoDeSucesso}
      aoEscolherPagina={abrirPaginaDeAcesso}
      aoEntrar={iniciarSessao}
    />
  );
}
