import { useEffect, useMemo, useRef, useState } from 'react'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import VagaModal from '../components/VagaModal'
import { SearchIcon, FilterIcon, PinIcon, GridIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'
import { getVagas, contarNovasVagas, assinarVagas } from '../utils/vagasService'
import { getPerfil } from '../utils/profileService'
import { calcularCompatibilidade, classificarCompatibilidade } from '../utils/compatibilidade'
import { calcularDistanciaKm } from '../utils/distancia'

const grupos = [
  { titulo: 'Cidade', opcoes: ['São Paulo', 'Guarulhos', 'Osasco'] },
  { titulo: 'Modalidade', opcoes: ['Presencial', 'Híbrido', 'Remoto'] },
  { titulo: 'Tipo de vaga', opcoes: ['CLT', 'Temporário', 'Primeiro Emprego'] },
  { titulo: 'Área', opcoes: ['Vendas', 'Administrativo', 'Educação', 'Marketing', 'Limpeza', 'Gastronomia', 'Beleza', 'Cuidados', 'Tecnologia', 'Outros'] },
  { titulo: 'Salário', opcoes: ['Até R$1.500', 'R$1.500–2.500', 'Acima de R$2.500'] },
  {
    titulo: 'Compatibilidade',
    opcoes: ['Até 30%', '31% a 50%', '51% a 70%', '71% a 85%', '86% a 100%'],
  },
  { titulo: 'Distância', opcoes: ['Até 2 km', 'Até 5 km', 'Até 10 km', 'Até 20 km', 'Até 30 km'] },
]

const OPCOES_CIDADE = ['São Paulo', 'Guarulhos', 'Osasco']
const OPCOES_MODALIDADE = ['Presencial', 'Híbrido', 'Remoto']
const OPCOES_TIPO = ['CLT', 'Temporário', 'Primeiro Emprego']
const OPCOES_AREA = ['Vendas', 'Administrativo', 'Educação', 'Marketing', 'Limpeza', 'Gastronomia', 'Beleza', 'Cuidados', 'Tecnologia', 'Outros']
const OPCOES_DISTANCIA = ['Até 2 km', 'Até 5 km', 'Até 10 km', 'Até 20 km', 'Até 30 km']

const LOCAL_SESSAO_KEY = 'trajetela_local_escolha'

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatarSalario(v) {
  if (v.salario_exibir) return v.salario_exibir
  const fmt = (n) => `R$${Number(n).toLocaleString('pt-BR')}`
  if (v.salario_min != null && v.salario_max != null) {
    return v.salario_min === v.salario_max ? fmt(v.salario_min) : `${fmt(v.salario_min)} – ${fmt(v.salario_max)}`
  }
  if (v.salario_min != null) return fmt(v.salario_min)
  if (v.salario_max != null) return fmt(v.salario_max)
  return ''
}

function abreviarHorario(horario) {
  if (!horario) return ''
  let texto = String(horario)
  texto = texto.replace(/segunda a sexta/gi, 'Seg a sex')
  texto = texto.replace(/segunda a s[áa]bado/gi, 'Seg a sáb')
  texto = texto.replace(/,?\s*das\s+/gi, ', ')
  return texto
}

function localVaga(v) {
  const partes = [v.cidade, v.modalidade].filter(Boolean)
  return partes.join(' . ')
}

function localCard(v) {
  const base = [v.bairro, v.zona].filter(Boolean).join(' · ')
  if (v.distancia_km != null) {
    const km = v.distancia_km < 10 ? v.distancia_km.toFixed(1).replace('.', ',') : String(Math.round(v.distancia_km))
    return base ? `${base} · ${km} km de você` : `${km} km de você`
  }
  return base
}

function textoNovasVagas(n) {
  return n === 1 ? '1 nova vaga adicionada' : `${n} novas vagas adicionadas`
}

function passaSalario(v, opcoes) {
  const selec = opcoes.filter((o) => o.startsWith('Até R$') || o.startsWith('R$') || o.startsWith('Acima'))
  if (selec.length === 0) return true
  const valor = v.salario_min != null ? Number(v.salario_min) : v.salario_max != null ? Number(v.salario_max) : null
  if (valor == null) return false
  return selec.some((o) => {
    if (o === 'Até R$1.500') return valor <= 1500
    if (o === 'R$1.500–2.500') return valor >= 1500 && valor <= 2500
    if (o === 'Acima de R$2.500') return valor > 2500
    return true
  })
}

function passaCompatibilidade(compat, opcoes) {
  const faixas = [
    'Até 30%',
    '31% a 50%',
    '51% a 70%',
    '71% a 85%',
    '86% a 100%',
  ]

  const selec = opcoes.filter((o) => faixas.includes(o))

  if (selec.length === 0) return true

  return selec.some((o) => {
    if (o === 'Até 30%') return compat <= 30
    if (o === '31% a 50%') return compat >= 31 && compat <= 50
    if (o === '51% a 70%') return compat >= 51 && compat <= 70
    if (o === '71% a 85%') return compat >= 71 && compat <= 85
    if (o === '86% a 100%') return compat >= 86 && compat <= 100
    return false
  })
}

function passaDistancia(v, opcoes) {
  const selec = opcoes.filter((o) => OPCOES_DISTANCIA.includes(o))
  if (selec.length === 0) return true
  // Só exclui vagas que possuem distância calculada.
  if (v.distancia_km == null) return true
  const limite = Math.max(...selec.map((o) => parseInt(o.replace(/\D/g, ''), 10)))
  return v.distancia_km <= limite
}

export default function Vagas() {
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState([])
  const [vagaSel, setVagaSel] = useState(null)
  const [salvos, setSalvos] = useState(() => getSalvos().map((s) => s.id))

  const [vagas, setVagas] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [novasVagas, setNovasVagas] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [coords, setCoords] = useState(null)
  const [avisoLocal, setAvisoLocal] = useState('')
  const [modalLocal, setModalLocal] = useState(false)
  const montadoRef = useRef(true)

  const recarregar = async () => {
    const [{ data, error }, novas] = await Promise.all([getVagas(), contarNovasVagas()])
    if (!montadoRef.current) return
    if (!error) setVagas(data)
    setNovasVagas(novas && novas.count ? novas.count : 0)
  }

  useEffect(() => {
    montadoRef.current = true

    async function carregar() {
      setCarregando(true)
      setErro('')

      const [{ data, error }, novas, perfilUsuaria] = await Promise.all([
        getVagas(),
        contarNovasVagas(),
        getPerfil(),
      ])

      if (!montadoRef.current) return

      if (error) {
        setErro('Não foi possível carregar as vagas. Tente novamente.')
        setVagas([])
      } else {
        setVagas(data)
      }

      setNovasVagas(novas && novas.count ? novas.count : 0)
      setPerfil(perfilUsuaria || null)
      setCarregando(false)
    }

    carregar()

    const cancelar = assinarVagas(() => {
      recarregar()
    })

    return () => {
      montadoRef.current = false
      cancelar()
    }
  }, [])

  useEffect(() => {
    let escolha = null
    try {
      escolha = sessionStorage.getItem(LOCAL_SESSAO_KEY)
    } catch {
      escolha = null
    }

    if (escolha === 'permitir') {
      solicitarLocalizacao()
    } else if (escolha === 'negar') {
      // Já recusou nesta sessão: mantém apenas bairro e zona.
    } else {
      setModalLocal(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const registrarEscolha = (valor) => {
    try {
      sessionStorage.setItem(LOCAL_SESSAO_KEY, valor)
    } catch {
      /* ignora */
    }
  }

  const solicitarLocalizacao = () => {
    if (!('geolocation' in navigator)) {
      setAvisoLocal('Não foi possível acessar sua localização. Você ainda pode buscar vagas por cidade e bairro.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!montadoRef.current) return
        // Coordenadas mantidas apenas em memória (não salvas em banco/localStorage).
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      () => {
        if (!montadoRef.current) return
        setAvisoLocal('Não foi possível acessar sua localização. Você ainda pode buscar vagas por cidade e bairro.')
      },
    )
  }

  const permitirLocalizacao = () => {
    registrarEscolha('permitir')
    setModalLocal(false)
    solicitarLocalizacao()
  }

  const negarLocalizacao = () => {
    registrarEscolha('negar')
    setModalLocal(false)
  }

  const salvarVaga = (v) => {
    const sid = `vaga-${v.id}`
    addSalvo({
      id: sid,
      tipo: 'vaga_clt',
      titulo: v.titulo,
      subtitulo: v.empresa,
      valor: v.salarioTexto,
      origem: 'Vagas',
    })
    setSalvos((prev) => (prev.includes(sid) ? prev : [...prev, sid]))
  }

  const toggleFiltro = (op) =>
    setFiltros((p) => (p.includes(op) ? p.filter((x) => x !== op) : [...p, op]))

  const vagasProcessadas = useMemo(() => {
    const termo = normalizar(busca)

    const cidadesSel = filtros.filter((f) => OPCOES_CIDADE.includes(f))
    const modalidadesSel = filtros.filter((f) => OPCOES_MODALIDADE.includes(f))
    const tiposSel = filtros.filter((f) => OPCOES_TIPO.includes(f))
    const areasSel = filtros.filter((f) => OPCOES_AREA.includes(f))

    return vagas
      .map((v) => {
        let distancia_km = null
        if (coords && v.latitude != null && v.longitude != null) {
          distancia_km = calcularDistanciaKm(coords.lat, coords.lon, Number(v.latitude), Number(v.longitude))
        }
        const comDist = { ...v, distancia_km }
        const compat = calcularCompatibilidade(perfil, v)
        return {
          ...comDist,
          compat,
          compatLabel: classificarCompatibilidade(compat),
          salarioTexto: formatarSalario(v),
          horarioTexto: abreviarHorario(v.horario),
          local: localVaga(v),
          localCard: localCard(comDist),
        }
      })
      .filter((v) => {
        if (termo) {
          const alvo = [v.titulo, v.empresa, v.area, v.bairro, v.cidade, v.descricao].map(normalizar).join(' ')
          if (!alvo.includes(termo)) return false
        }

        if (cidadesSel.length && !cidadesSel.some((c) => normalizar(c) === normalizar(v.cidade))) return false
        if (modalidadesSel.length && !modalidadesSel.some((m) => normalizar(m) === normalizar(v.modalidade))) return false
        if (tiposSel.length && !tiposSel.some((t) => normalizar(t) === normalizar(v.tipo_vaga))) return false
        if (areasSel.length && !areasSel.some((a) => normalizar(a) === normalizar(v.area))) return false
        if (!passaSalario(v, filtros)) return false
        if (!passaCompatibilidade(v.compat, filtros)) return false
        if (!passaDistancia(v, filtros)) return false

        return true
      })
      .sort((a, b) => {
        if (b.compat !== a.compat) return b.compat - a.compat
        const da = a.distancia_km == null ? Infinity : a.distancia_km
        const db = b.distancia_km == null ? Infinity : b.distancia_km
        if (da !== db) return da - db
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [vagas, perfil, busca, filtros, coords])

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Vagas" subtitle={textoNovasVagas(novasVagas)} />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Busca */}
        <div className="flex items-center gap-2 rounded-full border border-[#291662]/15 bg-white px-4 py-3 shadow-sm">
          <SearchIcon className="h-5 w-5 text-[#291662]/60" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cargo, empresa ou área..."
            className="w-full bg-transparent text-[14px] text-[#291662] outline-none placeholder:text-[#291662]/45"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltroAberto(true)}
            aria-label="Opções de exibição"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#291662]/20 text-[#291662] active:bg-[#F6F1FE]"
          >
            <GridIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setFiltroAberto(true)}
            className="flex items-center gap-2 rounded-full border border-[#291662]/20 px-4 py-2 text-[14px] font-medium text-[#291662] active:bg-[#F6F1FE]"
          >
            <FilterIcon className="h-4 w-4" /> Filtro ({filtros.length})
          </button>
        </div>

        {avisoLocal && (
          <p className="mt-3 text-[13px] font-medium text-[#8F55E9]">{avisoLocal}</p>
        )}

        {/* Lista de vagas */}
        <div className="mt-4 space-y-4">
          {carregando ? (
            <p className="py-8 text-center text-[14px] font-medium text-[#291662]/70">Carregando vagas...</p>
          ) : erro ? (
            <p className="py-8 text-center text-[14px] font-medium text-[#D6479B]">{erro}</p>
          ) : vagasProcessadas.length === 0 ? (
            <p className="py-8 text-center text-[14px] font-medium text-[#291662]/70">Nenhuma vaga encontrada.</p>
          ) : (
            vagasProcessadas.map((v) => (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => setVagaSel(v)}
                onKeyDown={(e) => e.key === 'Enter' && setVagaSel(v)}
                className="cursor-pointer rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
              >
                <h3 className="text-[17px] font-bold text-[#291662]">{v.titulo}</h3>
                <p className="text-[14px] text-[#291662]/80">{v.empresa}</p>

                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <p className="flex items-center gap-1 text-[14px] text-[#291662]">
                      <PinIcon className="h-4 w-4 text-[#E84C8A]" /> {v.localCard || v.local}
                    </p>
                    <p className="mt-2 text-[14px] font-medium text-[#2EA043]">
                      {perfil ? `${v.compat} % · ${v.compatLabel}` : 'Complete seu perfil'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#291662]">{v.horarioTexto}</p>
                    <p className="mt-2 text-[15px] font-bold text-[#291662]">{v.salarioTexto}</p>
                  </div>
                </div>

                <div className="mt-3 border-t border-[#291662]/10 pt-3 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVagaSel(v)
                    }}
                    className="text-[15px] font-bold text-[#291662] active:text-[#8F55E9]"
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de permissão de localização */}
      <Modal open={modalLocal} onClose={negarLocalizacao} title="Encontrar vagas perto de você">
        <p className="text-[14px] leading-relaxed text-[#291662]/80">
          O TrajetEla usa sua localização apenas para calcular a distância até as vagas próximas. Sua
          localização não será salva no banco de dados.
        </p>
        <button
          type="button"
          onClick={permitirLocalizacao}
          className="mt-6 block w-full rounded-full bg-[#8F55E9] py-3.5 text-center text-[15px] font-semibold text-white"
        >
          Permitir localização
        </button>
        <button
          type="button"
          onClick={negarLocalizacao}
          className="mt-3 block w-full rounded-full py-3.5 text-center text-[15px] font-semibold text-[#291662]/70"
        >
          Agora não
        </button>
      </Modal>

      {/* Modal de filtros */}
      <Modal open={filtroAberto} onClose={() => setFiltroAberto(false)} title="Filtros">
        <div className="space-y-5">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="mb-2 text-[14px] font-bold text-[#291662]">{g.titulo}</p>
              <div className="flex flex-wrap gap-2">
                {g.opcoes.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => toggleFiltro(op)}
                    className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                      filtros.includes(op)
                        ? 'border-[#8F55E9] bg-[#8F55E9] text-white'
                        : 'border-[#291662]/20 text-[#291662]'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setFiltroAberto(false)}
            className="w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
          >
            Aplicar filtros ({filtros.length})
          </button>

          {filtros.length > 0 && (
            <button
              type="button"
              onClick={() => setFiltros([])}
              className="w-full rounded-full border border-[#8F55E9]/40 py-3.5 text-[15px] font-semibold text-[#291662]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Modal>

      {/* Modal de detalhes da vaga */}
      <VagaModal
        open={!!vagaSel}
        onClose={() => setVagaSel(null)}
        vaga={vagaSel}
        salvarLabel="Salvar vaga"
        salvo={!!vagaSel && salvos.includes(`vaga-${vagaSel.id}`)}
        onSalvar={() => vagaSel && salvarVaga(vagaSel)}
      />
    </PageContainer>
  )
}