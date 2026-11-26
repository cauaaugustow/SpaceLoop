export type Usuario = {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
};

export type RespostaDeLogin = {
  usuario: Usuario;
  token: string;
};
