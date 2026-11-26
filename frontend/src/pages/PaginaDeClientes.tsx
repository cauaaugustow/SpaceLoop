import type { JSX } from "react";
import { clienteSchema, type DadosDeCliente } from "shared";
import { CampoDeFormulario } from "../components/CampoDeFormulario";
import { PainelDeCadastro, type Coluna } from "../components/PainelDeCadastro";
import { useTelaDeCadastro } from "../hooks/useTelaDeCadastro";
import { clienteService } from "../services/recursosService";
import type { Cliente } from "../types/registros";
import { formatarCpf } from "../utilitarios/formatacao";

type FormularioDeCliente = { nome: string; cpf: string; email: string; telefone: string };

const formularioVazio: FormularioDeCliente = { nome: "", cpf: "", email: "", telefone: "" };

const colunas: Coluna<Cliente>[] = [
  { titulo: "Nome", obterTexto: (cliente: Cliente) => cliente.nome },
  { titulo: "CPF", obterTexto: (cliente: Cliente) => formatarCpf(cliente.cpf) },
  { titulo: "E-mail", obterTexto: (cliente: Cliente) => cliente.email },
  { titulo: "Telefone", obterTexto: (cliente: Cliente) => cliente.telefone || "—" },
];

function montarFormulario({ nome, cpf, email, telefone }: Cliente): FormularioDeCliente {
  return { nome, cpf: formatarCpf(cpf), email, telefone: telefone ?? "" };
}

export function PaginaDeClientes(): JSX.Element {
  const tela = useTelaDeCadastro<Cliente, DadosDeCliente, FormularioDeCliente>({
    servico: clienteService,
    schema: clienteSchema,
    formularioVazio,
    montarFormulario,
  });
  const { formulario, errosDoFormulario, preencherCampo } = tela;

  return (
    <PainelDeCadastro
      titulo="Clientes"
      nomeNoSingular="cliente"
      tela={tela}
      colunas={colunas}
      descreverRegistro={(cliente: Cliente) => `o cliente ${cliente.nome}`}
    >
      <CampoDeFormulario
        rotulo="Nome"
        id="nome"
        value={formulario.nome}
        onChange={(evento) => preencherCampo("nome", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.nome}
      />
      <CampoDeFormulario
        rotulo="CPF"
        id="cpf"
        inputMode="numeric"
        placeholder="000.000.000-00"
        value={formulario.cpf}
        onChange={(evento) => preencherCampo("cpf", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.cpf}
      />
      <CampoDeFormulario
        rotulo="E-mail"
        id="email"
        type="email"
        value={formulario.email}
        onChange={(evento) => preencherCampo("email", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.email}
      />
      <CampoDeFormulario
        rotulo="Telefone (opcional)"
        id="telefone"
        type="tel"
        value={formulario.telefone}
        onChange={(evento) => preencherCampo("telefone", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.telefone}
      />
    </PainelDeCadastro>
  );
}
