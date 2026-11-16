export function exigirAdmin(req, res, next) {
  if (req.user?.eadmin !== true) {
    return res.status(403).json({
      message: "Acesso restrito ao administrador",
    });
  }

  return next();
}