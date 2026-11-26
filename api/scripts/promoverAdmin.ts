import "dotenv/config";
import prisma from "../src/config/prisma.js";

const email: string | undefined = process.argv[2]?.trim().toLowerCase();

try {
  if (!email) {
    throw new Error("Informe o e-mail de uma conta cadastrada: npm run admin:promote -- usuario@exemplo.com");
  }

  const usuario: { id: number } | null = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new Error("Usuário não encontrado. Cadastre a conta antes de promovê-la.");
  }

  await prisma.usuario.update({ where: { id: usuario.id }, data: { eadmin: true } });
  console.log(`Conta ${email} promovida a administrador.`);
} catch (erro: unknown) {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
