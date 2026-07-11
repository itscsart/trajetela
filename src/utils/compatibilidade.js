// Cálculo de compatibilidade (0–100) por usuária, com base no perfil.
// O valor NÃO vem da vaga: é calculado individualmente em runtime.
// Considera famílias profissionais e níveis de proximidade entre subáreas.

const ORDEM_ESCOLARIDADE = [
  'Ensino fundamental incompleto',
  'Ensino fundamental completo',
  'Ensino médio incompleto',
  'Ensino médio completo',
  'Ensino técnico',
  'Ensino superior incompleto',
  'Ensino superior completo',
  'Pós-graduação',
]

const TIPOS_EMPREGO = ['CLT', 'Temporário', 'Primeiro Emprego']

// Famílias profissionais e suas subáreas.
const FAMILIAS = {
  comunicacao: [
    'marketing', 'marketing digital', 'comunicacao social', 'audiovisual', 'producao audiovisual',
    'cinema', 'edicao de video', 'editor de video', 'fotografia', 'design', 'design grafico',
    'social media', 'copywriting', 'copy', 'producao de conteudo', 'publicidade',
    'relacoes publicas', 'jornalismo',
  ],
  tecnologia: [
    'tecnologia', 'ti', 'suporte', 'help desk', 'infraestrutura', 'redes', 'desenvolvimento',
    'programacao', 'dados', 'sistemas', 'seguranca da informacao',
  ],
  administrativo: [
    'administrativo', 'auxiliar administrativo', 'financeiro', 'recursos humanos',
    'departamento pessoal', 'recepcao administrativa', 'assistente de escritorio',
  ],
  atendimento_vendas: [
    'atendimento', 'atendimento ao cliente', 'telemarketing', 'sac', 'call center', 'vendas',
    'operador de loja', 'caixa', 'recepcao', 'comercial',
  ],
  servicos: [
    'limpeza', 'servicos gerais', 'auxiliar de limpeza', 'cozinha', 'gastronomia', 'producao',
    'logistica', 'estoque', 'auxiliar geral',
  ],
  cuidados: [
    'cuidados', 'cuidadora', 'baba', 'idosos', 'beleza', 'manicure', 'cabeleireira', 'estetica',
  ],
  educacao: [
    'educacao', 'apoio escolar', 'monitoria', 'professora', 'instrutora',
  ],
  outros: ['outros'],
}

// Proximidade dentro da família de comunicação/criativas (pares → nível).
// Níveis: 'alta', 'media_alta', 'media', 'baixa'. Ausência = 'baixa' (mesma família).
const PROXIMIDADE_COMUNICACAO = {
  'marketing|copywriting': 'alta',
  'marketing|copy': 'alta',
  'marketing|social media': 'alta',
  'marketing|marketing digital': 'alta',
  'marketing|producao de conteudo': 'alta',
  'marketing|publicidade': 'alta',
  'marketing|audiovisual': 'media_alta',
  'marketing|producao audiovisual': 'media_alta',
  'marketing|cinema': 'media',
  'marketing|fotografia': 'media',
  'design|audiovisual': 'alta',
  'design|design grafico': 'alta',
  'design|social media': 'alta',
  'audiovisual|editor de video': 'alta',
  'audiovisual|edicao de video': 'alta',
  'audiovisual|producao audiovisual': 'alta',
  'audiovisual|cinema': 'alta',
  'edicao de video|cinema': 'alta',
  'editor de video|cinema': 'alta',
  'fotografia|audiovisual': 'media_alta',
  'jornalismo|comunicacao social': 'alta',
  'publicidade|marketing': 'alta',
}

const PONTOS_PROXIMIDADE = {
  exata: 60,
  alta: 48,
  media_alta: 43,
  media: 38,
  baixa: 28,
}

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function familiaDe(area) {
  const alvo = normalizar(area)
  if (!alvo) return null
  for (const [familia, subareas] of Object.entries(FAMILIAS)) {
    if (subareas.includes(alvo)) return familia
  }
  return null
}

function nivelProximidade(a, b) {
  const chave1 = `${a}|${b}`
  const chave2 = `${b}|${a}`
  return PROXIMIDADE_COMUNICACAO[chave1] || PROXIMIDADE_COMUNICACAO[chave2] || 'baixa'
}

function nivelEscolaridade(valor) {
  const alvo = normalizar(valor)
  return ORDEM_ESCOLARIDADE.findIndex((e) => normalizar(e) === alvo)
}

