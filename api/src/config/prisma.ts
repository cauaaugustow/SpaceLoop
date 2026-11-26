import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";
import { lerVariavelObrigatoria } from "./env.js";

const adapter: PrismaBetterSqlite3 = new PrismaBetterSqlite3({
  url: lerVariavelObrigatoria("DATABASE_URL"),
});

const prisma: PrismaClient = new PrismaClient({ adapter });

export default prisma;
