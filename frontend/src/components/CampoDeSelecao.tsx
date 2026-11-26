import type { JSX, SelectHTMLAttributes } from "react";

export type OpcaoDeSelecao = {
  valor: string;
  rotulo: string;
};

type PropriedadesDaSelecao = SelectHTMLAttributes<HTMLSelectElement> & {
  rotulo: string;
  id: string;
  opcoes: OpcaoDeSelecao[];
  mensagemDeErro?: string | undefined;
};

export function CampoDeSelecao({ rotulo, id, opcoes, mensagemDeErro, ...atributosDoSelect }: PropriedadesDaSelecao): JSX.Element {
  const idDoErro: string = `${id}-erro`;

  return (
    <div className="field">
      <label htmlFor={id}>{rotulo}</label>
      <select
        id={id}
        aria-invalid={Boolean(mensagemDeErro)}
        aria-describedby={mensagemDeErro ? idDoErro : undefined}
        {...atributosDoSelect}
      >
        <option value="">Selecione</option>
        {opcoes.map(({ valor, rotulo: rotuloDaOpcao }: OpcaoDeSelecao) => (
          <option key={valor} value={valor}>{rotuloDaOpcao}</option>
        ))}
      </select>
      {mensagemDeErro && <span id={idDoErro} className="field-error" role="alert">{mensagemDeErro}</span>}
    </div>
  );
}
