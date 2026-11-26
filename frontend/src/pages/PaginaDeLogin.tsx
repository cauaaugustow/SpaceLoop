import { useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import type { ZodSafeParseResult } from "zod";
import { ArrowRight, Mail } from "lucide-react";
import { loginSchema, type DadosDeLogin } from "shared";
import { AbasDeAutenticacao } from "../components/autenticacao/AbasDeAutenticacao";
import { LayoutDeAutenticacao } from "../components/autenticacao/LayoutDeAutenticacao";
import { CampoDeFormulario } from "../components/CampoDeFormulario";
import { CampoDeSenha } from "../components/CampoDeSenha";
import { fazerLogin } from "../services/autenticacaoService";
import type { PaginaDeAcesso } from "../types/paginas";
import type { RespostaDeLogin } from "../types/usuario";
import {
  lerErrosDaApi,
  mapearErrosDeValidacao,
  semErrosNoFormulario,
  type ErrosDoFormulario,
} from "../utilitarios/errosDeFormulario";

type PropriedadesDaPaginaDeLogin = {
  emailInicial: string;
  avisoDeSucesso: string;
  aoEscolherPagina: (pagina: PaginaDeAcesso) => void;
  aoEntrar: (login: RespostaDeLogin) => void;
};

type FormularioDeLogin = { email: string; senha: string };

export function PaginaDeLogin({ emailInicial, avisoDeSucesso, aoEscolherPagina, aoEntrar }: PropriedadesDaPaginaDeLogin): JSX.Element {
  const [formulario, setFormulario] = useState<FormularioDeLogin>({ email: emailInicial, senha: "" });
  const [errosDoFormulario, setErrosDoFormulario] = useState<ErrosDoFormulario>(semErrosNoFormulario);
  const [isEnviando, setIsEnviando] = useState<boolean>(false);

  function preencherCampo(evento: ChangeEvent<HTMLInputElement>): void {
    const { name, value }: HTMLInputElement = evento.target;
    setFormulario((formularioAtual: FormularioDeLogin) => ({ ...formularioAtual, [name]: value }));
    setErrosDoFormulario(semErrosNoFormulario);
  }

  async function enviarLogin(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const validacao: ZodSafeParseResult<DadosDeLogin> = loginSchema.safeParse(formulario);
    if (!validacao.success) {
      setErrosDoFormulario(mapearErrosDeValidacao(validacao.error));
      return;
    }

    setIsEnviando(true);
    try {
      aoEntrar(await fazerLogin(validacao.data));
    } catch (erro: unknown) {
      setErrosDoFormulario(lerErrosDaApi(erro));
      setIsEnviando(false);
    }
  }

  return (
    <LayoutDeAutenticacao
      titulo="Entrar"
      pergunta="Ainda não tem conta?"
      rotuloDaAcao="Cadastre-se"
      aoTrocarDePagina={() => aoEscolherPagina("cadastro")}
    >
      <div className="form-intro">
        <span className="section-kicker">BEM-VINDO DE VOLTA</span>
        <h2>Seu espaço começa aqui.</h2>
        <p>Entre na sua conta para gerenciar blocos, salas, clientes e reservas.</p>
      </div>
      <AbasDeAutenticacao paginaAtual="login" aoEscolherPagina={aoEscolherPagina} />
      <form className="auth-form" onSubmit={enviarLogin} noValidate>
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
          placeholder="Digite sua senha"
          autoComplete="current-password"
          value={formulario.senha}
          onChange={preencherCampo}
          mensagemDeErro={errosDoFormulario.errosPorCampo.senha}
        />
        {errosDoFormulario.mensagemGeral && (
          <div className="form-message error-message" role="alert">{errosDoFormulario.mensagemGeral}</div>
        )}
        {avisoDeSucesso && <div className="form-message success-message" role="status">{avisoDeSucesso}</div>}
        <button type="submit" className="primary-button" disabled={isEnviando}>
          {isEnviando ? "Aguarde..." : "Entrar na minha conta"} {!isEnviando && <ArrowRight size={18} />}
        </button>
      </form>
      <p className="form-footer">
        Novo por aqui?{" "}
        <button type="button" className="text-link" onClick={() => aoEscolherPagina("cadastro")}>Crie sua conta</button>
      </p>
    </LayoutDeAutenticacao>
  );
}
