import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import { PinIcon, CalendarIcon, ClockIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'

const PART_KEY = 'trajetela_autoridade_participacoes'
const CONQUISTAS_KEY = 'trajetela_conquistas'

const badges = [
  { emoji: '⭐', nome: 'Primeira Mentoria' },
  { emoji: '🎤', nome: 'Participou de Workshop' },
  { emoji: '🤝', nome: 'Nova Conexão' },
]

const eventos = [
  { id: 'financas', nome: 'Finanças sem Complicação', palestrante: 'Nath Finanças', data: '15 de Julho', horario: '19:00', local: 'Av. Paulista - São Paulo', tipo: 'Presencial', descricao: 'Aprenda na prática como organizar suas finanças, sair das dívidas e dar os primeiros passos para investir.' },
  { id: 'lideranca', nome: 'Liderança Feminina e Diversidade', palestrante: 'Rachel Maia', data: '18 de Julho', horario: '20:00', local: 'Vila Olímpia - São Paulo', tipo: 'Online', descricao: 'Uma conversa sobre liderança feminina, diversidade e como ocupar espaços de decisão.' },
  { id: 'empreendedorismo', nome: 'Empreendedorismo e Influência Digital', palestrante: 'Bruna Tavares', data: '21 de Julho', horario: '19:30', local: 'Pinheiros - São Paulo', tipo: 'Presencial', descricao: 'Como transformar presença digital em negócio e construir influência com propósito.' },
  { id: 'representatividade', nome: 'Representatividade e Transformação Social', palestrante: 'Erika Hilton', data: '24 de Julho', horario: '20:00', local: 'Centro Cultural São Paulo', tipo: 'Presencial', descricao: 'Representatividade, direitos e transformação social como motor de mudança.' },
  { id: 'primeiro-emprego', nome: 'Primeiro Emprego e Construção de Carreira', palestrante: 'Convidada Especial', data: '27 de Julho', horario: '19:00', local: 'Online', tipo: 'Online', descricao: 'Dicas para conquistar o primeiro emprego e construir uma carreira sólida desde o início.' },
]

const inspiracoes = [
  { nome: 'Nath Finanças', area: 'Educação financeira' },
  { nome: 'Rachel Maia', area: 'Liderança e negócios' },
  { nome: 'Bruna Tavares', area: 'Empreendedorismo e influência digital' },
  { nome: 'Erika Hilton', area: 'Representatividade e transformação social' },
]

function ler(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function calcularConquistas(n) {
  const c = []
  if (n >= 1) c.push('Primeira Mentoria')
  if (n >= 2) c.push('Participou de Workshop')
  if (n >= 3) c.push('Nova Conexão')
  return c
}

function iniciais(nome) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function Autoridade40() {
  const [participacoes, setParticipacoes] = useState(() => ler(PART_KEY))
  const [salvos, setSalvos] = useState(() => getSalvos().map((s) => s.id))
  const [eventoSel, setEventoSel] = useState(null)

  const conquistasAtuais = calcularConquistas(participacoes.length)
  const progresso = Math.min(100, 45 + participacoes.length * 18)

  const participar = (id) => {
    setParticipacoes((prev) => {
      if (prev.includes(id)) return prev
      const novo = [...prev, id]
      localStorage.setItem(PART_KEY, JSON.stringify(novo))
      localStorage.setItem(CONQUISTAS_KEY, JSON.stringify(calcularConquistas(novo.length)))
      return novo
    })
  }

  const salvarEvento = (e) => {
    const sid = `evento-${e.id}`
    addSalvo({
      id: sid,
      tipo: 'evento',
      titulo: e.nome,
      subtitulo: `${e.palestrante} • ${e.data} • ${e.horario}`,
      valor: e.tipo,
      origem: 'Autoridade por 40 Minutos',
    })
    setSalvos((prev) => (prev.includes(sid) ? prev : [...prev, sid]))
  }

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Autoridade por 40 Minutos" />

      <p className="px-6 pt-3 text-center text-[14px] text-[#291662]/80">
        Conecte-se com mulheres que estão transformando carreiras, negócios e comunidades.
      </p>

      <div className="mx-4 mb-6 mt-4 rounded-[28px] border border-[#8F55E9]/25 bg-white px-5 pb-8 pt-6 shadow-sm">
        {/* Gamificação */}
        <div className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#291662]">Sua Jornada de Autoridade</h2>
          <p className="mt-1 text-[13px] text-[#291662]/80">
            Nível atual: <span className="font-semibold">Conexões Iniciais</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E0D4F5]">
              <div className="h-full rounded-full bg-[#8F55E9]" style={{ width: `${progresso}%` }} />
            </div>
            <span className="text-[13px] font-bold text-[#291662]">{progresso}%</span>
          </div>
          <p className="mt-3 text-[12px] text-[#291662]/70">Próxima conquista:</p>
          <p className="text-[13px] font-medium text-[#291662]">Participar de 3 mentorias</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((b) => {
              const ativo = conquistasAtuais.includes(b.nome)
              return (
                <span
                  key={b.nome}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    ativo
                      ? 'border-[#8F55E9] bg-white text-[#291662]'
                      : 'border-[#291662]/15 bg-white/50 text-[#291662]/45'
                  }`}
                >
                  <span className={ativo ? '' : 'grayscale'}>{b.emoji}</span> {b.nome}
                </span>
              )
            })}
          </div>
        </div>

        {/* Próximos eventos */}
        <h3 className="mb-3 mt-7 font-bold text-[#291662]">Próximos eventos</h3>
        <div className="space-y-3">
          {eventos.map((e) => (
            <div
              key={e.id}
              role="button"
              tabIndex={0}
              onClick={() => setEventoSel(e)}
              onKeyDown={(ev) => ev.key === 'Enter' && setEventoSel(e)}
              className="cursor-pointer rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-[15px] font-bold text-[#291662]">{e.nome}</h4>
                  <p className="mt-0.5 text-[13px] text-[#291662]/75">com {e.palestrante}</p>
                </div>
                <span
                  className={`flex-none rounded-full px-3 py-1 text-[12px] font-medium ${
                    e.tipo === 'Online' ? 'bg-[#DDEFFB] text-[#2275B5]' : 'bg-[#F1EAFD] text-[#8F55E9]'
                  }`}
                >
                  {e.tipo}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#291662]/80">
                <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {e.data}</span>
                <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {e.horario}</span>
                <span className="flex items-center gap-1"><PinIcon className="h-4 w-4" /> {e.local}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Inspiração */}
        <h3 className="mb-3 mt-7 font-bold text-[#291662]">Mulheres que inspiram</h3>
        <div className="grid grid-cols-2 gap-3">
          {inspiracoes.map((m) => (
            <div key={m.nome} className="flex items-center gap-3 rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#B79BE6] to-[#8F55E9] text-[13px] font-bold text-white">
                {iniciais(m.nome)}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-tight text-[#291662]">{m.nome}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#291662]/70">{m.area}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal do evento */}
      <Modal open={!!eventoSel} onClose={() => setEventoSel(null)} title={eventoSel?.nome}>
        {eventoSel && (
          <>
            <p className="-mt-2 text-[14px] text-[#291662]/80">com {eventoSel.palestrante}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-[#291662]/80">{eventoSel.descricao}</p>

            <div className="mt-4 space-y-2 text-[14px] text-[#291662]">
              <p className="flex items-center gap-2"><PinIcon className="h-4 w-4 text-[#E84C8A]" /> {eventoSel.local}</p>
              <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-[#8F55E9]" /> {eventoSel.data}</p>
              <p className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-[#8F55E9]" /> {eventoSel.horario}</p>
            </div>

            <div className="mt-4 rounded-2xl bg-[#F6F1FE] px-4 py-3 text-center text-[13px] font-semibold text-[#291662]">
              Duração: 40 minutos
            </div>

            <button
              type="button"
              onClick={() => participar(eventoSel.id)}
              disabled={participacoes.includes(eventoSel.id)}
              className={`mt-6 w-full rounded-full py-3.5 text-[15px] font-semibold text-white transition-colors ${
                participacoes.includes(eventoSel.id) ? 'bg-[#A98BE0]' : 'bg-[#8F55E9]'
              }`}
            >
              {participacoes.includes(eventoSel.id) ? 'Inscrição confirmada' : 'Participar'}
            </button>
            {participacoes.includes(eventoSel.id) && (
              <p className="mt-2 text-center text-[14px] font-medium text-[#2EA043]">
                Inscrição realizada com sucesso.
              </p>
            )}

            <button
              type="button"
              onClick={() => salvarEvento(eventoSel)}
              disabled={salvos.includes(`evento-${eventoSel.id}`)}
              className={`mt-3 w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
                salvos.includes(`evento-${eventoSel.id}`)
                  ? 'border-[#2EA043] text-[#2EA043]'
                  : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
              }`}
            >
              {salvos.includes(`evento-${eventoSel.id}`) ? '✓ Evento salvo' : 'Salvar evento'}
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
