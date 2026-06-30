import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import { PinIcon, CalendarIcon, ClockIcon, UserPinIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'

const PART_KEY = 'trajetela_portas_participacoes'

const filtros = ['Todas', 'Visitas Técnicas', 'Imersões', 'Eventos', 'Roda de Conversa', 'Lideranças', 'Corporativo']

const proxima = {
  id: 'google',
  nome: 'Visita Técnica - Google Brasil',
  categoria: 'Visita Técnica',
  filtro: 'Visitas Técnicas',
  data: '15 Agosto',
  horario: '09:00',
  local: 'São Paulo - SP',
  vagas: 30,
  descricao: 'Conheça por dentro um dos maiores ambientes de tecnologia do país, com tour guiado e conversa com profissionais da área.',
}

const experiencias = [
  { id: 'senac', nome: 'Centro de Inovação SENAC', categoria: 'Visita Técnica', filtro: 'Visitas Técnicas', data: '20 Agosto', horario: '09:00', local: 'São Paulo - SP', vagas: 20, descricao: 'Visita ao centro de inovação para conhecer laboratórios, projetos e metodologias de ensino aplicadas ao mercado.' },
  { id: 'bastidores', nome: 'Bastidores do Mercado de Tecnologia', categoria: 'Imersão', filtro: 'Imersões', data: '27 Agosto', horario: '14:00', local: 'São Paulo - SP', vagas: 50, descricao: 'Imersão de um dia nos bastidores de empresas de tecnologia, com painéis e dinâmicas práticas.' },
  { id: 'mulheres', nome: 'Mulheres que Transformam Negócios', categoria: 'Lideranças Femininas', filtro: 'Lideranças', convidada: 'Rachel Maia', data: '10 Setembro', horario: '19:00', local: 'São Paulo - SP', vagas: 100, descricao: 'Encontro com lideranças femininas que estão transformando o mercado, com troca de experiências e networking.' },
  { id: 'marca', nome: 'Construindo uma Marca do Zero', categoria: 'Empreendedorismo', filtro: 'Eventos', convidada: 'Nath Finanças', data: '15 Setembro', horario: '19:30', local: 'São Paulo - SP', vagas: 80, descricao: 'Workshop prático sobre como construir uma marca do zero, do posicionamento à presença digital.' },
]

function ler(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export default function PortasAbertas() {
  const [filtro, setFiltro] = useState('Todas')
  const [expSel, setExpSel] = useState(null)
  const [salvos, setSalvos] = useState(() => getSalvos().map((s) => s.id))
  const [participacoes, setParticipacoes] = useState(() => ler(PART_KEY))

  const participar = (e) => {
    setParticipacoes((prev) => {
      if (prev.includes(e.id)) return prev
      const novo = [...prev, e.id]
      localStorage.setItem(PART_KEY, JSON.stringify(novo))
      return novo
    })
  }

  const salvarExperiencia = (e) => {
    const sid = `evento-${e.id}`
    addSalvo({
      id: sid,
      tipo: 'evento',
      titulo: e.nome,
      subtitulo: `${e.categoria} • ${e.data}${e.convidada ? ` • ${e.convidada}` : ''}`,
      valor: `${e.vagas} vagas`,
      origem: 'Portas Abertas',
    })
    setSalvos((prev) => (prev.includes(sid) ? prev : [...prev, sid]))
  }

  const lista = filtro === 'Todas' ? experiencias : experiencias.filter((e) => e.filtro === filtro)

  const indicadores = [
    { label: 'Empresas visitadas', valor: 2 },
    { label: 'Eventos participados', valor: participacoes.length },
    { label: 'Networking realizados', valor: 5 },
    { label: 'Experiências concluídas', valor: 1 },
  ]

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Portas Abertas" />

      <p className="px-6 pt-3 text-center text-[14px] text-[#291662]/80">
        Experiências que aproximam você do mercado de trabalho.
      </p>

      <div className="mx-4 mb-6 mt-4 rounded-[28px] border border-[#8F55E9]/25 bg-white px-5 pb-8 pt-6 shadow-sm">
        {/* Banner — Próxima experiência */}
        <h3 className="mb-3 font-bold text-[#291662]">Próxima experiência</h3>
        <div className="overflow-hidden rounded-2xl border border-[#8F55E9]/30 bg-gradient-to-br from-[#5B3FA0] to-[#8F55E9] p-5 text-white shadow-sm">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[12px] font-medium">{proxima.categoria}</span>
          <h4 className="mt-3 text-[18px] font-extrabold leading-tight">{proxima.nome}</h4>
          <div className="mt-3 space-y-1.5 text-[13px] text-white/90">
            <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> {proxima.data} • {proxima.horario}</p>
            <p className="flex items-center gap-2"><PinIcon className="h-4 w-4" /> {proxima.local}</p>
            <p className="flex items-center gap-2"><UserPinIcon className="h-4 w-4" /> {proxima.vagas} participantes</p>
          </div>
          <button
            type="button"
            onClick={() => participar(proxima)}
            disabled={participacoes.includes(proxima.id)}
            className={`mt-4 w-full rounded-full py-3 text-[14px] font-bold transition-colors ${
              participacoes.includes(proxima.id) ? 'bg-white/30 text-white' : 'bg-white text-[#291662]'
            }`}
          >
            {participacoes.includes(proxima.id) ? 'Inscrição confirmada ✓' : 'Quero participar'}
          </button>
        </div>

        {/* Filtros */}
        <div className="-mx-5 mt-6 flex flex-nowrap gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtros.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                filtro === f
                  ? 'border-[#8F55E9] bg-[#8F55E9] text-white'
                  : 'border-[#8F55E9]/40 bg-white/50 text-[#291662]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Próximas experiências */}
        <h3 className="mb-3 mt-6 font-bold text-[#291662]">Próximas experiências</h3>
        <div className="space-y-3">
          {lista.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
              Nenhuma experiência neste filtro.
            </p>
          ) : (
            lista.map((e) => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                onClick={() => setExpSel(e)}
                onKeyDown={(ev) => ev.key === 'Enter' && setExpSel(e)}
                className="cursor-pointer rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
              >
                <span className="inline-block rounded-full bg-[#F1EAFD] px-3 py-1 text-[11px] font-medium text-[#8F55E9]">{e.categoria}</span>
                <h4 className="mt-2 text-[15px] font-bold leading-tight text-[#291662]">{e.nome}</h4>
                {e.convidada && <p className="mt-0.5 text-[12px] text-[#291662]/70">com {e.convidada}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#291662]/80">
                  <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {e.data}</span>
                  <span className="flex items-center gap-1"><PinIcon className="h-4 w-4" /> {e.local}</span>
                  <span className="flex items-center gap-1"><UserPinIcon className="h-4 w-4" /> {e.vagas} vagas</span>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      setExpSel(e)
                    }}
                    className="flex-1 rounded-full border border-[#8F55E9] py-2.5 text-[13px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
                  >
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      salvarExperiencia(e)
                    }}
                    disabled={salvos.includes(`evento-${e.id}`)}
                    className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold text-white ${
                      salvos.includes(`evento-${e.id}`) ? 'bg-[#A98BE0]' : 'bg-[#8F55E9]'
                    }`}
                  >
                    {salvos.includes(`evento-${e.id}`) ? 'Salva ✓' : 'Salvar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Seu impacto */}
        <h3 className="mb-3 mt-7 font-bold text-[#291662]">Seu impacto</h3>
        <div className="grid grid-cols-2 gap-3">
          {indicadores.map((i) => (
            <div key={i.label} className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-4 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-[#8F55E9]">{i.valor}</p>
              <p className="mt-1 text-[12px] leading-tight text-[#291662]/80">{i.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[#291662]/60">
          Seu impacto vai alimentar a área de Conquistas do seu perfil.
        </p>
      </div>

      {/* Modal de detalhes da experiência */}
      <Modal open={!!expSel} onClose={() => setExpSel(null)} title={expSel?.nome}>
        {expSel && (
          <>
            <span className="inline-block rounded-full bg-[#F1EAFD] px-3 py-1 text-[12px] font-medium text-[#8F55E9]">{expSel.categoria}</span>
            {expSel.convidada && <p className="mt-2 text-[14px] text-[#291662]/80">com {expSel.convidada}</p>}

            <p className="mt-4 text-[14px] leading-relaxed text-[#291662]/80">{expSel.descricao}</p>

            <div className="mt-4 space-y-2 text-[14px] text-[#291662]">
              <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-[#8F55E9]" /> {expSel.data}{expSel.horario ? ` • ${expSel.horario}` : ''}</p>
              <p className="flex items-center gap-2"><PinIcon className="h-4 w-4 text-[#E84C8A]" /> {expSel.local}</p>
              <p className="flex items-center gap-2"><UserPinIcon className="h-4 w-4 text-[#8F55E9]" /> {expSel.vagas} vagas</p>
            </div>

            <button
              type="button"
              onClick={() => participar(expSel)}
              disabled={participacoes.includes(expSel.id)}
              className={`mt-6 w-full rounded-full py-3.5 text-[15px] font-semibold text-white transition-colors ${
                participacoes.includes(expSel.id) ? 'bg-[#A98BE0]' : 'bg-[#8F55E9]'
              }`}
            >
              {participacoes.includes(expSel.id) ? 'Inscrição confirmada' : 'Quero participar'}
            </button>
            {participacoes.includes(expSel.id) && (
              <p className="mt-2 text-center text-[14px] font-medium text-[#2EA043]">Inscrição realizada com sucesso.</p>
            )}

            <button
              type="button"
              onClick={() => salvarExperiencia(expSel)}
              disabled={salvos.includes(`evento-${expSel.id}`)}
              className={`mt-3 w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
                salvos.includes(`evento-${expSel.id}`)
                  ? 'border-[#2EA043] text-[#2EA043]'
                  : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
              }`}
            >
              {salvos.includes(`evento-${expSel.id}`) ? '✓ Experiência salva' : 'Salvar experiência'}
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
