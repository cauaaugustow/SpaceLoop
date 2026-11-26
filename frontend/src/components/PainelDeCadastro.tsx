import { useState, type JSX, type ReactNode, type ChangeEvent } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { ListaDaApi } from "../hooks/useListaDaApi";
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

const textoDeCampoVazio: string = "—";

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
  const { itens, isCarregando, mensagemDeErro }: ListaDaApi<RegistroDaTela> = tela.lista;

  const registrosEncontrados: RegistroDaTela[] = itens.filter((registro: RegistroDaTela) =>
    normalizarTextoDeBusca(colunas.map((coluna: Coluna<RegistroDaTela>) => coluna.obterTexto(registro)).join(" "))
      .includes(normalizarTextoDeBusca(textoDaBusca)),
  );
  const tituloDoModal: string = `${tela.idEmEdicao === null ? "Adicionar" : "Editar"} ${nomeNoSingular}`;
  const [colunaDoTitulo, ...colunasDosDetalhes]: Coluna<RegistroDaTela>[] = colunas;

  function montarDetalhes(registro: RegistroDaTela): string {
    return colunasDosDetalhes
      .map((coluna: Coluna<RegistroDaTela>) => coluna.obterTexto(registro))
      .filter((texto: string) => texto !== textoDeCampoVazio)
      .join(" · ");
  }

  return (
    <section className="account-detail-section" aria-label={titulo}>
      <div className="account-section-title">
        <div>
          <span className="account-eyebrow">GERENCIAMENTO</span>
          <h1>{titulo}</h1>
          <p>{itens.length} registro(s)</p>
        </div>
        <button type="button" className="account-primary-button" onClick={tela.abrirCriacao}>
          <Plus size={16} /> Adicionar {nomeNoSingular}
        </button>
      </div>

      <label className="account-input-wrap account-search-box">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label={`Buscar em ${titulo.toLowerCase()}`}
          placeholder="Buscar por texto"
          value={textoDaBusca}
          onChange={(evento: ChangeEvent<HTMLInputElement>) => setTextoDaBusca(evento.target.value)}
        />
      </label>

      {tela.avisoDeSucesso && (
        <p className="account-message success" role="status"><Check size={17} />{tela.avisoDeSucesso}</p>
      )}
      {tela.mensagemDeErroAoRemover && <p className="account-message error" role="alert">{tela.mensagemDeErroAoRemover}</p>}
      {mensagemDeErro && <p className="account-message error" role="alert">{mensagemDeErro}</p>}

      {isCarregando && <div className="account-empty">Carregando...</div>}
      {!isCarregando && !mensagemDeErro && registrosEncontrados.length === 0 && (
        <div className="account-empty">Nenhum registro encontrado.</div>
      )}
      {registrosEncontrados.length > 0 && (
        <div className="admin-list">
          {registrosEncontrados.map((registro: RegistroDaTela) => (
            <article className="admin-list-item" key={registro.id}>
              <div>
                <strong>{colunaDoTitulo?.obterTexto(registro)}</strong>
                <p>{montarDetalhes(registro)}</p>
              </div>
              <div className="admin-actions">
                <button type="button" aria-label={`Editar ${descreverRegistro(registro)}`} onClick={() => tela.abrirEdicao(registro)}>
                  Editar
                </button>
                <button type="button" aria-label={`Excluir ${descreverRegistro(registro)}`} onClick={() => tela.removerComConfirmacao(registro, descreverRegistro(registro))}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tela.isModalAberto && (
        <Modal titulo={tituloDoModal} aoFechar={tela.fecharModal}>
          <form className="modal-form" onSubmit={tela.salvar} noValidate>
            {children}
            {mensagemDeErroDasOpcoes && <p className="account-message error" role="alert">{mensagemDeErroDasOpcoes}</p>}
            {tela.errosDoFormulario.mensagemGeral && (
              <p className="account-message error" role="alert">{tela.errosDoFormulario.mensagemGeral}</p>
            )}
            <footer className="modal-actions">
              <button type="button" className="account-secondary-button" onClick={tela.fecharModal}>Cancelar</button>
              <button type="submit" className="account-primary-button" disabled={tela.isSalvando}>
                {tela.isSalvando ? "Salvando..." : "Salvar"}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </section>
  );
}
