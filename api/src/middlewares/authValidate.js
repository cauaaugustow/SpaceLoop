import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export async function authValidate(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Token não informado" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  const id = Number(payload.sub);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { eadmin: true },
    });

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.user = { ...payload, eadmin: usuario.eadmin };
    return next();
  } catch (erro) {
    return next(erro);
  }
}