import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import { SearchIcon, FilterIcon, UserPinIcon, CalendarIcon, ClockIcon } from '../components/Icons'
import {
  getFreelasAtivos,
  contarFreelasAtivos,
  assinarFreelas,
  formatarValor,
  formatarData,
  normalizarTexto,
} from '../utils/freelasService'
import { useLocalizacao, distanciaValida, formatarDistancia } from '../utils/geolocalizacao'

const grupos = [
  { titulo: 'Distância', opcoes: ['Até 2 km', 'Até 5 km', 'Até 10 km', 'Até 20 km', 'Até 30 km'] },
  { titulo: 'Data', opcoes: ['Hoje', 'Esta semana', 'Este mês'] },
  { titulo: 'Categoria', opcoes: ['Audiovisual', 'Atendimento', 'Beleza', 'Cozinha', 'Cuidados', 'Eventos', 'Limpeza', 'Marketing', 'Produção', 'Tecnologia', 'Outros'] },
  { titulo: 'Valor', opcoes: ['Até R$100', 'R$100 a R$300', 'Acima de R$300'] },
]

const OPCOES_DISTANCIA = ['Até 2 km', 'Até 5 km', 'Até 10 km', 'Até 20 km', 'Até 30 km']
const OPCOES_DATA = ['Hoje', 'Esta semana', 'Este mês']
const OPCOES_CATEGORIA = ['Audiovisual', 'Atendimento', 'Beleza', 'Cozinha', 'Cuidados', 'Eventos', 'Limpeza', 'Marketing', 'Produção', 'Tecnologia', 'Outros']
const OPCOES_VALOR = ['Até R$100', 'R$100 a R$300', 'Acima de R$300']

function dentroDaData(dataServico, opcoes) {
  const selec = opcoes.filter((o) => OPCOES_DATA.includes(o))
  if (selec.length === 0) return true
  if (!dataServico) return false
  const d = new Date(`${dataServico}T00:00:00`)
  if (Number.isNaN(d.getTime())) return false
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dia = 24 * 60 * 60 * 1000
  return selec.some((o) => {
    if (o === 'Hoje') return d.getTime() === hoje.getTime()
    if (o === 'Esta semana') return d >= hoje && d <= new Date(hoje.getTime() + 7 * dia)
    if (o === 'Este mês') return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
    return true
  })
}

function dentroDoValor(freela, opcoes) {
  const selec = opcoes.filter((o) => OPCOES_VALOR.includes(o))
  if (selec.length === 0) return true
  const v = freela.valor_min != null ? Number(freela.valor_min) : null
  if (v == null) return false
  return selec.some((o) => {
    if (o === 'Até R$100') return v <= 100
    if (o === 'R$100 a R$300') return v >= 100 && v <= 300
    if (o === 'Acima de R$300') return v > 300
    return true
  })
}

function dentroDaDistancia(freela, opcoes, preciso) {
  const selec = opcoes.filter((o) => OPCOES_DISTANCIA.includes(o))
  if (selec.length === 0) return true
  if (!preciso) return true // sem localização precisa, o filtro não exclui
  if (freela.distancia_km == null) return true
  const limite = Math.max(...selec.map((o) => parseInt(o.replace(/\D/g, ''), 10)))
  return freela.distancia_km <= limite
}

