import { useCallback, useEffect, useState } from 'react'
import api from '../services/api.js'
import { apiErrorMessage } from '../lib/apiError.js'
import { businessToday } from '../lib/businessDate.js'
import './AdminPage.css'

const emptyForms = {
  usuarios: { nome: '', email: '', cpf: '', telefone: '', senha: '' },
  salas: { nome: '', capacidade: '', descricao: '', precoLocacao: '' },
  reservas: { idUsuario: '', idSala: '', dia: '', turno: '' },
}

const sections = [
  { key: 'usuarios', title: 'Usuários', singular: 'usuário', path: '/usuarios' },
  { key: 'salas', title: 'Salas', singular: 'sala', path: '/salas' },
  { key: 'reservas', title: 'Reservas', singular: 'reserva', path: '/reservas' },
]

function dateLabel(value) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function itemDetails(section, item, data) {
  if (section === 'usuarios') {
    return `${item.email} · CPF ${item.cpf}${item.eadmin ? ' · Administrador' : ''}`
  }
  if (section === 'salas') {
    return `${item.capacidade} pessoas · ${Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}${item.descricao ? ` · ${item.descricao}` : ''}`
  }
  const usuario = data.usuarios.find((value) => value.id === item.idUsuario)
  const sala = data.salas.find((value) => value.id === item.idSala)
  return `${usuario?.nome || `Usuário #${item.idUsuario}`} · ${sala?.nome || `Sala #${item.idSala}`} · ${dateLabel(item.dia)} · ${item.turno}`
}

function formForItem(section, item) {
  if (section === 'usuarios') {
    return { nome: item.nome, email: item.email, cpf: item.cpf, telefone: item.telefone || '', senha: '' }
  }
  if (section === 'salas') {
    return { nome: item.nome, capacidade: String(item.capacidade), descricao: item.descricao || '', precoLocacao: String(item.preco) }
  }
  return { idUsuario: String(item.idUsuario), idSala: String(item.idSala), dia: item.dia.slice(0, 10), turno: item.turno }
}

async function fetchAdminData() {
  const [usuarios, salas, reservas] = await Promise.all([
    api.get('/usuarios'), api.get('/salas'), api.get('/reservas'),
  ])
  return { usuarios: usuarios.data, salas: salas.data, reservas: reservas.data }
}

