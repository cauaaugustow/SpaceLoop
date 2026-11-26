import { Prisma } from "../generated/prisma/client.js";

export function codigoDoErroPrisma(erro: unknown): string | undefined {
  return erro instanceof Prisma.PrismaClientKnownRequestError ? erro.code : undefined;
}
