import jwt from 'jsonwebtoken';

export function gerarToken(usuario) {
    return jwt.sign(
        {sub: String(usuario.id)},
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    );
}