import type { JSX } from "react";
import { salaSchema, type DadosDeSala } from "shared";
import { CampoDeFormulario } from "../components/CampoDeFormulario";
import { CampoDeSelecao, type OpcaoDeSelecao } from "../components/CampoDeSelecao";
import { PainelDeCadastro, type Coluna } from "../components/PainelDeCadastro";
import { useListaDaApi } from "../hooks/useListaDaApi";
import { useTelaDeCadastro } from "../hooks/useTelaDeCadastro";
import { blocoService, salaService } from "../services/recursosService";
import type { Bloco, Sala } from "../types/registros";
import { formatarPreco } from "../utilitarios/formatacao";

type FormularioDeSala = {
  nome: string;
  capacidade: string;
  descricao: string;
  precoLocacao: string;
  idBloco: string;
};

const formularioVazio: FormularioDeSala = { nome: "", capacidade: "", descricao: "", precoLocacao: "", idBloco: "" };

const colunas: Coluna<Sala>[] = [
  { titulo: "Nome", obterTexto: (sala: Sala) => sala.nome },
  { titulo: "Bloco", obterTexto: (sala: Sala) => sala.bloco.nome },
  { titulo: "Capacidade", obterTexto: (sala: Sala) => `${sala.capacidade} pessoas` },
  { titulo: "Preço", obterTexto: (sala: Sala) => formatarPreco(sala.preco) },
  { titulo: "Descrição", obterTexto: (sala: Sala) => sala.descricao || "—" },
];

function montarFormulario({ nome, capacidade, descricao, preco, idBloco }: Sala): FormularioDeSala {
  return {
    nome,
    capacidade: String(capacidade),
    descricao: descricao ?? "",
    precoLocacao: String(preco),
    idBloco: String(idBloco),
  };
}

export function PaginaDeSalas(): JSX.Element {
  const tela = useTelaDeCadastro<Sala, DadosDeSala, FormularioDeSala>({
    servico: salaService,
    schema: salaSchema,
    formularioVazio,
    montarFormulario,
  });
  const blocos = useListaDaApi<Bloco>(blocoService.listar);
  const opcoesDeBloco: OpcaoDeSelecao[] = blocos.itens.map((bloco: Bloco) => ({ valor: String(bloco.id), rotulo: bloco.nome }));
  const { formulario, errosDoFormulario, preencherCampo } = tela;

  return (
    <PainelDeCadastro
      titulo="Salas"
      nomeNoSingular="sala"
      tela={tela}
      colunas={colunas}
      descreverRegistro={(sala: Sala) => `a sala ${sala.nome}`}
      mensagemDeErroDasOpcoes={blocos.mensagemDeErro}
    >
      <CampoDeFormulario
        rotulo="Nome"
        id="nome"
        value={formulario.nome}
        onChange={(evento) => preencherCampo("nome", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.nome}
      />
      <CampoDeSelecao
        rotulo="Bloco"
        id="idBloco"
        opcoes={opcoesDeBloco}
        value={formulario.idBloco}
        onChange={(evento) => preencherCampo("idBloco", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.idBloco}
      />
      <CampoDeFormulario
        rotulo="Capacidade"
        id="capacidade"
        type="number"
        min={1}
        value={formulario.capacidade}
        onChange={(evento) => preencherCampo("capacidade", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.capacidade}
      />
      <CampoDeFormulario
        rotulo="Preço da locação"
        id="precoLocacao"
        type="number"
        min={0}
        step="0.01"
        value={formulario.precoLocacao}
        onChange={(evento) => preencherCampo("precoLocacao", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.precoLocacao}
      />
      <CampoDeFormulario
        rotulo="Descrição (opcional)"
        id="descricao"
        value={formulario.descricao}
        onChange={(evento) => preencherCampo("descricao", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.descricao}
      />
    </PainelDeCadastro>
  );
}
