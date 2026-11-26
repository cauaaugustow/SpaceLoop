import { useState, type JSX } from "react";
import { Building2, CalendarDays, DoorOpen, House, LogOut, UsersRound, type LucideIcon } from "lucide-react";
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
  { tela: "inicio", rotulo: "Início", descricao: "", Icone: House },
  ...itensDeCadastro,
];

export function PaginaInicial({ usuario, aoSair }: PropriedadesDaPaginaInicial): JSX.Element {
  const [telaAtual, setTelaAtual] = useState<TelaDoMenu>("inicio");

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-brand"><Marca /></div>
        <nav className="app-menu" aria-label="Menu principal">
          {itensDoMenu.map(({ tela, rotulo, Icone }: ItemDoMenu) => (
            <button
              key={tela}
              type="button"
              className={telaAtual === tela ? "active" : ""}
              aria-current={telaAtual === tela ? "page" : undefined}
              onClick={() => setTelaAtual(tela)}
            >
              <Icone size={17} /> {rotulo}
            </button>
          ))}
        </nav>
        <button type="button" className="app-logout" onClick={aoSair}><LogOut size={17} /> Sair da conta</button>
      </aside>

      <main className="app-content">
        {telaAtual === "inicio" && (
          <section aria-label="Início">
            <header className="panel-header"><h1>Olá, {usuario.nome}!</h1></header>
            <p className="home-intro">Escolha o que deseja gerenciar.</p>
            <div className="home-cards">
              {itensDeCadastro.map(({ tela, rotulo, descricao, Icone }: ItemDoMenu) => (
                <button key={tela} type="button" className="home-card" onClick={() => setTelaAtual(tela)}>
                  <Icone size={22} />
                  <strong>{rotulo}</strong>
                  <span>{descricao}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {telaAtual === "blocos" && <PaginaDeBlocos />}
        {telaAtual === "salas" && <PaginaDeSalas />}
        {telaAtual === "clientes" && <PaginaDeClientes />}
        {telaAtual === "reservas" && <PaginaDeReservas />}
      </main>
    </div>
  );
}
