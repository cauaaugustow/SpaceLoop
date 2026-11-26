import { isAxiosError } from "axios";
import type { ErroDeCampo, RespostaDeErro } from "shared";
import type { ZodError } from "zod";

export type ErrosPorCampo = Partial<Record<string, string>>;

export type ErrosDoFormulario = {
  mensagemGeral: string;
  errosPorCampo: ErrosPorCampo;
};

export const semErrosNoFormulario: ErrosDoFormulario = { mensagemGeral: "", errosPorCampo: {} };

const mensagemDeFalhaDeConexao: string = "Não foi possível conectar. Confira sua conexão e tente novamente.";

export function mapearErrosDeValidacao(erroDeValidacao: ZodError): ErrosDoFormulario {
  const errosPorCampo: ErrosPorCampo = {};
  for (const problema of erroDeValidacao.issues) {
    const campo: string = problema.path.join(".");
    errosPorCampo[campo] ??= problema.message;
  }
  return { mensagemGeral: "", errosPorCampo };
}

export function lerErrosDaApi(erro: unknown): ErrosDoFormulario {
  const respostaDeErro: RespostaDeErro | undefined = isAxiosError<RespostaDeErro>(erro) ? erro.response?.data : undefined;
  if (!respostaDeErro?.mensagem) return { mensagemGeral: mensagemDeFalhaDeConexao, errosPorCampo: {} };

  const errosPorCampo: ErrosPorCampo = Object.fromEntries(
    (respostaDeErro.erros ?? []).map(({ campo, mensagem }: ErroDeCampo): [string, string] => [campo, mensagem]),
  );
  const hasErroDeCampo: boolean = Object.keys(errosPorCampo).length > 0;
  return { mensagemGeral: hasErroDeCampo ? "" : respostaDeErro.mensagem, errosPorCampo };
}
