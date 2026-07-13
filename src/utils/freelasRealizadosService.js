import { supabase } from '../lib/supabase'

// ---- Usuária autenticada ----
async function usuariaAtual() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user: user || null, error: error || null }
}

// Freelas concluídos da usuária autenticada (para saldo).
export async function getFreelasConcluidos() {
  const { user, error: userErr } = await usuariaAtual()
  if (userErr || !user) return { data: [], error: userErr }

  const { data, error } = await supabase
    .from('freelas_realizados')
    .select(
      `id, valor_confirmado, status, data_conclusao, created_at,
       freela:freela_id ( id, titulo, contratante )`,
    )
    .eq('usuaria_id', user.id)
    .eq('status', 'concluido')
    .order('data_conclusao', { ascending: false })

  if (error) return { data: [], error }
  return { data: data || [], error: null }
}

// Avaliações recebidas pela usuária autenticada (para reputação).
export async function getAvaliacoes() {
  const { user, error: userErr } = await usuariaAtual()
  if (userErr || !user) return { data: [], error: userErr }

  const { data, error } = await supabase
    .from('avaliacoes_freelas')
    .select('id, contratante_nome, nota, comentario, created_at, freela:freela_id ( titulo )')
    .eq('usuaria_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error }
  return { data: data || [], error: null }
}

// Realtime dos registros da própria usuária (freelas_realizados + avaliacoes_freelas).
export function assinarRegistrosUsuaria(usuariaId, callback) {
  if (!usuariaId) return () => {}
  const canal = supabase
    .channel('freelas-usuaria-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'freelas_realizados', filter: `usuaria_id=eq.${usuariaId}` },
      (p) => callback(p),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'avaliacoes_freelas', filter: `usuaria_id=eq.${usuariaId}` },
      (p) => callback(p),
    )
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}

export async function getUsuariaId() {
  const { user } = await usuariaAtual()
  return user ? user.id : null
}

// Soma o total do mês atual entre os concluídos.
export function totalDoMes(registros) {
  const agora = new Date()
  return registros.reduce((soma, r) => {
    const base = r.data_conclusao || r.created_at
    if (!base) return soma
    const d = new Date(base)
    if (Number.isNaN(d.getTime())) return soma
    if (d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()) {
      return soma + (Number(r.valor_confirmado) || 0)
    }
    return soma
  }, 0)
}

export function formatarReais(valor) {
  return `R$ ${Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
}

// Média das notas (escala 0–10). Retorna null quando não há avaliações.
export function mediaReputacao(avaliacoes) {
  if (!avaliacoes || avaliacoes.length === 0) return null
  const soma = avaliacoes.reduce((s, a) => s + (Number(a.nota) || 0), 0)
  return Math.round((soma / avaliacoes.length) * 10) / 10
}
