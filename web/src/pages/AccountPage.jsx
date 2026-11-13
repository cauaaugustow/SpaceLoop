import { ArrowRight, Check } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'

export default function AccountPage({ user, onLogout }) {
  return <AuthLayout title="Sua conta" prompt="Sua conta está pronta">
    <div className="welcome">
      <span className="section-kicker">BEM-VINDO AO SPACELOOP</span>
      <span className="welcome-check"><Check size={31} /></span>
      <h2>Olá, {user.nome?.split(' ')[0]}!</h2>
      <p>Você entrou na sua conta. Seu próximo espaço está a um passo de distância.</p>
      <div className="account-card"><small>Conectado como</small><strong>{user.email}</strong></div>
      <button type="button" className="primary-button" onClick={onLogout}>Sair da conta <ArrowRight size={18} /></button>
    </div>
  </AuthLayout>
}
