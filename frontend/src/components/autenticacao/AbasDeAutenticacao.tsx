import type { JSX } from "react";
import type { PaginaDeAcesso } from "../../types/paginas";

type PropriedadesDasAbas = {
  paginaAtual: PaginaDeAcesso;
  aoEscolherPagina: (pagina: PaginaDeAcesso) => void;
};

const abas: { pagina: PaginaDeAcesso; rotulo: string }[] = [
  { pagina: "login", rotulo: "Entrar" },
  { pagina: "cadastro", rotulo: "Criar conta" },
];

export function AbasDeAutenticacao({ paginaAtual, aoEscolherPagina }: PropriedadesDasAbas): JSX.Element {
  return (
    <nav className="auth-tabs" aria-label="Acesso à conta">
      {abas.map(({ pagina, rotulo }) => (
        <button
          key={pagina}
          type="button"
          className={paginaAtual === pagina ? "active" : ""}
          aria-current={paginaAtual === pagina ? "page" : undefined}
          onClick={() => aoEscolherPagina(pagina)}
        >
          {rotulo}
        </button>
      ))}
    </nav>
  );
}
