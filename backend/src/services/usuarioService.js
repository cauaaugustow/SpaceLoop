import {
  atualizarUser as atualizarUserRepository,
  buscarUserPorCpf,
  buscarUserPorEmail,
  buscarUserPorId,
  criarUser as criarUserRepository,
  deletarUser as deletarUserRepository,
  listarUsers as listarUsersRepository,
} from "../repositories/userRepository.js";
import { hashearSenha } from "./senhaService.js";

const normalizarEmail = (email) => email.trim().toLowerCase();
const normalizarCpf = (cpf) => cpf.replace(/\D/g, "");

function criarErro(mensagem, statusCode) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

export async function criarUser(dados) {
  const { senha, ...dadosDoUsuario } = dados;
  const email = normalizarEmail(dados.email);
  const cpf = normalizarCpf(dados.cpf);

  if (await buscarUserPorCpf(cpf)) throw criarErro("CPF já cadastrado", 409);
  if (await buscarUserPorEmail(email)) throw criarErro("E-mail já cadastrado", 409);

  return criarUserRepository({
    ...dadosDoUsuario,
    email,
    cpf,
    senhaHash: await hashearSenha(senha),
  });
}

export async function getAllUsers() {
  return listarUsersRepository();
}

export async function getUsersById(id) {
  const usuario = await buscarUserPorId(id);
  if (!usuario) throw criarErro("Usuário não encontrado", 404);
  return usuario;
}

export async function updateUser(id, dados) {
  const usuario = await getUsersById(id);
  const dadosAtualizados = { ...dados };

  if (dados.email) {
    dadosAtualizados.email = normalizarEmail(dados.email);
    const existente = await buscarUserPorEmail(dadosAtualizados.email);
    if (existente && existente.id !== id) throw criarErro("E-mail já cadastrado", 409);
  }

  if (dados.cpf) {
    dadosAtualizados.cpf = normalizarCpf(dados.cpf);
    const existente = await buscarUserPorCpf(dadosAtualizados.cpf);
    if (existente && existente.id !== id) throw criarErro("CPF já cadastrado", 409);
  }

  return atualizarUserRepository(id, dadosAtualizados);
}

export async function deleteUser(id) {
  await getUsersById(id);
  await deletarUserRepository(id);
  return { success: true, message: "Usuário deletado com sucesso" };
}
