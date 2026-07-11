import { supabase } from '../lib/supabase'

const CAMPOS = `
  id,
  titulo,
  empresa,
  descricao,
  requisitos,
  beneficios,
  cidade,
  bairro,
  zona,
  modalidade,
  tipo_vaga,
  area,
  escolaridade_minima,
  aceita_sem_experiencia,
  salario_min,
  salario_max,
  salario_exibir,
  horario,
  data_limite,
  whatsapp_contato,
  email_contato,
  contato_preferido,
  latitude,
  longitude,
  status,
  created_at
`

export async function getVagas() {
  const { data, error } = await supabase
    .from('vagas')
    .select(CAMPOS)
    .eq('status', 'ativa')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function contarNovasVagas() {
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

  const { count, error } = await supabase
    .from('vagas')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ativa')
    .gte('created_at', seteDiasAtras.toISOString())

  if (error) {
    return { count: 0, error }
  }

  return { count: count || 0, error: null }
}
