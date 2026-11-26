export function apiErrorMessage(error) {
  const response = error.response?.data
  return response?.erros?.[0]?.mensagem || response?.mensagem || 'Não foi possível conectar. Confira sua conexão e tente novamente.'
}
