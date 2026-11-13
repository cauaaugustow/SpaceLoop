export default function AuthTabs({ current, onLogin, onRegister }) {
  return <nav className="auth-tabs" aria-label="Acesso à conta">
    <button type="button" className={current === 'login' ? 'active' : ''} aria-current={current === 'login' ? 'page' : undefined} onClick={current === 'login' ? undefined : onLogin}>Entrar</button>
    <button type="button" className={current === 'register' ? 'active' : ''} aria-current={current === 'register' ? 'page' : undefined} onClick={current === 'register' ? undefined : onRegister}>Criar conta</button>
  </nav>
}
