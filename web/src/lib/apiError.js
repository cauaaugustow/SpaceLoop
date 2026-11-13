export function apiErrorMessage(error) {
  const response = error.response?.data
  return response?.errors?.[0]?.message || response?.message || 'Não foi possível conectar. Confira sua conexão e tente novamente.'
}
