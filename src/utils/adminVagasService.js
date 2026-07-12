import { supabase } from '../lib/supabase'

const CAMPOS_ADMIN = `
  id,
  titulo,
  empresa,
  descricao,
  atividades,
  requisitos,
  beneficios,
  observacoes_empresa,
  informacoes_adicionais,
  forma_candidatura,
  cidade,
  bairro,
  zona,
  endereco_referencia,
  latitude,
  longitude,
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
  status,
  created_at,
  updated_at
`

export async function verificarAdmin() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      isAdmin: false,
      user: null,
      profile: null,
      error: userError || new Error('Usuária não autenticada.'),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return {
      isAdmin: false,
      user,
      profile: null,
      error,
    }
  }

  return {
    isAdmin: data?.role === 'admin',
    user,
    profile: data || null,
    error: null,
  }
}

export async function listarTodasVagas({
  busca = '',
  status = '',
  area = '',
  modalidade = '',
  cidade = '',
} = {}) {
  let query = supabase
    .from('vagas')
    .select(CAMPOS_ADMIN)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (area) {
    query = query.eq('area', area)
  }

  if (modalidade) {
    query = query.eq('modalidade', modalidade)
  }

  if (cidade) {
    query = query.eq('cidade', cidade)
  }

  if (busca.trim()) {
    const termo = busca.trim().replace(/[%(),]/g, ' ')

    query = query.or(
      `titulo.ilike.%${termo}%,empresa.ilike.%${termo}%,area.ilike.%${termo}%,cidade.ilike.%${termo}%`,
    )
  }

  const { data, error } = await query

  return {
    data: data || [],
    error: error || null,
  }
}

export async function buscarVagaAdminPorId(id) {
  if (!id) {
    return {
      data: null,
      error: new Error('ID da vaga não informado.'),
    }
  }

  const { data, error } = await supabase
    .from('vagas')
    .select(CAMPOS_ADMIN)
    .eq('id', id)
    .maybeSingle()

  return {
    data: data || null,
    error: error || null,
  }
}

function limparTexto(valor) {
  if (valor == null) {
    return null
  }

  const texto = String(valor).trim()

  return texto === '' ? null : texto
}

function limparNumero(valor) {
  if (valor === '' || valor == null) {
    return null
  }

  const numero = Number(valor)

  return Number.isFinite(numero) ? numero : null
}

function normalizarTelefone(valor) {
  const telefone = String(valor || '').replace(/\D/g, '')

  return telefone || null
}

export function prepararDadosVaga(dados) {
  return {
    titulo: limparTexto(dados.titulo),
    empresa: limparTexto(dados.empresa),

    descricao: limparTexto(dados.descricao),
    atividades: limparTexto(dados.atividades),
    requisitos: limparTexto(dados.requisitos),
    beneficios: limparTexto(dados.beneficios),
    observacoes_empresa: limparTexto(dados.observacoes_empresa),
    informacoes_adicionais: limparTexto(dados.informacoes_adicionais),
    forma_candidatura: limparTexto(dados.forma_candidatura),

    cidade: limparTexto(dados.cidade),
    bairro: limparTexto(dados.bairro),
    zona: limparTexto(dados.zona),
    endereco_referencia: limparTexto(dados.endereco_referencia),

    latitude: limparNumero(dados.latitude),
    longitude: limparNumero(dados.longitude),

    modalidade: limparTexto(dados.modalidade),
    tipo_vaga: limparTexto(dados.tipo_vaga),
    area: limparTexto(dados.area),

    escolaridade_minima: limparTexto(dados.escolaridade_minima),
    aceita_sem_experiencia: Boolean(dados.aceita_sem_experiencia),

    salario_min: limparNumero(dados.salario_min),
    salario_max: limparNumero(dados.salario_max),
    salario_exibir: limparTexto(dados.salario_exibir),

    horario: limparTexto(dados.horario),
    data_limite: limparTexto(dados.data_limite),

    whatsapp_contato: normalizarTelefone(dados.whatsapp_contato),
    email_contato:
      limparTexto(dados.email_contato)?.toLowerCase() || null,

    contato_preferido: limparTexto(dados.contato_preferido),

    status: limparTexto(dados.status) || 'rascunho',
    updated_at: new Date().toISOString(),
  }
}

