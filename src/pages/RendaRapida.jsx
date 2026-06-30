import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import VagaModal from '../components/VagaModal'
import { CalendarIcon, ClockIcon, UserPinIcon, ChevronRight, MoneyIcon, StarIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'

const destaque = {
  id: 'recepcionista-evento',
  titulo: 'Recepcionista de Evento',
  empresa: 'Eventos SP',
  local: '2,4 km de você',
  modalidade: 'Presencial',
  horario: 'Hoje, 20:00h',
  salario: 'R$ 180',
  descricao: 'Recepção e credenciamento de convidados em evento corporativo. Não é necessária experiência prévia.',
}

const outras = [
  { id: 'garconete', titulo: 'Garçonete', km: '7,0 km', dia: 'Sexta', hora: '14:00h', valor: 'R$180', bg: 'bg-[#FBE3C9]', emoji: '🍽️', empresa: 'Buffet Real', local: '7,0 km de você', modalidade: 'Presencial', horario: 'Sexta, 14:00h', salario: 'R$180', descricao: 'Atendimento às mesas e apoio no salão durante evento.' },
  { id: 'limpeza', titulo: 'Auxiliar de limpeza', km: '15 km', dia: 'Sábado', hora: '8:00h', valor: 'R$200', bg: 'bg-[#E6D6F8]', emoji: '🧹', empresa: 'Clean Mais', local: '15 km de você', modalidade: 'Presencial', horario: 'Sábado, 8:00h', salario: 'R$200', descricao: 'Limpeza pós-evento de espaço para festas.' },
  { id: 'producao', titulo: 'Assistente de produção', km: '11,5 km', dia: '3 dias', hora: null, valor: 'R$600', bg: 'bg-[#E2E2E2]', emoji: '📦', empresa: 'Produtora Cena', local: '11,5 km de você', modalidade: 'Presencial', horario: 'Por 3 dias', salario: 'R$600', descricao: 'Apoio à equipe de produção na montagem e logística do evento.' },
]

const rendimentos = [
  { titulo: 'Recepcionista de Evento', valor: 'R$ 180' },
  { titulo: 'Garçonete', valor: 'R$ 180' },
  { titulo: 'Auxiliar de limpeza', valor: 'R$ 200' },
  { titulo: 'Assistente de produção', valor: 'R$ 220' },
]

const avaliacoes = [
  {
    id: 'eventos-sp',
    contratante: 'Eventos SP',
    servico: 'Recepcionista de Evento',
    data: '12/06/2026',
    nota: '8.0',
    comentarioCurto: 'Pontual, educada e muito comprometida.',
    comentarioCompleto:
      'Daniele chegou no horário, atendeu bem os convidados e demonstrou muita responsabilidade durante todo o evento.',
  },
  {
    id: 'buffet-central',
    contratante: 'Buffet Central',
    servico: 'Garçonete',
    data: '08/06/2026',
    nota: '7.5',
    comentarioCurto: 'Trabalhou bem em equipe e entregou tudo corretamente.',
    comentarioCompleto:
      'Teve boa postura, ajudou a equipe durante o atendimento e concluiu as atividades combinadas.',
  },
  {
    id: 'producoes-abc',
    contratante: 'Produções ABC',
    servico: 'Assistente de produção',
    data: '03/06/2026',
    nota: '7.3',
    comentarioCurto: 'Boa comunicação e responsabilidade.',
    comentarioCompleto:
      'Manteve boa comunicação com a equipe, seguiu as orientações e demonstrou comprometimento.',
  },
]

export default function RendaRapida() {
  const navigate = useNavigate()
  const [vagaSel, setVagaSel] = useState(null)
  const [saldoAberto, setSaldoAberto] = useState(false)
  const [reputacaoAberta, setReputacaoAberta] = useState(false)
  const [salvos, setSalvos] = useState(() => getSalvos().map((s) => s.id))

  const salvarFreela = (f) => {
    const sid = `freela-${f.id}`
    addSalvo({
      id: sid,
      tipo: 'freela',
      titulo: f.titulo,
      subtitulo: f.horario || f.quando || '',
      valor: f.salario || f.valor || '',
      origem: 'Renda Rápida',
    })
    setSalvos((prev) => (prev.includes(sid) ? prev : [...prev, sid]))
  }
  const [avaliacaoSel, setAvaliacaoSel] = useState(null)

  const whatsappDestaque =
    'https://wa.me/5511999999999?text=Ol%C3%A1%21%20Tenho%20interesse%20na%20oportunidade%20Recepcionista%20de%20Evento%20pelo%20TrajetEla.'

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Renda Rápida" subtitle="10 novas vagas adicionadas" />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Próxima a você */}
        <h3 className="font-bold text-[#291662]">Próxima a você</h3>
        <div className="mt-3 rounded-2xl border border-[#F3B6C9] bg-gradient-to-br from-[#FCEEF1] to-[#F9E1E8] p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-[16px] font-bold text-[#291662]">Recepcionista de Evento</h4>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#291662]/80">
                <span className="flex items-center gap-1"><UserPinIcon className="h-4 w-4" /> 2,4 km</span>
                <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> Hoje</span>
                <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> 20:00h</span>
              </div>
              <p className="mt-1 text-[13px] text-[#291662]/80">Eventos SP</p>
            </div>
            <p className="text-xl font-bold text-[#D6479B]">R$ 180</p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setVagaSel(destaque)}
              className="flex-1 rounded-full border border-[#D6479B] bg-white py-2.5 text-[13px] font-semibold text-[#291662] transition-transform active:scale-95"
            >
              Ver detalhes
            </button>
            <a
              href={whatsappDestaque}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-2.5 text-center text-[13px] font-semibold text-white transition-transform active:scale-95"
            >
              Tenho interesse
            </a>
          </div>
        </div>

        {/* Outras oportunidades */}
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h3 className="font-bold text-[#291662]">Outras oportunidades</h3>
          <button
            type="button"
            onClick={() => navigate('/freelas')}
            className="text-[14px] font-medium text-[#291662]/70 active:text-[#8F55E9]"
          >
            Ver todas
          </button>
        </div>
        <div className="rounded-2xl border border-[#8F55E9]/25 bg-white p-2 shadow-sm">
          {outras.map((o, i) => (
            <div
              key={o.id}
              role="button"
              tabIndex={0}
              onClick={() => setVagaSel(o)}
              onKeyDown={(e) => e.key === 'Enter' && setVagaSel(o)}
              className={`flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors active:bg-[#F6F1FE] ${
                i < outras.length - 1 ? 'border-b border-[#291662]/10' : ''
              }`}
            >
              <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl text-2xl ${o.bg}`}>
                {o.emoji}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#291662]">{o.titulo}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#291662]/75">
                  <span className="flex items-center gap-0.5"><UserPinIcon className="h-3.5 w-3.5" /> {o.km}</span>
                  <span className="flex items-center gap-0.5"><CalendarIcon className="h-3.5 w-3.5" /> {o.dia}</span>
                  {o.hora && <span className="flex items-center gap-0.5"><ClockIcon className="h-3.5 w-3.5" /> {o.hora}</span>}
                </div>
              </div>
              <span className="flex items-center gap-0.5 font-bold text-[#D6479B]">
                {o.valor} <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          ))}
        </div>

        {/* Saldo e reputação */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSaldoAberto(true)}
            className="cursor-pointer rounded-2xl border border-[#8F55E9]/20 bg-white p-4 text-left shadow-sm transition-transform hover:border-[#8F55E9]/40 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 text-[#291662]">
              <MoneyIcon className="h-6 w-6 text-[#2EA043]" />
              <span className="font-bold">Seu saldo</span>
            </div>
            <p className="mt-2 text-[13px] text-[#291662]/70">Este mês</p>
            <p className="text-lg font-bold text-[#291662]">R$ 780</p>
          </button>
          <button
            type="button"
            onClick={() => setReputacaoAberta(true)}
            className="cursor-pointer rounded-2xl border border-[#8F55E9]/20 bg-white p-4 text-left shadow-sm transition-transform hover:border-[#8F55E9]/40 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 text-[#291662]">
              <StarIcon className="h-6 w-6 text-[#F4B400]" />
              <span className="font-bold">Sua reputação</span>
            </div>
            <p className="mt-2 text-[13px] text-[#291662]/70">Este mês</p>
            <p className="text-lg font-bold text-[#291662]">7.6</p>
          </button>
        </div>
      </div>

      {/* Modal de detalhes da vaga */}
      <VagaModal
        open={!!vagaSel}
        onClose={() => setVagaSel(null)}
        vaga={vagaSel}
        salvarLabel="Salvar oportunidade"
        salvo={!!vagaSel && salvos.includes(`freela-${vagaSel.id}`)}
        onSalvar={() => vagaSel && salvarFreela(vagaSel)}
      />

      {/* Modal Seu saldo */}
      <Modal open={saldoAberto} onClose={() => setSaldoAberto(false)} title="Seu saldo">
        <p className="-mt-2 text-[14px] font-semibold text-[#291662]">Rendimentos deste mês</p>
        <div className="mt-3 divide-y divide-[#291662]/10">
          {rendimentos.map((r) => (
            <div key={r.titulo} className="flex items-center justify-between py-3 text-[14px]">
              <span className="text-[#291662]">{r.titulo}</span>
              <span className="font-bold text-[#2EA043]">{r.valor}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
          <span className="text-[14px] font-semibold text-[#291662]">Total</span>
          <span className="text-lg font-bold text-[#291662]">R$ 780</span>
        </div>
        <button
          type="button"
          onClick={() => setSaldoAberto(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Fechar
        </button>
      </Modal>

      {/* Modal Sua reputação (lista de avaliações clicáveis) */}
      <Modal open={reputacaoAberta} onClose={() => setReputacaoAberta(false)} title="Sua reputação">
        <p className="-mt-2 text-[14px] font-semibold text-[#291662]">Avaliações de contratantes</p>
        <div className="mt-3 space-y-3">
          {avaliacoes.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAvaliacaoSel(a)}
              className="w-full rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3 text-left transition-transform hover:border-[#8F55E9]/40 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#291662]">{a.contratante}</span>
                <span className="flex items-center gap-1 text-[14px] font-bold text-[#291662]">
                  <StarIcon className="h-4 w-4 text-[#F4B400]" /> {a.nota}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-[13px] text-[#291662]/80">“{a.comentarioCurto}”</p>
                <ChevronRight className="h-4 w-4 flex-none text-[#291662]/40" />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
          <span className="text-[14px] font-semibold text-[#291662]">Média</span>
          <span className="text-lg font-bold text-[#291662]">7.6</span>
        </div>
        <button
          type="button"
          onClick={() => setReputacaoAberta(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Fechar
        </button>
      </Modal>

      {/* Modal de detalhes de uma avaliação */}
      <Modal open={!!avaliacaoSel} onClose={() => setAvaliacaoSel(null)} title={avaliacaoSel?.contratante}>
        {avaliacaoSel && (
          <>
            <div className="space-y-2 text-[14px] text-[#291662]">
              <p><span className="font-semibold">Contratante:</span> {avaliacaoSel.contratante}</p>
              <p><span className="font-semibold">Serviço:</span> {avaliacaoSel.servico}</p>
              <p><span className="font-semibold">Data:</span> {avaliacaoSel.data}</p>
              <p className="flex items-center gap-1">
                <span className="font-semibold">Nota:</span>
                <StarIcon className="h-4 w-4 text-[#F4B400]" /> {avaliacaoSel.nota}
              </p>
            </div>
            <div className="mt-4 rounded-2xl bg-[#F6F1FE] p-4">
              <p className="text-[13px] font-semibold text-[#291662]">Comentário completo</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#291662]/80">“{avaliacaoSel.comentarioCompleto}”</p>
            </div>
            <button
              type="button"
              onClick={() => setAvaliacaoSel(null)}
              className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
            >
              Voltar
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
