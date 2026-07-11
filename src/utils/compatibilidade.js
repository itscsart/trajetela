// Cálculo inicial de compatibilidade (0–100) por usuária, com base no perfil.
// O valor NÃO vem da vaga: é calculado individualmente em runtime.

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

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function nivelEscolaridade(valor) {
  const alvo = normalizar(valor)
  const idx = ORDEM_ESCOLARIDADE.findIndex((e) => normalizar(e) === alvo)
  return idx
}

export function calcularCompatibilidade(perfil, vaga) {
  if (!perfil || !vaga) return 50

  let pontos = 0
  let total = 0

  // Prioridade (peso 30)
  total += 30
  const prioridade = normalizar(perfil.prioridade)
  const tipoVaga = vaga.tipo_vaga
  if (prioridade === 'emprego') {
    if (TIPOS_EMPREGO.includes(tipoVaga)) pontos += 30
  } else if (prioridade === 'freela') {
    // Freelas são tratados na área Renda Rápida; nesta tela não pontuam alto.
    pontos += 5
  } else {
    pontos += 15
  }

  // Áreas de interesse (peso 30)
  total += 30
  const areas = Array.isArray(perfil.areas_interesse) ? perfil.areas_interesse.map(normalizar) : []
  if (areas.length > 0 && areas.includes(normalizar(vaga.area))) {
    pontos += 30
  }

  // Tipo de trabalho x modalidade (peso 20)
  total += 20
  if (perfil.tipo_trabalho && vaga.modalidade) {
    if (normalizar(perfil.tipo_trabalho) === normalizar(vaga.modalidade)) pontos += 20
  }

  // Localização (peso 10)
  total += 10
  if (perfil.cidade && vaga.cidade && normalizar(perfil.cidade) === normalizar(vaga.cidade)) {
    pontos += 10
  }

  // Escolaridade mínima (peso 10)
  total += 10
  if (!vaga.escolaridade_minima) {
    pontos += 10
  } else {
    const nivelPerfil = nivelEscolaridade(perfil.escolaridade)
    const nivelMinimo = nivelEscolaridade(vaga.escolaridade_minima)
    if (nivelPerfil >= 0 && nivelMinimo >= 0 && nivelPerfil >= nivelMinimo) {
      pontos += 10
    } else if (vaga.aceita_sem_experiencia) {
      pontos += 6
    }
  }

  if (total === 0) return 50
  return Math.round((pontos / total) * 100)
}
