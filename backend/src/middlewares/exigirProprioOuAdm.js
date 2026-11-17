export function exigirProprioOuAdmin(req, res, next) {
  const idAlvo = Number(req.params.id);

  if (!Number.isSafeInteger(idAlvo) || idAlvo <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (req.user.eadmin || Number(req.user.sub) === idAlvo) {
    return next();
  }

  return res.status(403).json({ message: "Acesso negado" });
}