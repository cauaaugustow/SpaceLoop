export function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body ?? {});

    if (!resultado.success) {
      return next(resultado.error);
    }

    req.body = resultado.data;
    return next();
  };
}