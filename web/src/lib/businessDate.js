const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: import.meta.env.VITE_APP_TIME_ZONE || 'America/Fortaleza',
  year: 'numeric', month: '2-digit', day: '2-digit',
})

export function businessToday() {
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
