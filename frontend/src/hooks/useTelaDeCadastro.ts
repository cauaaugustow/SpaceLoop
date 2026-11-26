import { useState, type FormEvent } from "react";
import type { ZodSafeParseResult } from "zod";
import type { ZodType } from "zod";
import type { ServicoDeCrud } from "../services/servicoDeCrud";
import type { Registro } from "../types/registros";
import {
  lerErrosDaApi,
  mapearErrosDeValidacao,
  semErrosNoFormulario,
  type ErrosDoFormulario,
} from "../utilitarios/errosDeFormulario";
import { useListaDaApi, type ListaDaApi } from "./useListaDaApi";

export type ConfiguracaoDaTela<RegistroDaTela extends Registro, Dados, Formulario> = {
  servico: ServicoDeCrud<RegistroDaTela, Dados>;
  schema: ZodType<Dados>;
  formularioVazio: Formulario;
  montarFormulario: (registro: RegistroDaTela) => Formulario;
};

export type TelaDeCadastro<RegistroDaTela extends Registro, Formulario> = {
  lista: ListaDaApi<RegistroDaTela>;
  formulario: Formulario;
  errosDoFormulario: ErrosDoFormulario;
  idEmEdicao: number | null;
  isModalAberto: boolean;
  isSalvando: boolean;
  avisoDeSucesso: string;
  mensagemDeErroAoRemover: string;
  abrirCriacao: () => void;
  abrirEdicao: (registro: RegistroDaTela) => void;
  fecharModal: () => void;
  preencherCampo: (campo: keyof Formulario, valorDoCampo: string) => void;
  salvar: (evento: FormEvent<HTMLFormElement>) => Promise<void>;
  removerComConfirmacao: (registro: RegistroDaTela, descricaoDoRegistro: string) => Promise<void>;
};

export function useTelaDeCadastro<RegistroDaTela extends Registro, Dados, Formulario extends Record<string, string>>({
  servico,
  schema,
  formularioVazio,
  montarFormulario,
}: ConfiguracaoDaTela<RegistroDaTela, Dados, Formulario>): TelaDeCadastro<RegistroDaTela, Formulario> {
  const lista: ListaDaApi<RegistroDaTela> = useListaDaApi(servico.listar);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);
  const [errosDoFormulario, setErrosDoFormulario] = useState<ErrosDoFormulario>(semErrosNoFormulario);
  const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null);
  const [isModalAberto, setIsModalAberto] = useState<boolean>(false);
  const [isSalvando, setIsSalvando] = useState<boolean>(false);
  const [avisoDeSucesso, setAvisoDeSucesso] = useState<string>("");
  const [mensagemDeErroAoRemover, setMensagemDeErroAoRemover] = useState<string>("");

  function limparAvisos(): void {
    setAvisoDeSucesso("");
    setMensagemDeErroAoRemover("");
  }

  function abrirModal(formularioInicial: Formulario, idDoRegistro: number | null): void {
    limparAvisos();
    setFormulario(formularioInicial);
    setIdEmEdicao(idDoRegistro);
    setErrosDoFormulario(semErrosNoFormulario);
    setIsModalAberto(true);
  }

  function preencherCampo(campo: keyof Formulario, valorDoCampo: string): void {
    setFormulario((formularioAtual: Formulario) => ({ ...formularioAtual, [campo]: valorDoCampo }));
    setErrosDoFormulario(semErrosNoFormulario);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const validacao: ZodSafeParseResult<Dados> = schema.safeParse(formulario);
    if (!validacao.success) {
      setErrosDoFormulario(mapearErrosDeValidacao(validacao.error));
      return;
    }

    setIsSalvando(true);
    try {
      if (idEmEdicao === null) {
        await servico.criar(validacao.data);
      } else {
        await servico.atualizar(idEmEdicao, validacao.data);
      }
      setIsModalAberto(false);
      setAvisoDeSucesso(idEmEdicao === null ? "Registro criado com sucesso." : "Registro atualizado com sucesso.");
      lista.recarregar();
    } catch (erro: unknown) {
      setErrosDoFormulario(lerErrosDaApi(erro));
    } finally {
      setIsSalvando(false);
    }
  }

  async function removerComConfirmacao(registro: RegistroDaTela, descricaoDoRegistro: string): Promise<void> {
    if (!window.confirm(`Remover ${descricaoDoRegistro}? Essa ação não pode ser desfeita.`)) return;
    limparAvisos();
    try {
      await servico.remover(registro.id);
      setAvisoDeSucesso("Registro removido com sucesso.");
      lista.recarregar();
    } catch (erro: unknown) {
      setMensagemDeErroAoRemover(lerErrosDaApi(erro).mensagemGeral);
    }
  }

  return {
    lista,
    formulario,
    errosDoFormulario,
    idEmEdicao,
    isModalAberto,
    isSalvando,
    avisoDeSucesso,
    mensagemDeErroAoRemover,
    abrirCriacao: () => abrirModal(formularioVazio, null),
    abrirEdicao: (registro: RegistroDaTela) => abrirModal(montarFormulario(registro), registro.id),
    fecharModal: () => setIsModalAberto(false),
    preencherCampo,
    salvar,
    removerComConfirmacao,
  };
}
