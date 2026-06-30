import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import { SearchIcon, FilterIcon, GridIcon, UserPinIcon, CalendarIcon, ClockIcon } from '../components/Icons'

const chips = [
  'Próximos a você',
  'Hoje',
  'Esta semana',
  'Até 5 km',
  'Até 15 km',
  'Eventos',
  'Limpeza',
  'Atendimento',
  'Produção',
  'Cozinha',
]

const grupos = [
  { titulo: 'Distância', opcoes: ['Até 5 km', 'Até 10 km', 'Até 15 km', 'Qualquer distância'] },
  { titulo: 'Data', opcoes: ['Hoje', 'Amanhã', 'Esta semana', 'Este mês'] },
  { titulo: 'Categoria', opcoes: ['Eventos', 'Limpeza', 'Atendimento', 'Produção', 'Cozinha'] },
  { titulo: 'Valor', opcoes: ['Até R$100', 'R$100 a R$300', 'Acima de R$300'] },
]

const freelas = [
  { id: 'recepcionista', titulo: 'Recepcionista de Evento', contratante: 'Eventos SP', local: '2,4 km', data: 'Hoje', horario: '20:00h', valor: 'R$180', categoria: 'Eventos', descricao: 'Recepção e credenciamento de convidados em evento corporativo.' },
  { id: 'garconete', titulo: 'Garçonete', contratante: 'Buffet Central', local: '7,0 km', data: 'Sexta', horario: '14:00h', valor: 'R$180', categoria: 'Cozinha/Eventos', descricao: 'Atendimento às mesas e apoio no salão durante o evento.' },
  { id: 'limpeza', titulo: 'Auxiliar de limpeza', contratante: 'Limpeza Express', local: '15 km', data: 'Sábado', horario: '08:00h', valor: 'R$200', categoria: 'Limpeza', descricao: 'Limpeza e organização do espaço após o evento.' },
  { id: 'producao', titulo: 'Assistente de produção', contratante: 'Produções ABC', local: '11,5 km', data: '3 dias', horario: '09:00h', valor: 'R$600', categoria: 'Produção', descricao: 'Apoio à equipe de produção na montagem e logística do evento.' },
  { id: 'atendente', titulo: 'Atendente temporária', contratante: 'Loja Central', local: '4,8 km', data: 'Amanhã', horario: '10:00h', valor: 'R$150', categoria: 'Atendimento', descricao: 'Atendimento ao cliente e organização da loja.' },
  { id: 'evento-infantil', titulo: 'Apoio em evento infantil', contratante: 'Kids Party', local: '6,2 km', data: 'Domingo', horario: '13:00h', valor: 'R$220', categoria: 'Eventos', descricao: 'Apoio em recreação e organização de festa infantil.' },
]

export default function Freelas() {
  const [chipsAtivos, setChipsAtivos] = useState(['Próximos a você'])
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState([])
  const [freelaSel, setFreelaSel] = useState(null)
  const [salvos, setSalvos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trajetela_freelas_salvos') || '[]')
    } catch {
      return []
    }
  })

  const toggleChip = (c) =>
    setChipsAtivos((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  const toggleFiltro = (op) =>
    setFiltros((p) => (p.includes(op) ? p.filter((x) => x !== op) : [...p, op]))

  const salvarOportunidade = (id) => {
    setSalvos((prev) => {
      const novo = prev.includes(id) ? prev : [...prev, id]
      localStorage.setItem('trajetela_freelas_salvos', JSON.stringify(novo))
      return novo
    })
  }

  const whatsappLink = (titulo) =>
    `https://wa.me/5511999999999?text=${encodeURIComponent(
      `Olá! Tenho interesse na oportunidade de ${titulo} pelo TrajetEla.`,
    )}`

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Freelas" subtitle="12 oportunidades próximas a você" />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Busca */}
        <div className="flex items-center gap-2 rounded-full border border-[#291662]/15 bg-white px-4 py-3 shadow-sm">
          <SearchIcon className="h-5 w-5 text-[#291662]/60" />
          <input
            placeholder="Buscar freela, região ou serviço..."
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

        {/* Lista de freelas */}
        <div className="mt-4 space-y-4">
          {freelas.map((f) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => setFreelaSel(f)}
              onKeyDown={(e) => e.key === 'Enter' && setFreelaSel(f)}
              className="cursor-pointer rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[17px] font-bold text-[#291662]">{f.titulo}</h3>
                  <p className="text-[14px] text-[#291662]/80">{f.contratante}</p>
                </div>
                <p className="flex-none text-[17px] font-bold text-[#D6479B]">{f.valor}</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#291662]/80">
                <span className="flex items-center gap-1"><UserPinIcon className="h-4 w-4" /> {f.local}</span>
                <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {f.data}</span>
                <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {f.horario}</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#291662]/10 pt-3">
                <span className="rounded-full bg-[#F1EAFD] px-3 py-1 text-[12px] font-medium text-[#8F55E9]">
                  {f.categoria}
                </span>
                <span className="text-[15px] font-bold text-[#291662]">Detalhes</span>
              </div>
            </div>
          ))}
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
      </Modal>

      {/* Modal de detalhes do freela */}
      <Modal open={!!freelaSel} onClose={() => setFreelaSel(null)} title={freelaSel?.titulo}>
        {freelaSel && (
          <>
            <p className="-mt-2 text-[14px] text-[#291662]/80">{freelaSel.contratante}</p>

            <div className="mt-4 space-y-2 text-[14px] text-[#291662]">
              <p className="flex items-center gap-2"><UserPinIcon className="h-4 w-4 text-[#E84C8A]" /> {freelaSel.local}</p>
              <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-[#8F55E9]" /> {freelaSel.data}</p>
              <p className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-[#8F55E9]" /> {freelaSel.horario}</p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
              <span className="text-lg font-bold text-[#291662]">{freelaSel.valor}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#8F55E9]">{freelaSel.categoria}</span>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-[#291662]/80">{freelaSel.descricao}</p>

            <a
              href={whatsappLink(freelaSel.titulo)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-3.5 text-center text-[15px] font-semibold text-white"
            >
              Tenho interesse
            </a>
            <button
              type="button"
              onClick={() => salvarOportunidade(freelaSel.id)}
              disabled={salvos.includes(freelaSel.id)}
              className={`mt-3 w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
                salvos.includes(freelaSel.id)
                  ? 'border-[#2EA043] text-[#2EA043]'
                  : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
              }`}
            >
              {salvos.includes(freelaSel.id) ? '✓ Oportunidade salva' : 'Salvar oportunidade'}
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
