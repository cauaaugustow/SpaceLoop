export type ErroDeCampo = { campo: string; mensagem: string };

export type RespostaDeErro = { mensagem: string; erros?: ErroDeCampo[] | undefined };