// Retorna a melhor pontuação de área entre todas as áreas de interesse do perfil.
function pontosArea(areasPerfil, areaVaga) {
  const vaga = normalizar(areaVaga)
  const familiaVaga = familiaDe(vaga)
  if (!vaga || !familiaVaga || areasPerfil.length === 0) {
    return { pontos: 0, mesmaFamilia: false, exataOuAlta: false }
  }

  // "Outros" só combina com "Outros".
  if (familiaVaga === 'outros') {
    const temOutros = areasPerfil.some((a) => normalizar(a) === 'outros')
    if (temOutros) return { pontos: PONTOS_PROXIMIDADE.exata, mesmaFamilia: true, exataOuAlta: true }
    return { pontos: 0, mesmaFamilia: false, exataOuAlta: false }
  }

  let melhor = { pontos: 0, mesmaFamilia: false, exataOuAlta: false }

  for (const areaBruta of areasPerfil) {
    const areaPerfil = normalizar(areaBruta)
    if (areaPerfil === 'outros') continue
    const familiaPerfil = familiaDe(areaPerfil)
    if (!familiaPerfil || familiaPerfil !== familiaVaga) continue

    let pontos
    let exataOuAlta = false

    if (areaPerfil === vaga) {
      pontos = PONTOS_PROXIMIDADE.exata
      exataOuAlta = true
    } else if (familiaVaga === 'comunicacao') {
      const nivel = nivelProximidade(areaPerfil, vaga)
      pontos = PONTOS_PROXIMIDADE[nivel]
      exataOuAlta = nivel === 'alta' || nivel === 'media_alta'
    } else {
      // Demais famílias: mesma família sem match exato = alta proximidade.
      pontos = PONTOS_PROXIMIDADE.alta
      exataOuAlta = true
    }

    if (pontos > melhor.pontos) {
      melhor = { pontos, mesmaFamilia: true, exataOuAlta }
    }
  }

  return melhor
}

export function calcularCompatibilidade(perfil, vaga) {
  // Perfil não carregado: retorna 0 (a tela pode exibir "Complete seu perfil").
  if (!perfil || !vaga) return 0

  const areas = Array.isArray(perfil.areas_interesse) ? perfil.areas_interesse : []
  const { pontos: pArea, mesmaFamilia, exataOuAlta } = pontosArea(areas, vaga.area)

  let pontos = pArea

  // Escolaridade: até 15 pontos
  if (!vaga.escolaridade_minima) {
    pontos += 15
  } else {
    const nivelPerfil = nivelEscolaridade(perfil.escolaridade)
    const nivelMinimo = nivelEscolaridade(vaga.escolaridade_minima)
    if (nivelPerfil >= 0 && nivelMinimo >= 0) {
      const diff = nivelPerfil - nivelMinimo
      if (diff >= 0) pontos += 15
      else if (diff === -1) pontos += 7
      // dois ou mais níveis abaixo: 0
    }
  }

  // Modalidade: até 10 pontos
  const tipoTrab = normalizar(perfil.tipo_trabalho)
  const modalidade = normalizar(vaga.modalidade)
  if (tipoTrab && modalidade) {
    if (tipoTrab === modalidade) pontos += 10
    else if (tipoTrab === 'remoto' && modalidade === 'hibrido') pontos += 5
    else if (tipoTrab === 'hibrido' && modalidade === 'presencial') pontos += 5
  }

  // Prioridade: até 10 pontos
  const prioridade = normalizar(perfil.prioridade)
  if (prioridade === 'emprego') {
    const tipoVaga = normalizar(vaga.tipo_vaga)
    if (tipoVaga === 'clt') pontos += 10
    else if (tipoVaga === 'temporario') pontos += 8
    else if (tipoVaga === 'primeiro emprego') pontos += 10
  } else if (prioridade === 'freela') {
    pontos += 2
  }

  // Cidade: até 5 pontos
  if (perfil.cidade && vaga.cidade && normalizar(perfil.cidade) === normalizar(vaga.cidade)) {
    pontos += 5
  }

  // Bônus de experiência: até 5 pontos, só Primeiro Emprego + aceita_sem_experiencia.
  if (vaga.aceita_sem_experiencia && normalizar(vaga.tipo_vaga) === 'primeiro emprego' && prioridade === 'emprego') {
    pontos += 5
  }

  // Travas de compatibilidade.
  if (!mesmaFamilia) {
    // Família diferente ou sem relação: máximo 30%.
    pontos = Math.min(pontos, 30)
  } else if (!exataOuAlta) {
    // Mesma família, baixa proximidade: entre 40% e 65%.
    pontos = Math.max(40, Math.min(pontos, 65))
  }

  return Math.max(0, Math.min(pontos, 100))
}

export function classificarCompatibilidade(valor) {
  if (valor >= 80) return 'Alta compatibilidade'
  if (valor >= 60) return 'Boa compatibilidade'
  if (valor >= 40) return 'Compatibilidade média'
  return 'Baixa compatibilidade'
}
