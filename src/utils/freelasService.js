import { supabase } from '../lib/supabase'

const CAMPOS = `
  id,
  titulo,
  contratante,
  categoria,
  descricao,
  atividades,
  requisitos,
  materiais_necessarios,
  observacoes,
  informacoes_adicionais,
  cidade,
  bairro,
  zona,
  endereco_referencia,
  latitude,
  longitude,
  data_servico,
  horario,
  duracao_estimada,
  quantidade_pessoas,
  tipo_valor,
  valor_min,
  valor_max,
  valor_exibir,
  forma_pagamento,
  whatsapp_contato,
  email_contato,
  contato_preferido,
  destaque,
  status,
  created_at,
  updated_at
`

// Lista freelas ATIVOS (nunca rascunho/encerrado). Destaque primeiro, depois mais recentes.
export async function getFreelasAtivos() {
  const { data, error } = await supabase
    .from('freelas')
    .select(CAMPOS)
    .eq('status', 'ativa')
    .order('destaque', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { data: [], error }
  return { data: data || [], error: null }
}

// Busca um freela por id — só retorna se estiver ativo (para a usuária comum).
export async function getFreelaPorId(id) {
  if (!id) return { data: null, error: new Error('ID não informado.') }

  const { data, error } = await supabase
    .from('freelas')
    .select(CAMPOS)
    .eq('id', id)
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: data || null, error: null }
}

// Freela em destaque (ativo). Se houver mais de um, usa o mais recente.
export async function getFreelaDestaque() {
  const { data, error } = await supabase
    .from('freelas')
    .select(CAMPOS)
    .eq('status', 'ativa')
    .eq('destaque', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: data || null, error: null }
}

// Conta freelas ativos (para subtítulo).
export async function contarFreelasAtivos() {
  const { count, error } = await supabase
    .from('freelas')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ativa')

  if (error) return { count: 0, error }
  return { count: count || 0, error: null }
}

// Assina mudanças em public.freelas (INSERT/UPDATE/DELETE) e retorna função de cleanup.
export function assinarFreelas(callback) {
  const canal = supabase
    .channel('freelas-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'freelas' }, (p) => callback(p))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'freelas' }, (p) => callback(p))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'freelas' }, (p) => callback(p))
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}

// ---- Formatação ----

// Valor fixo do freela = valor_min (total pago após a conclusão).
export function formatarValor(freela) {
  if (!freela) return ''
  if (freela.valor_exibir) return freela.valor_exibir
  if (freela.valor_min != null) {
    return `R$ ${Number(freela.valor_min).toLocaleString('pt-BR')}`
  }
  return ''
}

export function formatarData(valor) {
  if (!valor) return ''
  const d = new Date(`${valor}T00:00:00`)
  if (Number.isNaN(d.getTime())) {
    const d2 = new Date(valor)
    return Number.isNaN(d2.getTime()) ? '' : d2.toLocaleDateString('pt-BR')
  }
  return d.toLocaleDateString('pt-BR')
}

// ---- Busca e filtros (no cliente) ----

export function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function aplicarBusca(lista, termo) {
  const t = normalizarTexto(termo)
  if (!t) return lista
  return lista.filter((f) => {
    const alvo = [f.titulo, f.contratante, f.categoria, f.cidade, f.bairro]
      .map(normalizarTexto)
      .join(' ')
    return alvo.includes(t)
  })
}
