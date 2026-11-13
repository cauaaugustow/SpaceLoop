import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import AuthTabs from '../components/auth/AuthTabs.jsx'
import { AuthField, PasswordField } from '../components/auth/AuthField.jsx'
import { apiErrorMessage } from '../lib/apiError.js'
import { cpfMask, phoneMask } from '../lib/formatters.js'
import { usuarioService } from '../services/usuarioService.js'

const initialForm = { nome: '', email: '', cpf: '', telefone: '', senha: '', confirmarSenha: '' }

export default function RegisterPage({ onLogin, onRegistered }) {
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (form.cpf.replace(/\D/g, '').length !== 11) {
      setError('Informe um CPF com 11 dígitos.')
      return
    }
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }
    setBusy(true)
    try {
      await usuarioService.cadastrar({
        nome: form.nome.trim(), email: form.email.trim(), cpf: form.cpf,
        ...(form.telefone.trim() && { telefone: form.telefone.trim() }), senha: form.senha,
      })
      onRegistered(form.email.trim())
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return <AuthLayout title="Criar conta" prompt="Já tem uma conta?" actionLabel="Entrar" onAction={onLogin}>
    <div className="form-intro">
      <span className="section-kicker">COMECE POR AQUI</span>
      <h2>Crie sua conta.</h2>
      <p>Preencha seus dados e prepare-se para encontrar o lugar ideal.</p>
    </div>
    <AuthTabs current="register" onLogin={onLogin} />
    <form className="auth-form" onSubmit={submit}>
      <AuthField label="Nome completo" id="name" name="name" type="text" placeholder="Como podemos chamar você?" autoComplete="name" minLength={3} value={form.nome} onChange={(event) => setField('nome', event.target.value)} required />
      <AuthField label="E-mail" id="email" name="email" type="email" icon={Mail} placeholder="seu@email.com" autoComplete="email" value={form.email} onChange={(event) => setField('email', event.target.value)} required />
      <div className="field-row">
        <AuthField label="CPF" id="cpf" name="cpf" type="text" inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} onChange={(event) => setField('cpf', cpfMask(event.target.value))} required />
        <AuthField label="Telefone (opcional)" id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" autoComplete="tel" value={form.telefone} onChange={(event) => setField('telefone', phoneMask(event.target.value))} />
      </div>
      <PasswordField name="password" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" minLength={8} value={form.senha} onChange={(event) => setField('senha', event.target.value)} required />
      <PasswordField label="Confirmar senha" id="confirm-password" name="confirm-password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={8} value={form.confirmarSenha} onChange={(event) => setField('confirmarSenha', event.target.value)} required />
      {error && <div className="form-message error-message" role="alert">{error}</div>}
      <button type="submit" className="primary-button" disabled={busy}>{busy ? 'Aguarde...' : 'Criar minha conta'} {!busy && <ArrowRight size={18} />}</button>
    </form>
    <p className="form-footer">Já faz parte do SpaceLoop? <button type="button" className="text-link" onClick={onLogin}>Faça login</button></p>
  </AuthLayout>
}
