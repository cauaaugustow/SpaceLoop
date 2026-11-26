import type { JSX } from "react";
import { CalendarDays, Check, MapPin, Sparkles } from "lucide-react";
import { Marca } from "./Marca";

export function PainelDeDestaques(): JSX.Element {
  return (
    <aside className="feature-panel">
      <Marca />
      <div className="feature-copy">
        <div className="feature-kicker"><span /> SEU ESPAÇO, NO SEU TEMPO</div>
        <h1>Boas ideias precisam do <em>espaço certo.</em></h1>
        <p>Encontre, reserve e aproveite o ambiente ideal para cada momento. Tudo em poucos cliques.</p>
      </div>
      <div className="feature-art" aria-hidden="true">
        <div className="orbit orbit-outer" />
        <div className="orbit orbit-inner" />
        <div className="orbit-core"><Sparkles size={36} strokeWidth={1.4} /></div>
        <div className="float-card room-card">
          <span className="float-icon"><MapPin size={19} /></span>
          <span><strong>Sala Criativa</strong><small>Seu próximo encontro começa aqui</small></span>
        </div>
        <div className="float-card booking-card">
          <span className="float-icon"><CalendarDays size={19} /></span>
          <span><strong>Reserva confirmada</strong><small>Seu espaço está esperando</small></span>
          <span className="confirmed"><Check size={13} /></span>
        </div>
      </div>
      <div className="feature-footer">Mais espaço para o que importa. <span>✳</span></div>
    </aside>
  );
}
