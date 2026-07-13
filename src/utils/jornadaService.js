import { supabase } from '../lib/supabase'
import { getUsuariaId, getFreelasConcluidos } from './freelasRealizadosService'

const CAMPOS = `
  id,
  usuaria_id,
  titulo,
  descricao,
  tipo,
  meta_total,
  progresso_atual,
  status,
  prazo,
  atualizacao_automatica,
  origem_contagem,
  created_at,
  updated_at,
  concluida_em
`

export const TIPOS_JORNADA = [
  { valor: 'freela', rotulo: 'Freela', automatico: true },
  { valor: 'curso', rotulo: 'Curso', automatico: false },
  { valor: 'candidatura', rotulo: 'Candidatura', automatico: false },
  { valor: 'emprego', rotulo: 'Emprego', automatico: false },
  { valor: 'curriculo', rotulo: 'Currículo', automatico: false },
  { valor: 'personalizada', rotulo: 'Personalizada', automatico: false },
]

// ---- Leitura ----

export async function getJornadaAtiva() {
  const usuariaId = await getUsuariaId()
  if (!usuariaId) return { data: null, error: new Error('Usuária não autenticada.') }

  const { data, error } = await supabase
    .from('jornadas')
    .select(CAMPOS)
    .eq('usuaria_id', usuariaId)
    .eq('status', 'ativa')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: data || null, error: null }
}

export async function listarHistoricoJornadas() {
  const usuariaId = await getUsuariaId()
  if (!usuariaId) return { data: [], error: new Error('Usuária não autenticada.') }

  const { data, error } = await supabase
    .from('jornadas')
    .select(CAMPOS)
    .eq('usuaria_id', usuariaId)
    .in('status', ['concluida', 'cancelada'])
    .order('concluida_em', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) return { data: [], error }
  return { data: data || [], error: null }
}

// ---- Escrita ----

