import api from './api.js'

export const usuarioService = {
    cadastrar: async (dadosUsuario) =>{
        const response = await api.post('/usuario', dadosUsuario)

        return response.data
    }
}