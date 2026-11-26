import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import AuthTabs from '../components/auth/AuthTabs.jsx'
import { AuthField, PasswordField } from '../components/auth/AuthField.jsx'
import { apiErrorMessage } from '../lib/apiError.js'
import { authService } from '../services/authService.js'

export default function LoginPage({ initialEmail = '', notice = '', onRegister, onLogin }) {
  const [email, setEmail] = useState(initialEmail)
  const [senha, setSenha] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await authService.login(email.trim(), senha)
      onLogin(user)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return <AuthLayout title="Entrar" prompt="Ainda não tem conta?" actionLabel="Cadastre-se" onAction={onRegister}>
    <div className="form-intro">
      <span className="section-kicker">BEM-VINDO DE VOLTA</span>
      <h2>Seu espaço começa aqui.</h2>
      <p>Entre na sua conta e encontre o espaço perfeito para o seu próximo momento.</p>
    </div>
    <AuthTabs current="login" onRegister={onRegister} />
    <form className="auth-form" onSubmit={submit}>
      <AuthField label="E-mail" id="email" name="email" type="email" icon={Mail} placeholder="seu@email.com" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} required />
      <PasswordField name="password" placeholder="Digite sua senha" autoComplete="current-password" minLength={8} value={senha} onChange={(event) => { setSenha(event.target.value); setError('') }} required />
      {error && <div className="form-message error-message" role="alert">{error}</div>}
      {notice && <div className="form-message success-message" role="status">{notice}</div>}
      <button type="submit" className="primary-button" disabled={busy}>{busy ? 'Aguarde...' : 'Entrar na minha conta'} {!busy && <ArrowRight size={18} />}</button>
    </form>
    <p className="form-footer">Novo por aqui? <button type="button" className="text-link" onClick={onRegister}>Crie sua conta</button></p>
  </AuthLayout>
}
