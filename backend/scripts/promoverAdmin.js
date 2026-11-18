import "dotenv/config";
import prisma from "../src/config/prisma.js";

const email = process.argv[2]?.trim().toLowerCase();

try {
  if (!email) {
    throw new Error("Informe o e-mail de uma conta cadastrada: npm run admin:promote -- usuario@exemplo.com");
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new Error("Usuário não encontrado. Cadastre a conta antes de promovê-la.");
  }

  await prisma.usuario.update({ where: { id: usuario.id }, data: { eadmin: true } });
  console.log(`Conta ${email} promovida a administrador.`);
} catch (erro) {
  console.error(erro.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
