import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { lerVariavelObrigatoria } from "./env.js";

const adapter: PrismaPg = new PrismaPg({
  connectionString: lerVariavelObrigatoria("DATABASE_URL"),
});

const prisma: PrismaClient = new PrismaClient({ adapter });

export default prisma;
