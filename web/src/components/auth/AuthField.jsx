import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'

export function AuthField({ label, id, icon: Icon, action, ...props }) {
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    <div className="field-control">
      {Icon && <Icon size={18} className="field-icon" aria-hidden="true" />}
      <input id={id} className={Icon ? 'with-icon' : ''} {...props} />
      {action}
    </div>
  </div>
}

export function PasswordField({ label = 'Senha', id = 'password', ...props }) {
  const [visible, setVisible] = useState(false)
  return <AuthField
    label={label} id={id} icon={LockKeyhole} type={visible ? 'text' : 'password'}
    action={<button type="button" className="password-toggle" aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
    {...props}
  />
}
