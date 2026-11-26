import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Compass,
  DoorOpen, LogOut, Search, Sparkles, UserRound, UsersRound, Wallet,
} from 'lucide-react'
import Brand from '../components/auth/Brand.jsx'
import { apiErrorMessage } from '../lib/apiError.js'
import { businessToday } from '../lib/businessDate.js'
import api from '../services/api.js'
import './AccountPage.css'

const navigation = [
  { key: 'inicio', label: 'Início', icon: Compass },
  { key: 'salas', label: 'Salas', icon: DoorOpen },
  { key: 'reservas', label: 'Minhas reservas', icon: CalendarDays },
  { key: 'perfil', label: 'Perfil', icon: UserRound },
]

const turnos = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
]

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateLabel = (value) => {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}
const turnoLabel = (value) => turnos.find((item) => item.value === value?.toUpperCase())?.label || value

function RoomCard({ room, onBook, busy }) {
  return <article className="account-room-card">
    <div className="account-room-visual" aria-hidden="true">
      <div className="account-room-orbit orbit-one" />
      <div className="account-room-orbit orbit-two" />
      <DoorOpen size={35} strokeWidth={1.4} />
    </div>
    <div className="account-room-body">
      <div className="account-room-topline"><span className="account-available"><span /> Disponível</span><span className="account-room-id">SALA {String(room.id).padStart(2, '0')}</span></div>
      <h3>{room.nome}</h3>
      <p className="account-room-description">{room.descricao || 'Um espaço para transformar seus planos em encontros.'}</p>
      <div className="account-room-meta"><span><UsersRound size={16} /> Até {room.capacidade} {room.capacidade === 1 ? 'pessoa' : 'pessoas'}</span><span><Wallet size={16} /> {money.format(room.preco)} / turno</span></div>
      <button type="button" className="account-room-button" onClick={() => onBook(room)} disabled={busy}>Reservar sala <ArrowRight size={17} /></button>
    </div>
  </article>
}

