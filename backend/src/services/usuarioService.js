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
import { atualizarUsuarioSchema, criarUsuarioSchema } from "../schema/userSchema.js";
import { ErroDeDominio } from "../error/erroDeDominio.js";

const normalizarEmail = (email) => email.trim().toLowerCase();
const normalizarCpf = (cpf) => cpf.replace(/\D/g, "");

export async function criarUser(dados) {
  const dadosValidados = criarUsuarioSchema.parse(dados);
  const { senha, ...dadosDoUsuario } = dadosValidados;
  const email = normalizarEmail(dadosValidados.email);
  const cpf = normalizarCpf(dadosValidados.cpf);

  if (await buscarUserPorCpf(cpf)) throw new ErroDeDominio("CPF já cadastrado", 409);
  if (await buscarUserPorEmail(email)) throw new ErroDeDominio("E-mail já cadastrado", 409);

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
  const dadosValidados = atualizarUsuarioSchema.parse(dados);
  const usuario = await getUsersById(id);
  const dadosAtualizados = { ...dadosValidados };

  if (dadosValidados.email) {
    dadosAtualizados.email = normalizarEmail(dadosValidados.email);
    const existente = await buscarUserPorEmail(dadosAtualizados.email);
    if (existente && existente.id !== id) throw criarErro("E-mail já cadastrado", 409);
  }

  if (dadosValidados.cpf) {
    dadosAtualizados.cpf = normalizarCpf(dadosValidados.cpf);
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
