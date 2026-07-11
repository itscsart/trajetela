// Cálculo de compatibilidade (0–100) por usuária, com base no perfil.
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
  return ORDEM_ESCOLARIDADE.findIndex((e) => normalizar(e) === alvo)
}

export function calcularCompatibilidade(perfil, vaga) {
  // Perfil não carregado: retorna 0 (a tela pode exibir "Complete seu perfil").
  if (!perfil || !vaga) return 0

  let pontos = 0

  const areas = Array.isArray(perfil.areas_interesse) ? perfil.areas_interesse.map(normalizar) : []
  const areaVaga = normalizar(vaga.area)
  const areaCombina = areas.length > 0 && !!areaVaga && areas.includes(areaVaga)

  // Área de interesse: 60 pontos (match exato, ignorando acento/caixa)
  if (areaCombina) pontos += 60

  // Modalidade: 15 pontos
  if (perfil.tipo_trabalho && vaga.modalidade && normalizar(perfil.tipo_trabalho) === normalizar(vaga.modalidade)) {
    pontos += 15
  }

  // Prioridade: 10 pontos
  const prioridade = normalizar(perfil.prioridade)
  if (prioridade === 'emprego') {
    if (TIPOS_EMPREGO.includes(vaga.tipo_vaga)) pontos += 10
  } else if (prioridade === 'freela') {
    // Freelas são tratados na Renda Rápida; não pontuam aqui.
    pontos += 0
  }

  // Cidade: 10 pontos
  if (perfil.cidade && vaga.cidade && normalizar(perfil.cidade) === normalizar(vaga.cidade)) {
    pontos += 10
  }

  // Escolaridade: 5 pontos (sem compensar com aceita_sem_experiencia)
  if (!vaga.escolaridade_minima) {
    pontos += 5
  } else {
    const nivelPerfil = nivelEscolaridade(perfil.escolaridade)
    const nivelMinimo = nivelEscolaridade(vaga.escolaridade_minima)
    if (nivelPerfil >= 0 && nivelMinimo >= 0 && nivelPerfil >= nivelMinimo) {
      pontos += 5
    }
  }

  // Bônus de aceita_sem_experiencia: no máximo 3 pontos, só em Primeiro Emprego.
  if (vaga.aceita_sem_experiencia && normalizar(vaga.tipo_vaga) === 'primeiro emprego') {
    pontos += 3
  }

  // Se a área da vaga não está nas áreas de interesse, limitar a 30%.
  if (!areaCombina) {
    pontos = Math.min(pontos, 30)
  }

  return Math.min(pontos, 100)
}