export async function criarJornada(dados) {
  const usuariaId = await getUsuariaId()
  if (!usuariaId) return { data: null, error: new Error('Usuária não autenticada.') }

  // Impede duas metas ativas (também garantido por índice único no banco).
  const { data: ativa } = await getJornadaAtiva()
  if (ativa) return { data: null, error: new Error('Você já possui uma meta ativa.') }

  const metaTotal = Number(dados.meta_total)
  if (!dados.titulo || !dados.titulo.trim()) return { data: null, error: new Error('Informe um título para a meta.') }
  if (!Number.isFinite(metaTotal) || metaTotal < 1) return { data: null, error: new Error('A quantidade deve ser pelo menos 1.') }

  const registro = {
    usuaria_id: usuariaId,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao?.trim() || null,
    tipo: dados.tipo,
    meta_total: metaTotal,
    progresso_atual: 0,
    status: 'ativa',
    prazo: dados.prazo || null,
    atualizacao_automatica: !!dados.atualizacao_automatica,
    origem_contagem: dados.atualizacao_automatica && dados.tipo === 'freela' ? 'freelas_realizados' : null,
  }

  const { data, error } = await supabase.from('jornadas').insert(registro).select(CAMPOS).single()
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function atualizarJornada(id, dados) {
  const { data, error } = await supabase
    .from('jornadas')
    .update(dados)
    .eq('id', id)
    .select(CAMPOS)
    .single()
  if (error) return { data: null, error }
  return { data, error: null }
}

function limitar(valor, total) {
  const n = Number(valor) || 0
  if (n < 0) return 0
  if (n > total) return total
  return n
}

// Aplica um novo progresso e conclui automaticamente ao atingir a meta.
async function aplicarProgresso(jornada, novoValor) {
  const total = jornada.meta_total
  const progresso = limitar(novoValor, total)

  if (progresso >= total) {
    const { data, error } = await supabase
      .from('jornadas')
      .update({ progresso_atual: total, status: 'concluida', concluida_em: new Date().toISOString() })
      .eq('id', jornada.id)
      .select(CAMPOS)
      .single()
    return { data, error, concluiu: !error }
  }

  const { data, error } = await supabase
    .from('jornadas')
    .update({ progresso_atual: progresso })
    .eq('id', jornada.id)
    .select(CAMPOS)
    .single()
  return { data, error, concluiu: false }
}

export async function incrementarProgresso(id, quantidade = 1) {
  const { data: jornada, error } = await supabase.from('jornadas').select(CAMPOS).eq('id', id).single()
  if (error) return { data: null, error }
  return aplicarProgresso(jornada, (jornada.progresso_atual || 0) + Number(quantidade || 1))
}

export async function definirProgresso(id, valor) {
  const { data: jornada, error } = await supabase.from('jornadas').select(CAMPOS).eq('id', id).single()
  if (error) return { data: null, error }
  return aplicarProgresso(jornada, valor)
}

export async function concluirJornada(id) {
  const { data: jornada, error } = await supabase.from('jornadas').select(CAMPOS).eq('id', id).single()
  if (error) return { data: null, error }
  const { data, error: err } = await supabase
    .from('jornadas')
    .update({ progresso_atual: jornada.meta_total, status: 'concluida', concluida_em: new Date().toISOString() })
    .eq('id', id)
    .select(CAMPOS)
    .single()
  if (err) return { data: null, error: err }
  return { data, error: null }
}

export async function cancelarJornada(id) {
  const { data, error } = await supabase
    .from('jornadas')
    .update({ status: 'cancelada' })
    .eq('id', id)
    .select(CAMPOS)
    .single()
  if (error) return { data: null, error }
  return { data, error: null }
}

/**
 * Sincroniza o progresso de uma meta de freela automática com os freelas
 * concluídos da usuária. Só escreve no banco se o valor mudou (evita loop
 * com o Realtime). Retorna a jornada possivelmente atualizada.
 */
export async function sincronizarProgressoFreela(jornada) {
  if (!jornada || jornada.tipo !== 'freela' || !jornada.atualizacao_automatica || jornada.status !== 'ativa') {
    return { data: jornada, error: null, mudou: false }
  }

  const { data: concluidos, error } = await getFreelasConcluidos()
  if (error) return { data: jornada, error, mudou: false }

  const total = jornada.meta_total
  const contagem = limitar((concluidos || []).length, total)

  // Nada mudou → não escreve (previne ping-pong de realtime).
  if (contagem === jornada.progresso_atual && !(contagem >= total && jornada.status === 'ativa')) {
    return { data: jornada, error: null, mudou: false }
  }
  if (contagem === jornada.progresso_atual && contagem < total) {
    return { data: jornada, error: null, mudou: false }
  }

  const res = await aplicarProgresso(jornada, contagem)
  return { data: res.data || jornada, error: res.error, mudou: !res.error }
}

// ---- Realtime ----

export function assinarJornadas(usuariaId, callback) {
  if (!usuariaId) return () => {}
  const canal = supabase
    .channel('jornadas-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'jornadas', filter: `usuaria_id=eq.${usuariaId}` },
      (p) => callback(p),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(canal)
  }
}

// ---- Cálculos ----

export function calcularPercentual(jornada) {
  if (!jornada || !jornada.meta_total) return 0
  const pct = Math.round((jornada.progresso_atual / jornada.meta_total) * 100)
  return Math.max(0, Math.min(100, pct))
}

export function calcularProximaEtapa(jornada) {
  if (!jornada) return ''
  const restante = jornada.meta_total - jornada.progresso_atual
  if (restante <= 0) return 'Meta concluída!'
  if (jornada.meta_total === 1) return 'Marcar como concluído'
  if (jornada.progresso_atual === 0) {
    if (jornada.tipo === 'freela') return 'Concluir o primeiro freela'
    if (jornada.tipo === 'curso') return 'Concluir o primeiro curso'
    return 'Concluir o primeiro item'
  }
  const unidade = jornada.tipo === 'freela' ? 'freela(s)' : jornada.tipo === 'curso' ? 'curso(s)' : 'item(ns)'
  return `Concluir mais ${restante} ${unidade}`
}
