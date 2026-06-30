import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import VagaModal from '../components/VagaModal'
import { SearchIcon, FilterIcon, PinIcon, GridIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'

const chips = ['Recomendadas', 'São Paulo - SP', 'Primeiro Emprego']

const grupos = [
  { titulo: 'Cidade', opcoes: ['São Paulo', 'Guarulhos', 'Osasco'] },
  { titulo: 'Modalidade', opcoes: ['Presencial', 'Híbrido', 'Remoto'] },
  { titulo: 'Tipo de vaga', opcoes: ['CLT', 'Temporário', 'Primeiro Emprego'] },
  { titulo: 'Área', opcoes: ['Administrativo', 'Atendimento', 'Financeiro'] },
  { titulo: 'Salário', opcoes: ['Até R$1.500', 'R$1.500–2.500', 'Acima de R$2.500'] },
  { titulo: 'Compatibilidade', opcoes: ['70%+', '80%+', '90%+'] },
]

const vagas = [
  { id: 'admin', titulo: 'Assistente Administrativo', empresa: 'Empresa XPTO', local: 'SãoPaulo . Híbrido', modalidade: 'Híbrido', compat: 94, horario: '08:00 às 17:00', salario: 'R$2.400', descricao: 'Rotinas administrativas, organização de documentos e suporte às áreas internas.' },
  { id: 'atendimento', titulo: 'Atendimento ao cliente', empresa: 'Empresa ABC', local: 'SãoPaulo . Híbrido', modalidade: 'Híbrido', compat: 78, horario: '14:00 às 20:00', salario: 'R$1.800', descricao: 'Atendimento a clientes por telefone e chat, com registro de solicitações.' },
  { id: 'financeiro', titulo: 'Auxiliar Financeiro', empresa: 'Finac', local: 'SãoPaulo . Híbrido', modalidade: 'Híbrido', compat: 89, horario: '08:00 às 16:00', salario: 'R$2.500', descricao: 'Apoio em contas a pagar e receber, conciliações e lançamentos.' },
  { id: 'lider', titulo: 'Líder de atendimento ao cliente', empresa: 'Interplayers', local: 'SãoPaulo . Híbrido', modalidade: 'Híbrido', compat: 74, horario: '08:00 às 20:00', salario: 'R$3.500', descricao: 'Liderança de equipe de atendimento, metas e qualidade do serviço.' },
]

export default function Vagas() {
  const [chipsAtivos, setChipsAtivos] = useState(['Recomendadas'])
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState([])
  const [vagaSel, setVagaSel] = useState(null)
  const [salvos, setSalvos] = useState(() => getSalvos().map((s) => s.id))

  const salvarVaga = (v) => {
    const sid = `vaga-${v.id}`
    addSalvo({
      id: sid,
      tipo: 'vaga_clt',
      titulo: v.titulo,
      subtitulo: v.empresa,
      valor: v.salario,
      origem: 'Vagas',
    })
    setSalvos((prev) => (prev.includes(sid) ? prev : [...prev, sid]))
  }

  const toggleChip = (c) =>
    setChipsAtivos((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  const toggleFiltro = (op) =>
    setFiltros((p) => (p.includes(op) ? p.filter((x) => x !== op) : [...p, op]))

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Vagas" subtitle="6 novas vagas adicionadas" />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Busca */}
        <div className="flex items-center gap-2 rounded-full border border-[#291662]/15 bg-white px-4 py-3 shadow-sm">
          <SearchIcon className="h-5 w-5 text-[#291662]/60" />
          <input
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
          {vagas.map((v) => (
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
                  <p className="mt-2 text-[15px] font-bold text-[#291662]">{v.salario}</p>
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
