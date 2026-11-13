export function cpfMask(value) {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function phoneMask(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length < 3) return digits
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  const split = digits.length === 11 ? 7 : 6
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`
}
