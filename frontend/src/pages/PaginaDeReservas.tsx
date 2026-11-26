import type { JSX, ChangeEvent } from "react";
import { TURNOS, hojeNoFusoDaAplicacao, reservaSchema, type DadosDeReserva, type Turno } from "shared";
import { CampoDeFormulario } from "../components/CampoDeFormulario";
import { CampoDeSelecao, type OpcaoDeSelecao } from "../components/CampoDeSelecao";
import { PainelDeCadastro, type Coluna } from "../components/PainelDeCadastro";
import { useListaDaApi, type ListaDaApi } from "../hooks/useListaDaApi";
import { useTelaDeCadastro, type TelaDeCadastro } from "../hooks/useTelaDeCadastro";
import { clienteService, reservaService, salaService } from "../services/recursosService";
import type { Cliente, Reserva, Sala } from "../types/registros";
import { formatarDia, rotulosDosTurnos } from "../utilitarios/formatacao";

type RegistroComNome = { id: number; nome: string };

type FormularioDeReserva = { dia: string; turno: string; idSala: string; idCliente: string };

const formularioVazio: FormularioDeReserva = { dia: "", turno: "", idSala: "", idCliente: "" };

const opcoesDeTurno: OpcaoDeSelecao[] = TURNOS.map((turno: Turno) => ({ valor: turno, rotulo: rotulosDosTurnos[turno] }));

const colunas: Coluna<Reserva>[] = [
  { titulo: "Dia", obterTexto: (reserva: Reserva) => formatarDia(reserva.dia) },
  { titulo: "Turno", obterTexto: (reserva: Reserva) => rotulosDosTurnos[reserva.turno] },
  { titulo: "Sala", obterTexto: (reserva: Reserva) => reserva.sala.nome },
  { titulo: "Cliente", obterTexto: (reserva: Reserva) => reserva.cliente.nome },
];

function montarFormulario({ dia, turno, idSala, idCliente }: Reserva): FormularioDeReserva {
  return { dia: dia.slice(0, 10), turno, idSala: String(idSala), idCliente: String(idCliente) };
}

function montarOpcoesPorNome(registros: RegistroComNome[]): OpcaoDeSelecao[] {
  return registros.map((registro: RegistroComNome): OpcaoDeSelecao => ({ valor: String(registro.id), rotulo: registro.nome }));
}

export function PaginaDeReservas(): JSX.Element {
  const tela: TelaDeCadastro<Reserva, FormularioDeReserva> = useTelaDeCadastro<Reserva, DadosDeReserva, FormularioDeReserva>({
    servico: reservaService,
    schema: reservaSchema,
    formularioVazio,
    montarFormulario,
  });
  const salas: ListaDaApi<Sala> = useListaDaApi<Sala>(salaService.listar);
  const clientes: ListaDaApi<Cliente> = useListaDaApi<Cliente>(clienteService.listar);
  const { formulario, errosDoFormulario, preencherCampo }: TelaDeCadastro<Reserva, FormularioDeReserva> = tela;

  return (
    <PainelDeCadastro
      titulo="Reservas"
      nomeNoSingular="reserva"
      tela={tela}
      colunas={colunas}
      descreverRegistro={(reserva: Reserva) => `a reserva da ${reserva.sala.nome} em ${formatarDia(reserva.dia)}`}
      mensagemDeErroDasOpcoes={salas.mensagemDeErro || clientes.mensagemDeErro}
    >
      <CampoDeSelecao
        rotulo="Sala"
        id="idSala"
        opcoes={montarOpcoesPorNome(salas.itens)}
        value={formulario.idSala}
        onChange={(evento: ChangeEvent<HTMLSelectElement>) => preencherCampo("idSala", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.idSala}
      />
      <CampoDeSelecao
        rotulo="Cliente"
        id="idCliente"
        opcoes={montarOpcoesPorNome(clientes.itens)}
        value={formulario.idCliente}
        onChange={(evento: ChangeEvent<HTMLSelectElement>) => preencherCampo("idCliente", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.idCliente}
      />
      <CampoDeFormulario
        rotulo="Dia"
        id="dia"
        type="date"
        min={hojeNoFusoDaAplicacao()}
        value={formulario.dia}
        onChange={(evento: ChangeEvent<HTMLInputElement>) => preencherCampo("dia", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.dia}
      />
      <CampoDeSelecao
        rotulo="Turno"
        id="turno"
        opcoes={opcoesDeTurno}
        value={formulario.turno}
        onChange={(evento: ChangeEvent<HTMLSelectElement>) => preencherCampo("turno", evento.target.value)}
        mensagemDeErro={errosDoFormulario.errosPorCampo.turno}
      />
    </PainelDeCadastro>
  );
}