export default function Freelas() {
  const navigate = useNavigate()
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState([])
  const [busca, setBusca] = useState('')

  const [freelas, setFreelas] = useState([])
  const [total, setTotal] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const montadoRef = useRef(true)

  const { coords, preciso, obtendo, aviso } = useLocalizacao()

  const recarregar = async () => {
    const [{ data, error }, { count }] = await Promise.all([getFreelasAtivos(), contarFreelasAtivos()])
    if (!montadoRef.current) return
    if (!error) setFreelas(data)
    setTotal(count || 0)
  }

  useEffect(() => {
    montadoRef.current = true

    async function carregar() {
      setCarregando(true)
      setErro('')
      const [{ data, error }, { count }] = await Promise.all([getFreelasAtivos(), contarFreelasAtivos()])
      if (!montadoRef.current) return
      if (error) {
        setErro('Não foi possível carregar as oportunidades. Tente novamente.')
        setFreelas([])
      } else {
        setFreelas(data)
      }
      setTotal(count || 0)
      setCarregando(false)
    }

    carregar()
    const cancelar = assinarFreelas(() => recarregar())

    return () => {
      montadoRef.current = false
      cancelar()
    }
  }, [])

  const toggleFiltro = (op) =>
    setFiltros((p) => (p.includes(op) ? p.filter((x) => x !== op) : [...p, op]))

  const limparFiltros = () => setFiltros([])

  const distanciaSelecionada = filtros.some((f) => OPCOES_DISTANCIA.includes(f))

  const lista = useMemo(() => {
    const termo = normalizarTexto(busca)
    const categoriasSel = filtros.filter((f) => OPCOES_CATEGORIA.includes(f))

    return freelas
      .map((f) => {
        const distancia_km = distanciaValida(coords, f.latitude, f.longitude)
        return {
          ...f,
          distancia_km,
          valorTexto: formatarValor(f),
          dataTexto: formatarData(f.data_servico),
          distanciaTexto: formatarDistancia(distancia_km),
          localCard: [f.bairro, f.cidade].filter(Boolean).join(' · '),
        }
      })
      .filter((f) => {
        if (termo) {
          const alvo = [f.titulo, f.contratante, f.categoria, f.cidade, f.bairro].map(normalizarTexto).join(' ')
          if (!alvo.includes(termo)) return false
        }
        if (categoriasSel.length && !categoriasSel.some((c) => normalizarTexto(c) === normalizarTexto(f.categoria))) return false
        if (!dentroDaData(f.data_servico, filtros)) return false
        if (!dentroDoValor(f, filtros)) return false
        if (!dentroDaDistancia(f, filtros, preciso)) return false
        return true
      })
      .sort((a, b) => {
        const da = a.distancia_km == null ? Infinity : a.distancia_km
        const db = b.distancia_km == null ? Infinity : b.distancia_km
        if (da !== db) return da - db
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [freelas, busca, filtros, coords, preciso])

  const subtitulo = total === 1 ? '1 oportunidade ativa' : `${total} oportunidades ativas`

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Freelas" subtitle={subtitulo} />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Busca */}
        <div className="flex items-center gap-2 rounded-full border border-[#291662]/15 bg-white px-4 py-3 shadow-sm">
          <SearchIcon className="h-5 w-5 text-[#291662]/60" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar freela, região ou serviço..."
            className="w-full bg-transparent text-[14px] text-[#291662] outline-none placeholder:text-[#291662]/45"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltroAberto(true)}
            className="flex items-center gap-2 rounded-full border border-[#291662]/20 px-4 py-2 text-[14px] font-medium text-[#291662] active:bg-[#F6F1FE]"
          >
            <FilterIcon className="h-4 w-4" /> Filtro ({filtros.length})
          </button>
        </div>

        {obtendo && <p className="mt-3 text-[13px] font-medium text-[#8F55E9]">Obtendo localização...</p>}
        {aviso && !obtendo && <p className="mt-3 text-[13px] font-medium text-[#8F55E9]">{aviso}</p>}
        {distanciaSelecionada && !preciso && !obtendo && (
          <p className="mt-3 text-[13px] font-medium text-[#8F55E9]">
            Ative uma localização precisa para utilizar o filtro de distância.
          </p>
        )}

        {/* Lista de freelas */}
        <div className="mt-4 space-y-4">
          {carregando ? (
            <p className="py-8 text-center text-[14px] font-medium text-[#291662]/70">Carregando oportunidades...</p>
          ) : erro ? (
            <p className="py-8 text-center text-[14px] font-medium text-[#D6479B]">{erro}</p>
          ) : lista.length === 0 ? (
            <p className="py-8 text-center text-[14px] font-medium text-[#291662]/70">
              Nenhuma oportunidade disponível no momento.
            </p>
          ) : (
            lista.map((f) => (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/freelas/${f.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/freelas/${f.id}`)}
                className="cursor-pointer rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#291662]">{f.titulo}</h3>
                    <p className="text-[14px] text-[#291662]/80">{f.contratante}</p>
                  </div>
                  <p className="flex-none text-[17px] font-bold text-[#D6479B]">{f.valorTexto}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#291662]/80">
                  <span className="flex items-center gap-1">
                    <UserPinIcon className="h-4 w-4" /> {f.distanciaTexto ? `${f.distanciaTexto} de você` : f.localCard}
                  </span>
                  {f.dataTexto && <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {f.dataTexto}</span>}
                  {f.horario && <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {f.horario}</span>}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#291662]/10 pt-3">
                  {f.categoria ? (
                    <span className="rounded-full bg-[#F1EAFD] px-3 py-1 text-[12px] font-medium text-[#8F55E9]">
                      {f.categoria}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[15px] font-bold text-[#291662]">Detalhes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
        <button
          type="button"
          onClick={() => setFiltroAberto(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Aplicar filtros ({filtros.length})
        </button>
        {filtros.length > 0 && (
          <button
            type="button"
            onClick={limparFiltros}
            className="mt-3 w-full rounded-full border border-[#8F55E9] py-3.5 text-[15px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
          >
            Limpar filtros
          </button>
        )}
      </Modal>
    </PageContainer>
  )
}
