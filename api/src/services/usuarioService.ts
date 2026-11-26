import {
  atualizarUser as atualizarUserRepository,
  buscarUserPorCpf,
  buscarUserPorEmail,
  buscarUserPorId,
  criarUser as criarUserRepository,
  deletarUser as deletarUserRepository,
  listarUsers as listarUsersRepository,
  type UsuarioSelecionado,
} from "../repositories/userRepository.js";
import { hashearSenha } from "./senhaService.js";
import type { RespostaDeRemocao } from "./respostaDeRemocao.js";
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  type DadosDeNovoUsuario,
  type DadosDeAtualizacaoDeUsuario,
} from "../schema/userSchema.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

const normalizarEmail = (email: string): string => email.trim().toLowerCase();
const normalizarCpf = (cpf: string): string => cpf.replace(/\D/g, "");

export async function criarUser(dados: unknown): Promise<UsuarioSelecionado> {
  const dadosValidados: DadosDeNovoUsuario = criarUsuarioSchema.parse(dados);
  const { senha, ...dadosDoUsuario }: DadosDeNovoUsuario = dadosValidados;
  const email: string = normalizarEmail(dadosValidados.email);
  const cpf: string = normalizarCpf(dadosValidados.cpf);

  if (await buscarUserPorCpf(cpf)) throw new ErroDeDominio("CPF já cadastrado", 409);
  if (await buscarUserPorEmail(email)) throw new ErroDeDominio("E-mail já cadastrado", 409);

  return criarUserRepository({
    ...dadosDoUsuario,
    email,
    cpf,
    senhaHash: await hashearSenha(senha),
  });
}

export async function getAllUsers(): Promise<UsuarioSelecionado[]> {
  return listarUsersRepository();
}

export async function getUsersById(id: number): Promise<UsuarioSelecionado> {
  const usuario: UsuarioSelecionado | null = await buscarUserPorId(id);
  if (!usuario) throw new ErroDeDominio("Usuário não encontrado", 404);
  return usuario;
}

export async function updateUser(id: number, dados: unknown): Promise<UsuarioSelecionado> {
  const dadosValidados: DadosDeAtualizacaoDeUsuario = atualizarUsuarioSchema.parse(dados);
  await getUsersById(id);
  const dadosAtualizados: DadosDeAtualizacaoDeUsuario = { ...dadosValidados };

  if (dadosValidados.email) {
    dadosAtualizados.email = normalizarEmail(dadosValidados.email);
    const donoDoEmail: UsuarioSelecionado | null = await buscarUserPorEmail(dadosAtualizados.email);
    if (donoDoEmail && donoDoEmail.id !== id) {
      throw new ErroDeDominio("E-mail já cadastrado", 409);
    }
  }

  if (dadosValidados.cpf) {
    dadosAtualizados.cpf = normalizarCpf(dadosValidados.cpf);
    const donoDoCpf: UsuarioSelecionado | null = await buscarUserPorCpf(dadosAtualizados.cpf);
    if (donoDoCpf && donoDoCpf.id !== id) {
      throw new ErroDeDominio("CPF já cadastrado", 409);
    }
  }

  return atualizarUserRepository(id, dadosAtualizados);
}

export async function deleteUser(id: number): Promise<RespostaDeRemocao> {
  await getUsersById(id);
  await deletarUserRepository(id);
  return { success: true, message: "Usuário deletado com sucesso" };
}
