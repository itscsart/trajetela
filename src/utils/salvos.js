// Sistema único de salvos/favoritos do TrajetEla.
// Todos os itens (freela, vaga_clt, curso, evento, ebook) ficam na mesma chave.
const KEY = 'trajetela_salvos'

export function getSalvos() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function isSalvo(id) {
  return getSalvos().some((s) => s.id === id)
}

/**
 * Adiciona um item se ainda não existir (sem duplicar pelo id).
 * item: { id, tipo, titulo, subtitulo, valor, origem }
 * Retorna a lista atualizada.
 */
export function addSalvo(item) {
  const lista = getSalvos()
  if (lista.some((s) => s.id === item.id)) return lista
  const novo = [...lista, item]
  localStorage.setItem(KEY, JSON.stringify(novo))
  return novo
}

export function removeSalvo(id) {
  const novo = getSalvos().filter((s) => s.id !== id)
  localStorage.setItem(KEY, JSON.stringify(novo))
  return novo
}