export default function AccountPage({ user, onLogout }) {
  const [section, setSection] = useState('inicio')
  const [dia, setDia] = useState(businessToday)
  const [turno, setTurno] = useState('MANHA')
  const [search, setSearch] = useState('')
  const [rooms, setRooms] = useState([])
  const [allRooms, setAllRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [profile, setProfile] = useState(user)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [reservationsLoading, setReservationsLoading] = useState(true)
  const [roomsError, setRoomsError] = useState('')
  const [reservationsError, setReservationsError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [busy, setBusy] = useState(false)
  const [roomsReloadKey, setRoomsReloadKey] = useState(0)

  const loadReservations = useCallback(async () => {
    try {
      const { data } = await api.get('/reservas')
      setReservations(data)
      setReservationsError('')
    } catch (error) {
      setReservationsError(apiErrorMessage(error))
    } finally {
      setReservationsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!dia) {
      return () => { active = false }
    }
    api.get('/salas', { params: { disponivel: true, dia, turno } })
      .then(({ data }) => {
        if (active) { setRooms(data); setRoomsError('') }
      })
      .catch((error) => { if (active) setRoomsError(apiErrorMessage(error)) })
      .finally(() => { if (active) setRoomsLoading(false) })
    return () => { active = false }
  }, [dia, turno, roomsReloadKey])

  useEffect(() => {
    let active = true
    api.get('/reservas')
      .then(({ data }) => { if (active) { setReservations(data); setReservationsError('') } })
      .catch((error) => { if (active) setReservationsError(apiErrorMessage(error)) })
      .finally(() => { if (active) setReservationsLoading(false) })
    api.get('/salas')
      .then(({ data }) => { if (active) setAllRooms(data) })
      .catch(() => {})
    api.get(`/usuarios/${user.id}`)
      .then(({ data }) => { if (active) setProfile(data) })
      .catch((error) => { if (active) setProfileError(apiErrorMessage(error)) })
    return () => { active = false }
  }, [user.id])

  const filteredRooms = useMemo(() => rooms.filter((room) =>
    `${room.nome} ${room.descricao || ''}`.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')),
  ), [rooms, search])
  const sortedReservations = useMemo(() => [...reservations].sort((a, b) =>
    a.dia.localeCompare(b.dia) || a.turno.localeCompare(b.turno),
  ), [reservations])
  const upcomingReservations = sortedReservations.filter((item) => item.dia.slice(0, 10) >= businessToday())
  const firstName = (profile.nome || user.nome || 'você').trim().split(' ')[0]

  function navigate(key) {
    setSection(key)
    setSelectedRoom(null)
    setActionError('')
    setNotice('')
  }

  async function refreshBookings() {
    const [availableResult, bookedResult] = await Promise.allSettled([
      api.get('/salas', { params: { disponivel: true, dia, turno } }),
      api.get('/reservas'),
    ])
    if (availableResult.status === 'fulfilled') {
      setRooms(availableResult.value.data)
      setAllRooms((current) => current.length ? current : availableResult.value.data)
      setRoomsError('')
    } else setRoomsError(apiErrorMessage(availableResult.reason))
    if (bookedResult.status === 'fulfilled') {
      setReservations(bookedResult.value.data)
      setReservationsError('')
    } else setReservationsError(apiErrorMessage(bookedResult.reason))
  }

  async function confirmBooking() {
    if (!selectedRoom) return
    setBusy(true)
    setActionError('')
    try {
      await api.post('/reservas', { idSala: selectedRoom.id, dia, turno })
      setNotice(`Reserva da ${selectedRoom.nome} confirmada para ${dateLabel(dia)}, ${turnoLabel(turno).toLowerCase()}.`)
      setSelectedRoom(null)
      await refreshBookings()
    } catch (error) {
      setActionError(apiErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function cancelBooking(reservation) {
    if (!window.confirm(`Cancelar a reserva de ${dateLabel(reservation.dia)}?`)) return
    setBusy(true)
    setActionError('')
    try {
      await api.delete(`/reservas/${reservation.id}`)
      setNotice('Reserva cancelada com sucesso.')
      await refreshBookings()
    } catch (error) {
      setActionError(apiErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const showRooms = section === 'inicio' || section === 'salas'
  const roomName = (id) => allRooms.find((room) => room.id === id)?.nome || `Sala #${id}`

  return <div className="account-page">
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-sidebar-brand"><Brand /><span>SEU ESPAÇO, SEU MOMENTO</span></div>
        <div className="account-menu-caption">MENU PRINCIPAL</div>
        <nav className="account-nav" aria-label="Navegação da conta">
          {navigation.map(({ key, label, icon: Icon }) => <button key={key} type="button" className={section === key ? 'active' : ''} aria-current={section === key ? 'page' : undefined} onClick={() => navigate(key)}><Icon size={19} strokeWidth={1.9} /><span>{label}</span>{key === 'reservas' && reservations.length > 0 && <small>{reservations.length}</small>}</button>)}
        </nav>
        <div className="account-sidebar-bottom"><div className="account-help"><Sparkles size={20} /><strong>Encontre seu próximo espaço</strong><p>Escolha a data, o turno e reserve em poucos cliques.</p><button type="button" onClick={() => navigate('salas')}>Explorar salas <ArrowRight size={15} /></button></div><button type="button" className="account-logout" onClick={onLogout}><LogOut size={18} /> Sair da conta</button></div>
      </aside>

      <main className="account-main">
        <header className="account-topbar"><div className="account-topbar-brand"><Brand /></div><span>ÁREA DO USUÁRIO <ChevronRight size={13} /> {navigation.find((item) => item.key === section)?.label.toUpperCase()}</span><div className="account-topbar-actions"><button type="button" className="account-mobile-logout" aria-label="Sair da conta" title="Sair da conta" onClick={onLogout}><LogOut size={18} /></button><button type="button" className="account-avatar" title="Ver perfil" aria-label="Ver perfil" onClick={() => navigate('perfil')}>{firstName.charAt(0).toUpperCase()}</button></div></header>

        <div className="account-content">
          {notice && <p className="account-message success" role="status"><Check size={17} />{notice}</p>}
          {actionError && <p className="account-message error" role="alert">{actionError}</p>}

          {section === 'inicio' && <>
            <section className="account-hero"><div className="account-hero-copy"><span className="account-eyebrow">BEM-VINDO DE VOLTA</span><h1>Olá, {firstName}! <span>Seu próximo espaço começa aqui.</span></h1><p>Encontre a sala certa para suas ideias, encontros e novos projetos.</p><button type="button" onClick={() => navigate('salas')}>Explorar salas <ArrowRight size={18} /></button></div><div className="account-hero-art" aria-hidden="true"><div className="account-hero-ring ring-one" /><div className="account-hero-ring ring-two" /><div className="account-hero-icon"><DoorOpen size={51} strokeWidth={1.3} /></div><span className="account-hero-star star-one">✦</span><span className="account-hero-star star-two">✦</span></div></section>
            <div className="account-stats"><div><span className="account-stat-icon purple"><DoorOpen size={19} /></span><p>Salas disponíveis</p><strong>{roomsLoading || roomsError ? '—' : rooms.length}</strong><small>para {dateLabel(dia)}, {turnoLabel(turno).toLowerCase()}</small></div><div><span className="account-stat-icon mint"><CalendarDays size={19} /></span><p>Próximas reservas</p><strong>{reservationsLoading || reservationsError ? '—' : upcomingReservations.length}</strong><small>na sua agenda</small></div></div>
          </>}

          {showRooms && <section className="account-rooms-section" aria-labelledby="rooms-heading">
            <div className="account-section-title"><div><span className="account-eyebrow">ENCONTRE SEU LUGAR</span><h2 id="rooms-heading">{section === 'inicio' ? 'Salas disponíveis' : 'Explore nossas salas'}</h2><p>Escolha quando deseja usar o espaço e veja as salas livres.</p></div>{section === 'inicio' && <button type="button" className="account-inline-link" onClick={() => navigate('salas')}>Ver todas <ArrowRight size={16} /></button>}</div>
            <div className="account-filters"><label><span>Data da reserva</span><div className="account-input-wrap"><CalendarDays size={18} /><input type="date" value={dia} min={businessToday()} onChange={(event) => { setDia(event.target.value); setRooms([]); setRoomsLoading(true); setRoomsError(''); setSelectedRoom(null) }} /></div></label><label><span>Turno</span><div className="account-input-wrap"><Clock3 size={18} /><select value={turno} onChange={(event) => { setTurno(event.target.value); setRoomsLoading(true); setRoomsError(''); setSelectedRoom(null) }}>{turnos.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div></label><label className="account-search"><span>Buscar sala</span><div className="account-input-wrap"><Search size={18} /><input type="search" placeholder="Nome ou descrição" value={search} onChange={(event) => setSearch(event.target.value)} /></div></label></div>
            {selectedRoom && <div className="account-booking-confirm"><div><span className="account-eyebrow">CONFIRME SUA RESERVA</span><strong>{selectedRoom.nome}</strong><p>{dateLabel(dia)} · {turnoLabel(turno)} · {money.format(selectedRoom.preco)}</p></div><div><button type="button" className="account-secondary-button" onClick={() => setSelectedRoom(null)} disabled={busy}>Voltar</button><button type="button" className="account-primary-button" onClick={confirmBooking} disabled={busy}>{busy ? 'Reservando...' : 'Confirmar reserva'}</button></div></div>}
            {roomsError && <div className="account-empty error" role="alert"><strong>Não foi possível carregar as salas.</strong><p>{roomsError}</p><button type="button" className="account-secondary-button" onClick={() => { setRoomsLoading(true); setRoomsError(''); setRoomsReloadKey((value) => value + 1) }}>Tentar novamente</button></div>}
            {!dia && <div className="account-empty">Selecione uma data para ver as salas disponíveis.</div>}
            {dia && !roomsError && roomsLoading && <div className="account-empty">Buscando salas disponíveis...</div>}
            {dia && !roomsError && !roomsLoading && filteredRooms.length === 0 && <div className="account-empty"><DoorOpen size={25} /><strong>Nenhuma sala encontrada</strong><p>{search ? 'Tente buscar por outro nome.' : 'Não há salas livres nessa data e turno. Tente outra opção.'}</p></div>}
            {dia && !roomsError && !roomsLoading && filteredRooms.length > 0 && <div className="account-room-grid">{(section === 'inicio' ? filteredRooms.slice(0, 3) : filteredRooms).map((room) => <RoomCard key={room.id} room={room} onBook={setSelectedRoom} busy={busy} />)}</div>}
          </section>}

          {section === 'reservas' && <section className="account-detail-section"><div className="account-section-title"><div><span className="account-eyebrow">SUA AGENDA</span><h1>Minhas reservas</h1><p>Confira os espaços e horários que você reservou.</p></div><button type="button" className="account-primary-button" onClick={() => navigate('salas')}>Nova reserva <ArrowRight size={17} /></button></div>{reservationsError && <div className="account-empty error" role="alert">{reservationsError}<button type="button" className="account-secondary-button" onClick={() => { setReservationsLoading(true); loadReservations() }}>Tentar novamente</button></div>}{reservationsLoading ? <div className="account-empty">Carregando reservas...</div> : !reservationsError && sortedReservations.length === 0 ? <div className="account-empty"><CalendarDays size={27} /><strong>Você ainda não tem reservas</strong><p>Explore as salas e encontre o espaço ideal para você.</p><button type="button" className="account-primary-button" onClick={() => navigate('salas')}>Explorar salas</button></div> : !reservationsError && <div className="account-reservation-list">{sortedReservations.map((reservation) => <article key={reservation.id} className="account-reservation"><span className="account-reservation-icon"><CalendarDays size={22} /></span><div><span className="account-reservation-tag">RESERVA #{String(reservation.id).padStart(3, '0')}</span><h2>{roomName(reservation.idSala)}</h2><p><CalendarDays size={15} /> {dateLabel(reservation.dia)} <Clock3 size={15} /> {turnoLabel(reservation.turno)}</p></div><button type="button" onClick={() => cancelBooking(reservation)} disabled={busy} className="account-cancel-button">Cancelar reserva</button></article>)}</div>}</section>}

          {section === 'perfil' && <section className="account-detail-section"><div className="account-section-title"><div><span className="account-eyebrow">SUA CONTA</span><h1>Meu perfil</h1><p>Seus dados cadastrados no SpaceLoop.</p></div></div>{profileError && <p className="account-message error" role="alert">{profileError}</p>}<div className="account-profile-card"><div className="account-profile-heading"><span className="account-profile-avatar">{firstName.charAt(0).toUpperCase()}</span><div><h2>{profile.nome}</h2><p>Membro SpaceLoop</p></div></div><div className="account-profile-grid"><div><span>Nome completo</span><strong>{profile.nome || '—'}</strong></div><div><span>E-mail</span><strong>{profile.email || '—'}</strong></div><div><span>Telefone</span><strong>{profile.telefone || 'Não informado'}</strong></div><div><span>CPF</span><strong>{profile.cpf || '—'}</strong></div></div></div></section>}
        </div>
      </main>
    </div>
  </div>
}
