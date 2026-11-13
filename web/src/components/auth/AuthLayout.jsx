import Brand from './Brand.jsx'
import FeaturePanel from './FeaturePanel.jsx'
import '../../app.css'

export default function AuthLayout({ title, prompt, actionLabel, onAction, children }) {
  return <main className="auth-page"><div className="auth-shell">
    <FeaturePanel />
    <section className="auth-panel" aria-label={title}>
      <header className="auth-header">
        <div className="mobile-brand"><Brand /></div>
        <div className="header-action">{prompt} {actionLabel && <button type="button" className="text-link" onClick={onAction}>{actionLabel}</button>}</div>
      </header>
      <div className="auth-content">{children}</div>
      <footer className="auth-bottom">© {new Date().getFullYear()} SpaceLoop <span>•</span> Espaços que conectam pessoas.</footer>
    </section>
  </div></main>
}
