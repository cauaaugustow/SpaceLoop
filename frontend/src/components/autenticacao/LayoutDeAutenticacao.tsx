import type { JSX, ReactNode } from "react";
import { Marca } from "./Marca";
import { PainelDeDestaques } from "./PainelDeDestaques";
import "../../app.css";

type PropriedadesDoLayout = {
  titulo: string;
  pergunta: string;
  rotuloDaAcao: string;
  aoTrocarDePagina: () => void;
  children: ReactNode;
};

export function LayoutDeAutenticacao({ titulo, pergunta, rotuloDaAcao, aoTrocarDePagina, children }: PropriedadesDoLayout): JSX.Element {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <PainelDeDestaques />
        <section className="auth-panel" aria-label={titulo}>
          <header className="auth-header">
            <div className="mobile-brand"><Marca /></div>
            <div className="header-action">
              {pergunta}{" "}
              <button type="button" className="text-link" onClick={aoTrocarDePagina}>{rotuloDaAcao}</button>
            </div>
          </header>
          <div className="auth-content">{children}</div>
          <footer className="auth-bottom">
            © {new Date().getFullYear()} SpaceLoop <span>•</span> Espaços que conectam pessoas.
          </footer>
        </section>
      </div>
    </main>
  );
}
