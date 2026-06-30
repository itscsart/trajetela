// Autenticação local simulada (MVP) — sem backend.
const KEY = 'trajetela_usuario'

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

export function getNome() {
  const u = getUsuario()
  return u && u.nome ? u.nome : ''
}

export function getPrimeiroNome() {
  const nome = getNome().trim()
  return nome ? nome.split(' ')[0] : ''
}

export function saudacao() {
  const primeiro = getPrimeiroNome()
  return primeiro ? `Olá, ${primeiro}!` : 'Olá!'
}

export function isAutenticada() {
  const u = getUsuario()
  return !!(u && u.logado === true && u.verificado === true)
}

export function setLogado(valor) {
  const u = getUsuario()
  if (u) localStorage.setItem(KEY, JSON.stringify({ ...u, logado: valor }))
}

export function atualizarUsuario(parciais) {
  const u = getUsuario() || {}
  const novo = { ...u, ...parciais }
  localStorage.setItem(KEY, JSON.stringify(novo))
  return novo
}
