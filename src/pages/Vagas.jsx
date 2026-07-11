import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import VagaModal from '../components/VagaModal'
import { SearchIcon, FilterIcon, PinIcon, GridIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'
import { getVagas, contarNovasVagas } from '../utils/vagasService'
import { getPerfil } from '../utils/profileService'
import { calcularCompatibilidade } from '../utils/compatibilidade'

const chips = ['Recomendadas', 'São Paulo - SP', 'Primeiro Emprego']

const grupos = [
  { titulo: 'Cidade', opcoes: ['São Paulo', 'Guarulhos', 'Osasco'] },
  { titulo: 'Modalidade', opcoes: ['Presencial', 'Híbrido', 'Remoto'] },
  { titulo: 'Tipo de vaga', opcoes: ['CLT', 'Temporário', 'Primeiro Emprego'] },
  { titulo: 'Área', opcoes: ['Administrativo', 'Atendimento', 'Financeiro'] },
  { titulo: 'Salário', opcoes: ['Até R$1.500', 'R$1.500–2.500', 'Acima de R$2.500'] },
  { titulo: 'Compatibilidade', opcoes: ['70%+', '80%+', '90%+'] },
  { titulo: 'Distância', opcoes: ['Até 2 km', 'Até 5 km', 'Até 10 km', 'Até 20 km', 'Até 30 km'] },
]

const OPCOES_DISTANCIA = ['Até 2 km', 'Até 5 km', 'Até 10 km', 'Até 20 km', 'Até 30 km']

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

function localVaga(v) {
  const partes = [v.cidade, v.modalidade].filter(Boolean)
  return partes.join(' . ')
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
  const selec = opcoes.filter((o) => o.endsWith('%+'))
  if (selec.length === 0) return true
  const minimo = Math.min(...selec.map((o) => parseInt(o, 10)))
  return compat >= minimo
}

export default function Vagas() {
  const [chipsAtivos, setChipsAtivos] = useState(['Recomendadas'])
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

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro('')

      const [{ data, error }, novas, perfilUsuaria] = await Promise.all([
        getVagas(),
        contarNovasVagas(),
        getPerfil(),
      ])

      if (!ativo) return

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

    return () => {
      ativo = false
    }
  }, [])

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

  const toggleChip = (c) =>
    setChipsAtivos((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  const toggleFiltro = (op) =>
    setFiltros((p) => (p.includes(op) ? p.filter((x) => x !== op) : [...p, op]))

  const filtrosContam = filtros.filter((f) => !OPCOES_DISTANCIA.includes(f)).length

  const vagasProcessadas = useMemo(() => {
    const termo = normalizar(busca)

    const cidadesSel = filtros.filter((f) => ['São Paulo', 'Guarulhos', 'Osasco'].includes(f))
    const modalidadesSel = filtros.filter((f) => ['Presencial', 'Híbrido', 'Remoto'].includes(f))
    const tiposSel = filtros.filter((f) => ['CLT', 'Temporário', 'Primeiro Emprego'].includes(f))
    const areasSel = filtros.filter((f) => ['Administrativo', 'Atendimento', 'Financeiro'].includes(f))

    return vagas
      .map((v) => ({
        ...v,
        compat: calcularCompatibilidade(perfil, v),
        salarioTexto: formatarSalario(v),
        local: localVaga(v),
      }))
      .filter((v) => {
        if (termo) {
          const alvo = [v.titulo, v.empresa, v.area, v.bairro, v.cidade, v.descricao].map(normalizar).join(' ')
          if (!alvo.includes(termo)) return false
        }

        if (chipsAtivos.includes('São Paulo - SP') && normalizar(v.cidade) !== 'sao paulo') return false
        if (chipsAtivos.includes('Primeiro Emprego') && normalizar(v.tipo_vaga) !== 'primeiro emprego') return false

        if (cidadesSel.length && !cidadesSel.some((c) => normalizar(c) === normalizar(v.cidade))) return false
        if (modalidadesSel.length && !modalidadesSel.some((m) => normalizar(m) === normalizar(v.modalidade))) return false
        if (tiposSel.length && !tiposSel.some((t) => normalizar(t) === normalizar(v.tipo_vaga))) return false
        if (areasSel.length && !areasSel.some((a) => normalizar(a) === normalizar(v.area))) return false
        if (!passaSalario(v, filtros)) return false
        if (!passaCompatibilidade(v.compat, filtros)) return false

        return true
      })
      .sort((a, b) => {
        if (b.compat !== a.compat) return b.compat - a.compat
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [vagas, perfil, busca, chipsAtivos, filtros])

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Vagas" subtitle={`${novasVagas} novas vagas adicionadas`} />

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
            <FilterIcon className="h-4 w-4" /> Filtro ({filtrosContam})
          </button>
        </div>

        {/* Chips roláveis horizontalmente */}
        <div className="-mx-5 mt-4 flex flex-nowrap gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleChip(c)}
              className={`flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                chipsAtivos.includes(c)
                  ? 'border-[#8F55E9] bg-[#F1EAFD] text-[#8F55E9]'
                  : 'border-[#291662]/20 text-[#291662]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

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
                      <PinIcon className="h-4 w-4 text-[#E84C8A]" /> {v.local}
                    </p>
                    <p className="mt-2 text-[14px] font-medium text-[#2EA043]">{v.compat} % compatível</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#291662]">{v.horario}</p>
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

      {/* Modal de filtros */}
      <Modal open={filtroAberto} onClose={() => setFiltroAberto(false)} title="Filtros">
        <div className="space-y-5">
          {grupos.map((g) => {
            const distancia = g.titulo === 'Distância'
            return (
              <div key={g.titulo}>
                <p className="mb-2 text-[14px] font-bold text-[#291662]">{g.titulo}</p>
                <div className="flex flex-wrap gap-2">
                  {g.opcoes.map((op) => (
                    <button
                      key={op}
                      type="button"
                      disabled={distancia}
                      onClick={() => !distancia && toggleFiltro(op)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                        filtros.includes(op)
                          ? 'border-[#8F55E9] bg-[#8F55E9] text-white'
                          : 'border-[#291662]/20 text-[#291662]'
                      } ${distancia ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setFiltroAberto(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Aplicar filtros ({filtrosContam})
        </button>
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
