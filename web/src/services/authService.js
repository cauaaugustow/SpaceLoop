import api from './api.js'

export const authService = {
  getCurrentUser() {
    try {
      const token = localStorage.getItem('token')
      const value = localStorage.getItem('usuario')
      if (!token || !value) return null
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (!payload.exp || payload.exp * 1000 <= Date.now()) {
        authService.logout()
        return null
      }
      return JSON.parse(value)
    } catch {
      authService.logout()
      return null
    }
  },

  async login(email, senha) {
    const { data } = await api.post('/login', { email, senha })
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    return data.usuario
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },
}