export default function AdminPage({ user, onLogout }) {
  const [section, setSection] = useState('usuarios')
  const [data, setData] = useState({ usuarios: [], salas: [], reservas: [] })
  const [form, setForm] = useState({ ...emptyForms.usuarios })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
    try {
      setData(await fetchAdminData())
      setError('')
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchAdminData()
      .then((result) => {
        if (active) {
          setData(result)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(apiErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const current = sections.find((item) => item.key === section)

  function chooseSection(key) {
    setSection(key)
    setForm({ ...emptyForms[key] })
    setEditingId(null)
    setShowForm(false)
    setError('')
    setNotice('')
  }

  function openForm(item) {
    setForm(item ? formForItem(section, item) : { ...emptyForms[section] })
    setEditingId(item?.id ?? null)
    setShowForm(true)
    setError('')
    setNotice('')
  }

  function field(name, label, options = {}) {
    const { type = 'text', required = true, choices, min, minLength, step } = options
    const id = `admin-${section}-${name}`
    const common = {
      id, name, value: form[name], required, disabled: busy,
      onChange: (event) => setForm((currentForm) => ({ ...currentForm, [name]: event.target.value })),
    }
    return <label className="admin-field" key={name} htmlFor={id}>
      <span>{label}</span>
      {choices
        ? <select {...common}>
          <option value="">Selecione</option>
          {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
        </select>
        : <input {...common} type={type} min={min} minLength={minLength} step={step} />}
    </label>
  }

  function fields() {
    if (section === 'usuarios') return <>
      {field('nome', 'Nome completo')}
      {field('email', 'E-mail', { type: 'email' })}
      {field('cpf', 'CPF')}
      {field('telefone', 'Telefone', { required: false })}
      {editingId === null && field('senha', 'Senha', { type: 'password', minLength: 8 })}
    </>
    if (section === 'salas') return <>
      {field('nome', 'Nome da sala')}
      {field('capacidade', 'Capacidade', { type: 'number', min: 1 })}
      {field('precoLocacao', 'Preço da locação', { type: 'number', min: 0, step: '0.01' })}
      {field('descricao', 'Descrição', { required: false })}
    </>
    return <>
      {editingId === null && field('idUsuario', 'Usuário', { choices: data.usuarios.map((item) => ({ value: item.id, label: `${item.nome} (${item.email})` })) })}
      {field('idSala', 'Sala', { choices: data.salas.map((item) => ({ value: item.id, label: item.nome })) })}
      {field('dia', 'Dia', { type: 'date', min: businessToday() })}
      {field('turno', 'Turno', { choices: [
        { value: 'MANHA', label: 'Manhã' },
        { value: 'TARDE', label: 'Tarde' },
        { value: 'NOITE', label: 'Noite' },
      ] })}
    </>
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      let payload
      if (section === 'usuarios') {
        payload = { nome: form.nome.trim(), email: form.email.trim(), cpf: form.cpf.trim(), telefone: form.telefone.trim() }
        if (editingId === null) payload.senha = form.senha
      } else if (section === 'salas') {
        payload = { nome: form.nome.trim(), capacidade: Number(form.capacidade), precoLocacao: Number(form.precoLocacao), descricao: form.descricao.trim() }
      } else {
        payload = { idSala: Number(form.idSala), dia: form.dia, turno: form.turno }
        if (editingId === null) payload.idUsuario = Number(form.idUsuario)
      }

      if (editingId === null) {
        await api.post(section === 'usuarios' ? '/usuario' : current.path, payload)
      } else {
        await api.patch(`${current.path}/${editingId}`, payload)
      }
      setNotice(`${current.singular[0].toUpperCase()}${current.singular.slice(1)} ${editingId === null ? 'criado(a)' : 'atualizado(a)'} com sucesso.`)
      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyForms[section] })
      await loadData()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function remove(item) {
    const consequence = section === 'usuarios' || section === 'salas' ? ' As reservas vinculadas também serão excluídas.' : ''
    if (!window.confirm(`Excluir ${current.singular} #${item.id}?${consequence}`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.delete(`${current.path}/${item.id}`)
      if (section === 'usuarios' && item.id === user.id) {
        onLogout()
        return
      }
      setNotice(`${current.singular[0].toUpperCase()}${current.singular.slice(1)} excluído(a) com sucesso.`)
      await loadData()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return <main className="admin-page">
    <div className="admin-shell">
      <header className="admin-header">
        <div><span className="admin-kicker">SPACELOOP · ADMINISTRAÇÃO</span><h1>Painel de gestão</h1><p>Olá, {user.nome}. Gerencie usuários, salas e reservas.</p></div>
        <button type="button" className="admin-logout" onClick={onLogout}>Sair da conta</button>
      </header>

      <nav className="admin-nav" aria-label="Áreas de gestão">
        {sections.map((item) => <button key={item.key} type="button" className={section === item.key ? 'active' : ''} onClick={() => chooseSection(item.key)}>{item.title}<span>{data[item.key].length}</span></button>)}
      </nav>

      <section className="admin-content">
        <div className="admin-section-heading"><div><h2>{current.title}</h2><p>{data[section].length} registro(s)</p></div><button type="button" className="admin-primary" onClick={() => openForm(null)}>Adicionar {current.singular}</button></div>
        {error && <p className="admin-alert error-message" role="alert">{error}</p>}
        {notice && <p className="admin-alert success-message" role="status">{notice}</p>}

        {showForm && <form className="admin-form" onSubmit={save}>
          <div className="admin-form-heading"><h3>{editingId === null ? 'Adicionar' : 'Editar'} {current.singular}</h3><button type="button" onClick={() => setShowForm(false)}>Fechar</button></div>
          <div className="admin-form-grid">{fields()}</div>
          <button className="admin-primary" type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar'}</button>
        </form>}

        {loading ? <p className="admin-empty">Carregando dados...</p> : data[section].length === 0 ? <p className="admin-empty">Nenhum registro encontrado.</p> : <div className="admin-list">
          {data[section].map((item) => <article className="admin-list-item" key={item.id}>
            <div><strong>{section === 'usuarios' || section === 'salas' ? item.nome : `Reserva #${item.id}`}</strong><p>{itemDetails(section, item, data)}</p></div>
            <div className="admin-actions"><button type="button" disabled={busy} onClick={() => openForm(item)}>Editar</button><button type="button" disabled={busy} onClick={() => remove(item)}>Excluir</button></div>
          </article>)}
        </div>}
      </section>
    </div>
  </main>
}
