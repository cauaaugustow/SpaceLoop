import { Prisma } from "../generated/prisma/client.js";
import type { ErroDeDominio } from "./erroDeDominio.js";

export type CodigoDeErroDoPrisma = "P2002" | "P2003" | "P2025";

export type ErrosPorCodigoDoPrisma = Partial<Record<CodigoDeErroDoPrisma, ErroDeDominio>>;

export function lancarErroTraduzidoDoPrisma(erro: unknown, errosPorCodigo: ErrosPorCodigoDoPrisma): never {
  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    throw errosPorCodigo[erro.code as CodigoDeErroDoPrisma] ?? erro;
  }
  throw erro;
}
