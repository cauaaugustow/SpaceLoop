import { useState } from 'react'
import AccountPage from './pages/AccountPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { authService } from './services/authService.js'

export default function App() {
  const [user, setUser] = useState(authService.getCurrentUser)
  const [page, setPage] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [notice, setNotice] = useState('')

  if (user) {
    const onLogout = () => {
      authService.logout()
      setUser(null)
      setPage('login')
      setLoginEmail('')
    }
    return user.eadmin
      ? <AdminPage user={user} onLogout={onLogout} />
      : <AccountPage user={user} onLogout={onLogout} />
  }

  if (page === 'register') {
    return <RegisterPage
      onLogin={() => setPage('login')}
      onRegistered={(email) => {
        setLoginEmail(email)
        setNotice('Conta criada com sucesso! Agora é só entrar.')
        setPage('login')
      }}
    />
  }

  return <LoginPage
    initialEmail={loginEmail}
    notice={notice}
    onLogin={setUser}
    onRegister={() => {
      setNotice('')
      setPage('register')
    }}
  />
}
