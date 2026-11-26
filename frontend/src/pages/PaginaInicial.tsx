import { useState, type JSX } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  DoorOpen,
  LogOut,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Marca } from "../components/autenticacao/Marca";
import type { Usuario } from "../types/usuario";
import { PaginaDeBlocos } from "./PaginaDeBlocos";
import { PaginaDeClientes } from "./PaginaDeClientes";
import { PaginaDeReservas } from "./PaginaDeReservas";
import { PaginaDeSalas } from "./PaginaDeSalas";
import "../painel.css";

type TelaDoMenu = "inicio" | "blocos" | "salas" | "clientes" | "reservas";

type ItemDoMenu = {
  tela: TelaDoMenu;
  rotulo: string;
  descricao: string;
  Icone: LucideIcon;
};

type PropriedadesDaPaginaInicial = {
  usuario: Usuario;
  aoSair: () => void;
};

const itensDeCadastro: ItemDoMenu[] = [
  { tela: "blocos", rotulo: "Blocos", descricao: "Os prédios e setores onde ficam as salas.", Icone: Building2 },
  { tela: "salas", rotulo: "Salas", descricao: "Capacidade, preço e bloco de cada sala.", Icone: DoorOpen },
  { tela: "clientes", rotulo: "Clientes", descricao: "Quem faz as reservas.", Icone: UsersRound },
  { tela: "reservas", rotulo: "Reservas", descricao: "A sala, o cliente, o dia e o turno.", Icone: CalendarDays },
];

const itensDoMenu: ItemDoMenu[] = [
  { tela: "inicio", rotulo: "Início", descricao: "", Icone: Compass },
  ...itensDeCadastro,
];

export function PaginaInicial({ usuario, aoSair }: PropriedadesDaPaginaInicial): JSX.Element {
  const [telaAtual, setTelaAtual] = useState<TelaDoMenu>("inicio");
  const primeiroNome: string = usuario.nome.trim().split(" ")[0] || usuario.nome;
  const rotuloDaTelaAtual: string = itensDoMenu.find((item: ItemDoMenu) => item.tela === telaAtual)?.rotulo ?? "";

  return (
    <div className="account-page">
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-sidebar-brand"><Marca /><span>SEU ESPAÇO, SEU MOMENTO</span></div>
          <div className="account-menu-caption">MENU PRINCIPAL</div>
          <nav className="account-nav" aria-label="Menu principal">
            {itensDoMenu.map(({ tela, rotulo, Icone }: ItemDoMenu) => (
              <button
                key={tela}
                type="button"
                className={telaAtual === tela ? "active" : ""}
                aria-current={telaAtual === tela ? "page" : undefined}
                onClick={() => setTelaAtual(tela)}
              >
                <Icone size={19} strokeWidth={1.9} /><span>{rotulo}</span>
              </button>
            ))}
          </nav>
          <div className="account-sidebar-bottom">
            <div className="account-help">
              <Sparkles size={20} />
              <strong>Organize as próximas reservas</strong>
              <p>Escolha a sala, o cliente, o dia e o turno.</p>
              <button type="button" onClick={() => setTelaAtual("reservas")}>Ver reservas <ArrowRight size={15} /></button>
            </div>
            <button type="button" className="account-logout" onClick={aoSair}><LogOut size={18} /> Sair da conta</button>
          </div>
        </aside>

        <main className="account-main">
          <header className="account-topbar">
            <div className="account-topbar-brand"><Marca /></div>
            <span>ÁREA DE GESTÃO <ChevronRight size={13} /> {rotuloDaTelaAtual.toUpperCase()}</span>
            <div className="account-topbar-actions">
              <button type="button" className="account-mobile-logout" aria-label="Sair da conta" title="Sair da conta" onClick={aoSair}>
                <LogOut size={18} />
              </button>
              <span className="account-avatar" title={usuario.nome}>{primeiroNome.charAt(0).toUpperCase()}</span>
            </div>
          </header>

          <div className="account-content">
            {telaAtual === "inicio" && (
              <section aria-label="Início">
                <div className="account-hero">
                  <div className="account-hero-copy">
                    <span className="account-eyebrow">BEM-VINDO DE VOLTA</span>
                    <h1>Olá, {primeiroNome}! <span>Seu próximo espaço começa aqui.</span></h1>
                    <p>Gerencie os blocos, as salas, os clientes e as reservas.</p>
                    <button type="button" onClick={() => setTelaAtual("reservas")}>Ver reservas <ArrowRight size={18} /></button>
                  </div>
                  <div className="account-hero-art" aria-hidden="true">
                    <div className="account-hero-ring ring-one" />
                    <div className="account-hero-ring ring-two" />
                    <div className="account-hero-icon"><DoorOpen size={51} strokeWidth={1.3} /></div>
                    <span className="account-hero-star star-one">✦</span>
                    <span className="account-hero-star star-two">✦</span>
                  </div>
                </div>
                <div className="account-stats account-home-cards">
                  {itensDeCadastro.map(({ tela, rotulo, descricao, Icone }: ItemDoMenu, posicao: number) => (
                    <button key={tela} type="button" onClick={() => setTelaAtual(tela)}>
                      <span className={`account-stat-icon ${posicao % 2 === 0 ? "purple" : "mint"}`}><Icone size={19} /></span>
                      <strong>{rotulo}</strong>
                      <small>{descricao}</small>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {telaAtual === "blocos" && <PaginaDeBlocos />}
            {telaAtual === "salas" && <PaginaDeSalas />}
            {telaAtual === "clientes" && <PaginaDeClientes />}
            {telaAtual === "reservas" && <PaginaDeReservas />}
          </div>
        </main>
      </div>
    </div>
  );
}