export function validarDadosVaga(dados) {
  const erros = {}

  if (!dados.titulo?.trim()) {
    erros.titulo = 'Informe o título da vaga.'
  }

  if (!dados.empresa?.trim()) {
    erros.empresa = 'Informe a empresa.'
  }

  if (!dados.cidade?.trim()) {
    erros.cidade = 'Informe a cidade.'
  }

  if (!dados.modalidade?.trim()) {
    erros.modalidade = 'Selecione a modalidade.'
  }

  if (!dados.tipo_vaga?.trim()) {
    erros.tipo_vaga = 'Selecione o tipo da vaga.'
  }

  if (!dados.area?.trim()) {
    erros.area = 'Selecione a área.'
  }

  if (!dados.status?.trim()) {
    erros.status = 'Selecione o status.'
  }

  const minimo = limparNumero(dados.salario_min)
  const maximo = limparNumero(dados.salario_max)

  if (
    minimo != null &&
    maximo != null &&
    minimo > maximo
  ) {
    erros.salario_max =
      'O salário máximo não pode ser menor que o salário mínimo.'
  }

  const latitude = limparNumero(dados.latitude)

  if (
    latitude != null &&
    (latitude < -90 || latitude > 90)
  ) {
    erros.latitude =
      'A latitude deve estar entre -90 e 90.'
  }

  const longitude = limparNumero(dados.longitude)

  if (
    longitude != null &&
    (longitude < -180 || longitude > 180)
  ) {
    erros.longitude =
      'A longitude deve estar entre -180 e 180.'
  }

  const email = dados.email_contato?.trim()

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    erros.email_contato =
      'Informe um e-mail válido.'
  }

  if (dados.data_limite) {
    const limite = new Date(
      `${dados.data_limite}T23:59:59`,
    )

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (
      Number.isNaN(limite.getTime()) ||
      limite < hoje
    ) {
      erros.data_limite =
        'A data limite não pode ser anterior à data atual.'
    }
  }

  const preferido = dados.contato_preferido
  const whatsapp = normalizarTelefone(
    dados.whatsapp_contato,
  )
  const emailContato = limparTexto(
    dados.email_contato,
  )

  if (
    preferido === 'whatsapp' &&
    !whatsapp
  ) {
    erros.whatsapp_contato =
      'Informe o WhatsApp para este canal de contato.'
  }

  if (
    preferido === 'email' &&
    !emailContato
  ) {
    erros.email_contato =
      'Informe o e-mail para este canal de contato.'
  }

  if (preferido === 'ambos') {
    if (!whatsapp) {
      erros.whatsapp_contato =
        'Informe o WhatsApp.'
    }

    if (!emailContato) {
      erros.email_contato =
        'Informe o e-mail.'
    }
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  }
}

export async function criarVaga(dados) {
  const validacao = validarDadosVaga(dados)

  if (!validacao.valido) {
    return {
      data: null,
      error: new Error(
        'Revise os campos do formulário.',
      ),
      validationErrors: validacao.erros,
    }
  }

  const payload = prepararDadosVaga(dados)

  const { data, error } = await supabase
    .from('vagas')
    .insert(payload)
    .select(CAMPOS_ADMIN)
    .single()

  return {
    data: data || null,
    error: error || null,
    validationErrors: {},
  }
}

export async function atualizarVaga(id, dados) {
  if (!id) {
    return {
      data: null,
      error: new Error(
        'ID da vaga não informado.',
      ),
      validationErrors: {},
    }
  }

  const validacao = validarDadosVaga(dados)

  if (!validacao.valido) {
    return {
      data: null,
      error: new Error(
        'Revise os campos do formulário.',
      ),
      validationErrors: validacao.erros,
    }
  }

  const payload = prepararDadosVaga(dados)

  const { data, error } = await supabase
    .from('vagas')
    .update(payload)
    .eq('id', id)
    .select(CAMPOS_ADMIN)
    .single()

  return {
    data: data || null,
    error: error || null,
    validationErrors: {},
  }
}

export async function alterarStatusVaga(
  id,
  status,
) {
  const statusPermitidos = [
    'rascunho',
    'ativa',
    'pausada',
    'encerrada',
  ]

  if (
    !id ||
    !statusPermitidos.includes(status)
  ) {
    return {
      data: null,
      error: new Error(
        'ID ou status inválido.',
      ),
    }
  }

  const { data, error } = await supabase
    .from('vagas')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(CAMPOS_ADMIN)
    .single()

  return {
    data: data || null,
    error: error || null,
  }
}

export async function excluirVaga(id) {
  if (!id) {
    return {
      error: new Error(
        'ID da vaga não informado.',
      ),
    }
  }

  const { error } = await supabase
    .from('vagas')
    .delete()
    .eq('id', id)

  return {
    error: error || null,
  }
}

export async function contarVagasPorStatus() {
  const status = [
    'ativa',
    'rascunho',
    'pausada',
    'encerrada',
  ]

  const contagens = {
    ativa: 0,
    rascunho: 0,
    pausada: 0,
    encerrada: 0,
    total: 0,
  }

  const resultados = await Promise.all(
    status.map(async (item) => {
      const { count, error } = await supabase
        .from('vagas')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('status', item)

      return {
        status: item,
        count: count || 0,
        error,
      }
    }),
  )

  const erro =
    resultados.find(
      (resultado) => resultado.error,
    )?.error || null

  resultados.forEach((resultado) => {
    contagens[resultado.status] =
      resultado.count

    contagens.total += resultado.count
  })

  return {
    data: contagens,
    error: erro,
  }
}