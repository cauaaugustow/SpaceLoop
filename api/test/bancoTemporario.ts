import { randomUUID } from "node:crypto";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import pg from "pg";
import { lerVariavelObrigatoria } from "../src/config/env.js";

const execAsync: typeof exec.__promisify__ = promisify(exec);

export type BancoTemporario = { url: string; apagar: () => Promise<void> };

export async function criarBancoTemporario(): Promise<BancoTemporario> {
  const urlConfigurada: string = lerVariavelObrigatoria("DATABASE_URL");
  const nomeDoBanco: string = `spaceloop_teste_${randomUUID().replaceAll("-", "")}`;
  const urlDeManutencao: URL = new URL(urlConfigurada);
  urlDeManutencao.pathname = "/postgres";
  const urlDoBanco: URL = new URL(urlConfigurada);
  urlDoBanco.pathname = `/${nomeDoBanco}`;

  const executarNaManutencao = async (sql: string): Promise<void> => {
    const cliente: pg.Client = new pg.Client({ connectionString: urlDeManutencao.toString() });
    await cliente.connect();
    try {
      await cliente.query(sql);
    } finally {
      await cliente.end();
    }
  };

  await executarNaManutencao(`CREATE DATABASE ${nomeDoBanco}`);
  const apagar = (): Promise<void> => executarNaManutencao(`DROP DATABASE ${nomeDoBanco} WITH (FORCE)`);

  try {
    await execAsync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: urlDoBanco.toString() } });
  } catch (erro: unknown) {
    await apagar();
    throw erro;
  }

  return { url: urlDoBanco.toString(), apagar };
}
