import { useState, type JSX, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { TelaDeCadastro } from "../hooks/useTelaDeCadastro";
import type { Registro } from "../types/registros";
import { normalizarTextoDeBusca } from "../utilitarios/formatacao";
import { Modal } from "./Modal";

export type Coluna<RegistroDaTela> = {
  titulo: string;
  obterTexto: (registro: RegistroDaTela) => string;
};

type PropriedadesDoPainel<RegistroDaTela extends Registro, Formulario> = {
  titulo: string;
  nomeNoSingular: string;
  tela: TelaDeCadastro<RegistroDaTela, Formulario>;
  colunas: Coluna<RegistroDaTela>[];
  descreverRegistro: (registro: RegistroDaTela) => string;
  mensagemDeErroDasOpcoes?: string;
  children: ReactNode;
};

export function PainelDeCadastro<RegistroDaTela extends Registro, Formulario>({
  titulo,
  nomeNoSingular,
  tela,
  colunas,
  descreverRegistro,
  mensagemDeErroDasOpcoes = "",
  children,
}: PropriedadesDoPainel<RegistroDaTela, Formulario>): JSX.Element {
  const [textoDaBusca, setTextoDaBusca] = useState<string>("");
  const { itens, isCarregando, mensagemDeErro } = tela.lista;

  const registrosEncontrados: RegistroDaTela[] = itens.filter((registro: RegistroDaTela) =>
    normalizarTextoDeBusca(colunas.map((coluna: Coluna<RegistroDaTela>) => coluna.obterTexto(registro)).join(" "))
      .includes(normalizarTextoDeBusca(textoDaBusca)),
  );
  const tituloDoModal: string = `${tela.idEmEdicao === null ? "Adicionar" : "Editar"} ${nomeNoSingular}`;

  return (
    <section aria-label={titulo}>
      <header className="panel-header">
        <h1>{titulo}</h1>
        <button type="button" className="button button-primary" onClick={tela.abrirCriacao}>
          <Plus size={16} /> Adicionar {nomeNoSingular}
        </button>
      </header>

      <label className="search-box">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          aria-label={`Buscar em ${titulo.toLowerCase()}`}
          placeholder="Buscar por texto"
          value={textoDaBusca}
          onChange={(evento) => setTextoDaBusca(evento.target.value)}
        />
      </label>

      {tela.avisoDeSucesso && <p className="notice notice-success" role="status">{tela.avisoDeSucesso}</p>}
      {tela.mensagemDeErroAoRemover && <p className="notice notice-error" role="alert">{tela.mensagemDeErroAoRemover}</p>}
      {mensagemDeErro && <p className="notice notice-error" role="alert">{mensagemDeErro}</p>}

      {isCarregando && <p className="empty-state">Carregando...</p>}
      {!isCarregando && !mensagemDeErro && registrosEncontrados.length === 0 && (
        <p className="empty-state">Nenhum registro encontrado.</p>
      )}
      {registrosEncontrados.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {colunas.map((coluna: Coluna<RegistroDaTela>) => <th key={coluna.titulo}>{coluna.titulo}</th>)}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registrosEncontrados.map((registro: RegistroDaTela) => (
                <tr key={registro.id}>
                  {colunas.map((coluna: Coluna<RegistroDaTela>) => <td key={coluna.titulo}>{coluna.obterTexto(registro)}</td>)}
                  <td className="row-actions">
                    <button type="button" className="icon-button" aria-label={`Editar ${descreverRegistro(registro)}`} onClick={() => tela.abrirEdicao(registro)}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-button icon-button-danger" aria-label={`Remover ${descreverRegistro(registro)}`} onClick={() => tela.removerComConfirmacao(registro, descreverRegistro(registro))}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tela.isModalAberto && (
        <Modal titulo={tituloDoModal} aoFechar={tela.fecharModal}>
          <form className="modal-form" onSubmit={tela.salvar} noValidate>
            {children}
            {mensagemDeErroDasOpcoes && <p className="notice notice-error" role="alert">{mensagemDeErroDasOpcoes}</p>}
            {tela.errosDoFormulario.mensagemGeral && (
              <p className="notice notice-error" role="alert">{tela.errosDoFormulario.mensagemGeral}</p>
            )}
            <footer className="modal-actions">
              <button type="button" className="button" onClick={tela.fecharModal}>Cancelar</button>
              <button type="submit" className="button button-primary" disabled={tela.isSalvando}>
                {tela.isSalvando ? "Salvando..." : "Salvar"}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </section>
  );
}
