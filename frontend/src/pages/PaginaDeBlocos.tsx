import type { JSX, ChangeEvent } from "react";
import { blocoSchema, type DadosDeBloco } from "shared";
import { CampoDeFormulario } from "../components/CampoDeFormulario";
import { PainelDeCadastro, type Coluna } from "../components/PainelDeCadastro";
import { useTelaDeCadastro, type TelaDeCadastro } from "../hooks/useTelaDeCadastro";
import { blocoService } from "../services/recursosService";
import type { Bloco } from "../types/registros";

type FormularioDeBloco = { nome: string; descricao: string };

const formularioVazio: FormularioDeBloco = { nome: "", descricao: "" };

const colunas: Coluna<Bloco>[] = [
  { titulo: "Nome", obterTexto: (bloco: Bloco) => bloco.nome },
  { titulo: "Descrição", obterTexto: (bloco: Bloco) => bloco.descricao || "—" },
];

function montarFormulario({ nome, descricao }: Bloco): FormularioDeBloco {
  return { nome, descricao: descricao ?? "" };
}

export function PaginaDeBlocos(): JSX.Element {
  const tela: TelaDeCadastro<Bloco, FormularioDeBloco> = useTelaDeCadastro<Bloco, DadosDeBloco, FormularioDeBloco>({
    servico: blocoService,
    schema: blocoSchema,
    formularioVazio,
    montarFormulario,
  });
  const { formulario, errosDoFormulario, preencherCampo }: TelaDeCadastro<Bloco, FormularioDeBloco> = tela;

  return (
    <PainelDeCadastro
      titulo="Blocos"
      nomeNoSingular="bloco"
      tela={tela}
      colunas={colunas}
      descreverRegistro={(bloco: Bloco) => `o bloco ${bloco.nome}`}
    >
      <CampoDeFormulario
        rotulo="Nome"
        id="nome"
        value={formulario.nome}
        onChange={(evento: ChangeEvent<HTMLInputElement>) => preencherCampo("nome", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.nome}
      />
      <CampoDeFormulario
        rotulo="Descrição (opcional)"
        id="descricao"
        value={formulario.descricao}
        onChange={(evento: ChangeEvent<HTMLInputElement>) => preencherCampo("descricao", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.descricao}
      />
    </PainelDeCadastro>
  );
}
