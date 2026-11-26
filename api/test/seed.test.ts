import "dotenv/config";
import assert from "node:assert/strict";
import { exec } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";
import pg from "pg";
import { criarBancoTemporario, type BancoTemporario } from "./bancoTemporario.js";

const execAsync: typeof exec.__promisify__ = promisify(exec);

test("seed preenche todas as tabelas e não duplica quando roda em outro dia", async () => {
  const banco: BancoTemporario = await criarBancoTemporario();
  const cliente: pg.Client = new pg.Client({ connectionString: banco.url });
  const rodarSeed = async (): Promise<void> => {
    await execAsync("npx tsx prisma/seed.ts", { env: { ...process.env, DATABASE_URL: banco.url } });
  };
  const contarRegistros = async (): Promise<number[]> => {
    const quantidades: number[] = [];
    for (const tabela of ["usuarios", "blocos", "salas", "clientes", "reservas"]) {
      const consulta: pg.QueryResult<{ quantidade: number }> = await cliente.query(
        `SELECT COUNT(*)::int AS quantidade FROM ${tabela}`,
      );
      quantidades.push(consulta.rows[0]?.quantidade ?? -1);
    }
    return quantidades;
  };

  try {
    await cliente.connect();
    await rodarSeed();
    assert.deepEqual(await contarRegistros(), [1, 2, 3, 3, 3]);

    await cliente.query("UPDATE reservas SET dia = dia - 1");
    await rodarSeed();
    assert.deepEqual(await contarRegistros(), [1, 2, 3, 3, 3]);
  } finally {
    await cliente.end();
    await banco.apagar();
  }
});
