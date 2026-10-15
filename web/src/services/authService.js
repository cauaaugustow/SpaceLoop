import api from "./api.js";


export const authService = {
    async login(email, senha){
        const { data } = await api.post('/login', {email, senha})
        localStorage.setItem('token', data.token)
        return data.usuario;
    },

    Logout(){
        localStorage.removeItem('token')
    }
}
