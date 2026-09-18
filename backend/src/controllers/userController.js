import {criarUsuarioSchema} from '../schema/userSchema.js'
import { criarUser } from '../services/usuarioService.js'

export async function cadastrarUsuario(res,req) {
    const resultado = criarUsuarioSchema.parse(req.body)

    const usuario = await criarUser(resultado);
    res.status(201).json(usuario)
}

