import { useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { criarUsuarioSchema } from "shared";
import { AbasDeAutenticacao } from "../components/autenticacao/AbasDeAutenticacao";
import { LayoutDeAutenticacao } from "../components/autenticacao/LayoutDeAutenticacao";
import { CampoDeFormulario } from "../components/CampoDeFormulario";
import { CampoDeSenha } from "../components/CampoDeSenha";
import { cadastrarUsuario } from "../services/autenticacaoService";
import type { PaginaDeAcesso } from "../types/paginas";
import {
  lerErrosDaApi,
  mapearErrosDeValidacao,
  semErrosNoFormulario,
  type ErrosDoFormulario,
} from "../utilitarios/errosDeFormulario";

type PropriedadesDaPaginaDeCadastro = {
  aoEscolherPagina: (pagina: PaginaDeAcesso) => void;
  aoCadastrar: (emailCadastrado: string) => void;
};

type FormularioDeCadastro = { nome: string; email: string; senha: string; confirmacaoDaSenha: string };

const formularioVazio: FormularioDeCadastro = { nome: "", email: "", senha: "", confirmacaoDaSenha: "" };

export function PaginaDeCadastro({ aoEscolherPagina, aoCadastrar }: PropriedadesDaPaginaDeCadastro): JSX.Element {
  const [formulario, setFormulario] = useState<FormularioDeCadastro>(formularioVazio);
  const [errosDoFormulario, setErrosDoFormulario] = useState<ErrosDoFormulario>(semErrosNoFormulario);
  const [isEnviando, setIsEnviando] = useState<boolean>(false);

  function preencherCampo(evento: ChangeEvent<HTMLInputElement>): void {
    const { name, value }: HTMLInputElement = evento.target;
    setFormulario((formularioAtual: FormularioDeCadastro) => ({ ...formularioAtual, [name]: value }));
    setErrosDoFormulario(semErrosNoFormulario);
  }

  async function enviarCadastro(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const validacao = criarUsuarioSchema.safeParse(formulario);
    if (!validacao.success) {
      setErrosDoFormulario(mapearErrosDeValidacao(validacao.error));
      return;
    }
    if (formulario.senha !== formulario.confirmacaoDaSenha) {
      setErrosDoFormulario({ mensagemGeral: "", errosPorCampo: { confirmacaoDaSenha: "As senhas não coincidem" } });
      return;
    }

    setIsEnviando(true);
    try {
      await cadastrarUsuario(validacao.data);
      aoCadastrar(validacao.data.email);
    } catch (erro: unknown) {
      setErrosDoFormulario(lerErrosDaApi(erro));
      setIsEnviando(false);
    }
  }

  return (
    <LayoutDeAutenticacao
      titulo="Criar conta"
      pergunta="Já tem uma conta?"
      rotuloDaAcao="Entrar"
      aoTrocarDePagina={() => aoEscolherPagina("login")}
    >
      <div className="form-intro">
        <span className="section-kicker">COMECE POR AQUI</span>
        <h2>Crie sua conta.</h2>
        <p>Preencha seus dados para acessar o SpaceLoop.</p>
      </div>
      <AbasDeAutenticacao paginaAtual="cadastro" aoEscolherPagina={aoEscolherPagina} />
      <form className="auth-form" onSubmit={enviarCadastro} noValidate>
        <CampoDeFormulario
          rotulo="Nome completo"
          id="nome"
          name="nome"
          type="text"
          placeholder="Como podemos chamar você?"
          autoComplete="name"
          value={formulario.nome}
          onChange={preencherCampo}
          mensagemDeErro={errosDoFormulario.errosPorCampo.nome}
        />
        <CampoDeFormulario
          rotulo="E-mail"
          id="email"
          name="email"
          type="email"
          Icone={Mail}
          placeholder="seu@email.com"
          autoComplete="email"
          value={formulario.email}
          onChange={preencherCampo}
          mensagemDeErro={errosDoFormulario.errosPorCampo.email}
        />
        <CampoDeSenha
          rotulo="Senha"
          id="senha"
          name="senha"
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          value={formulario.senha}
          onChange={preencherCampo}
          mensagemDeErro={errosDoFormulario.errosPorCampo.senha}
        />
        <CampoDeSenha
          rotulo="Confirmar senha"
          id="confirmacaoDaSenha"
          name="confirmacaoDaSenha"
          placeholder="Digite a senha novamente"
          autoComplete="new-password"
          value={formulario.confirmacaoDaSenha}
          onChange={preencherCampo}
          mensagemDeErro={errosDoFormulario.errosPorCampo.confirmacaoDaSenha}
        />
        {errosDoFormulario.mensagemGeral && (
          <div className="form-message error-message" role="alert">{errosDoFormulario.mensagemGeral}</div>
        )}
        <button type="submit" className="primary-button" disabled={isEnviando}>
          {isEnviando ? "Aguarde..." : "Criar minha conta"} {!isEnviando && <ArrowRight size={18} />}
        </button>
      </form>
      <p className="form-footer">
        Já faz parte do SpaceLoop?{" "}
        <button type="button" className="text-link" onClick={() => aoEscolherPagina("login")}>Faça login</button>
      </p>
    </LayoutDeAutenticacao>
  );
}
