import type { InputHTMLAttributes, JSX, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type PropriedadesDoCampo = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  id: string;
  mensagemDeErro?: string | undefined;
  Icone?: LucideIcon;
  acao?: ReactNode;
};

export function CampoDeFormulario({ rotulo, id, mensagemDeErro, Icone, acao, ...atributosDoInput }: PropriedadesDoCampo): JSX.Element {
  const idDoErro: string = `${id}-erro`;

  return (
    <div className="field">
      <label htmlFor={id}>{rotulo}</label>
      <div className="field-control">
        {Icone && <Icone size={18} className="field-icon" aria-hidden="true" />}
        <input
          id={id}
          className={Icone ? "with-icon" : ""}
          aria-invalid={Boolean(mensagemDeErro)}
          aria-describedby={mensagemDeErro ? idDoErro : undefined}
          {...atributosDoInput}
        />
        {acao}
      </div>
      {mensagemDeErro && <span id={idDoErro} className="field-error" role="alert">{mensagemDeErro}</span>}
    </div>
  );
}
