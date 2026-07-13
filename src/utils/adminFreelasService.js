import { supabase } from '../lib/supabase'

const CAMPOS_ADMIN = `
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
      error:
        userError ||
        new Error('Usuária não autenticada.'),
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

export async function listarTodosFreelas({
  busca = '',
  status = '',
  categoria = '',
  cidade = '',
  destaque = '',
} = {}) {
  let query = supabase
    .from('freelas')
    .select(CAMPOS_ADMIN)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (categoria) {
    query = query.eq('categoria', categoria)
  }

  if (cidade) {
    query = query.eq('cidade', cidade)
  }

  if (destaque === 'sim') {
    query = query.eq('destaque', true)
  }

  if (destaque === 'nao') {
    query = query.eq('destaque', false)
  }

  if (busca.trim()) {
    const termo = busca
      .trim()
      .replace(/[%(),]/g, ' ')

    query = query.or(
      `titulo.ilike.%${termo}%,contratante.ilike.%${termo}%,categoria.ilike.%${termo}%,cidade.ilike.%${termo}%,bairro.ilike.%${termo}%`,
    )
  }

  const { data, error } = await query

  return {
    data: data || [],
    error: error || null,
  }
}

export async function buscarFreelaAdminPorId(id) {
  if (!id) {
    return {
      data: null,
      error: new Error(
        'ID do freela não informado.',
      ),
    }
  }

  const { data, error } = await supabase
    .from('freelas')
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

  return Number.isFinite(numero)
    ? numero
    : null
}

function limparInteiro(valor) {
  if (valor === '' || valor == null) {
    return null
  }

  const numero = Number.parseInt(valor, 10)

  return Number.isInteger(numero)
    ? numero
    : null
}

function normalizarTelefone(valor) {
  const telefone = String(valor || '')
    .replace(/\D/g, '')

  return telefone || null
}

export function prepararDadosFreela(dados) {
  const valor = limparNumero(dados.valor_min)

  return {
    titulo: limparTexto(dados.titulo),
    contratante: limparTexto(
      dados.contratante,
    ),
    categoria: limparTexto(dados.categoria),

    descricao: limparTexto(
      dados.descricao,
    ),
    atividades: limparTexto(
      dados.atividades,
    ),
    requisitos: limparTexto(
      dados.requisitos,
    ),
    materiais_necessarios: limparTexto(
      dados.materiais_necessarios,
    ),
    observacoes: limparTexto(
      dados.observacoes,
    ),
    informacoes_adicionais: limparTexto(
      dados.informacoes_adicionais,
    ),

    cidade: limparTexto(dados.cidade),
    bairro: limparTexto(dados.bairro),
    zona: limparTexto(dados.zona),
    endereco_referencia: limparTexto(
      dados.endereco_referencia,
    ),

    latitude: limparNumero(
      dados.latitude,
    ),
    longitude: limparNumero(
      dados.longitude,
    ),

    data_servico: limparTexto(
      dados.data_servico,
    ),
    horario: limparTexto(dados.horario),
    duracao_estimada: limparTexto(
      dados.duracao_estimada,
    ),

    quantidade_pessoas: limparInteiro(
      dados.quantidade_pessoas,
    ),

    tipo_valor: 'fixo',
    valor_min: valor,
    valor_max: null,
    valor_exibir: null,
    forma_pagamento: null,

    whatsapp_contato: normalizarTelefone(
      dados.whatsapp_contato,
    ),

    email_contato:
      limparTexto(
        dados.email_contato,
      )?.toLowerCase() || null,

    contato_preferido: limparTexto(
      dados.contato_preferido,
    ),

    destaque: Boolean(dados.destaque),

    status:
      limparTexto(dados.status) ||
      'rascunho',

    updated_at: new Date().toISOString(),
  }
}

export function validarDadosFreela(dados) {
  const erros = {}

  if (!dados.titulo?.trim()) {
    erros.titulo =
      'Informe o título do freela.'
  }

  if (!dados.contratante?.trim()) {
    erros.contratante =
      'Informe o contratante.'
  }

  if (!dados.categoria?.trim()) {
    erros.categoria =
      'Selecione a categoria.'
  }

  if (!dados.descricao?.trim()) {
    erros.descricao =
      'Informe a descrição do serviço.'
  }

  if (!dados.cidade?.trim()) {
    erros.cidade =
      'Informe a cidade.'
  }

  if (!dados.bairro?.trim()) {
    erros.bairro =
      'Informe o bairro.'
  }

  if (!dados.data_servico) {
    erros.data_servico =
      'Informe a data do serviço.'
  }

  if (!dados.horario?.trim()) {
    erros.horario =
      'Informe o horário.'
  }

  if (!dados.duracao_estimada?.trim()) {
    erros.duracao_estimada =
      'Informe a duração estimada.'
  }

  if (!dados.status?.trim()) {
    erros.status =
      'Selecione o status.'
  }

  const valor = limparNumero(
    dados.valor_min,
  )

  if (valor == null || valor <= 0) {
    erros.valor_min =
      'Informe um valor válido para o freela.'
  }

  const quantidade = limparInteiro(
    dados.quantidade_pessoas,
  )

  if (
    quantidade != null &&
    quantidade <= 0
  ) {
    erros.quantidade_pessoas =
      'A quantidade de pessoas deve ser maior que zero.'
  }

  const latitude = limparNumero(
    dados.latitude,
  )

  if (
    latitude != null &&
    (latitude < -90 ||
      latitude > 90)
  ) {
    erros.latitude =
      'A latitude deve estar entre -90 e 90.'
  }

  const longitude = limparNumero(
    dados.longitude,
  )

  if (
    longitude != null &&
    (longitude < -180 ||
      longitude > 180)
  ) {
    erros.longitude =
      'A longitude deve estar entre -180 e 180.'
  }

  const email =
    dados.email_contato?.trim()

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  ) {
    erros.email_contato =
      'Informe um e-mail válido.'
  }

  if (dados.data_servico) {
    const dataServico = new Date(
      `${dados.data_servico}T23:59:59`,
    )

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (
      Number.isNaN(
        dataServico.getTime(),
      ) ||
      dataServico < hoje
    ) {
      erros.data_servico =
        'A data do serviço não pode ser anterior à data atual.'
    }
  }

  const preferido =
    dados.contato_preferido

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
    valido:
      Object.keys(erros).length === 0,
    erros,
  }
}

export async function criarFreela(dados) {
  const validacao =
    validarDadosFreela(dados)

  if (!validacao.valido) {
    return {
      data: null,
      error: new Error(
        'Revise os campos do formulário.',
      ),
      validationErrors:
        validacao.erros,
    }
  }

  const payload =
    prepararDadosFreela(dados)

  const { data, error } =
    await supabase
      .from('freelas')
      .insert(payload)
      .select(CAMPOS_ADMIN)
      .single()

  return {
    data: data || null,
    error: error || null,
    validationErrors: {},
  }
}

export async function atualizarFreela(
  id,
  dados,
) {
  if (!id) {
    return {
      data: null,
      error: new Error(
        'ID do freela não informado.',
      ),
      validationErrors: {},
    }
  }

  const validacao =
    validarDadosFreela(dados)

  if (!validacao.valido) {
    return {
      data: null,
      error: new Error(
        'Revise os campos do formulário.',
      ),
      validationErrors:
        validacao.erros,
    }
  }

  const payload =
    prepararDadosFreela(dados)

  const { data, error } =
    await supabase
      .from('freelas')
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

export async function alterarStatusFreela(
  id,
  status,
) {
  const statusPermitidos = [
    'rascunho',
    'ativa',
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

  const { data, error } =
    await supabase
      .from('freelas')
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', id)
      .select(CAMPOS_ADMIN)
      .single()

  return {
    data: data || null,
    error: error || null,
  }
}

export async function alterarDestaqueFreela(
  id,
  destaque,
) {
  if (!id) {
    return {
      data: null,
      error: new Error(
        'ID do freela não informado.',
      ),
    }
  }

  const { data, error } =
    await supabase
      .from('freelas')
      .update({
        destaque: Boolean(destaque),
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', id)
      .select(CAMPOS_ADMIN)
      .single()

  return {
    data: data || null,
    error: error || null,
  }
}

export async function excluirFreela(id) {
  if (!id) {
    return {
      error: new Error(
        'ID do freela não informado.',
      ),
    }
  }

  const { error } = await supabase
    .from('freelas')
    .delete()
    .eq('id', id)

  return {
    error: error || null,
  }
}

export async function contarFreelasPorStatus() {
  const status = [
    'ativa',
    'rascunho',
    'encerrada',
  ]

  const contagens = {
    ativa: 0,
    rascunho: 0,
    encerrada: 0,
    total: 0,
  }

  const resultados =
    await Promise.all(
      status.map(async (item) => {
        const { count, error } =
          await supabase
            .from('freelas')
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
      (resultado) =>
        resultado.error,
    )?.error || null

  resultados.forEach(
    (resultado) => {
      contagens[
        resultado.status
      ] = resultado.count

      contagens.total +=
        resultado.count
    },
  )

  return {
    data: contagens,
    error: erro,
  }
}