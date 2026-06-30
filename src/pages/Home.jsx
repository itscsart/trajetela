import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import VagaModal from '../components/VagaModal'
import { HeartIcon } from '../components/Icons'

const vagas = [
  { id: 'cozinha', titulo: 'Auxiliar de cozinha', compat: 92, bg: 'bg-[#FBE3C9]', emoji: '🍳', empresa: 'Restaurante Sabor & Cia', local: 'São Paulo - SP', modalidade: 'Presencial', horario: '08:00 às 16:00', salario: 'R$1.600', descricao: 'Apoio no preparo de alimentos, organização da cozinha e higienização de utensílios.' },
  { id: 'limpeza', titulo: 'Auxiliar de limpeza', compat: 86, bg: 'bg-[#E6D6F8]', emoji: '🧹', empresa: 'Clean Mais', local: 'São Paulo - SP', modalidade: 'Presencial', horario: '07:00 às 15:00', salario: 'R$1.500', descricao: 'Limpeza e conservação de ambientes corporativos, com material fornecido pela empresa.' },
  { id: 'caixa', titulo: 'Operador de Caixa', compat: 65, bg: 'bg-[#E2E2E2]', emoji: '🧮', empresa: 'Mercado Bom Preço', local: 'São Paulo - SP', modalidade: 'Presencial', horario: '14:00 às 22:00', salario: 'R$1.700', descricao: 'Atendimento no caixa, registro de produtos e fechamento de vendas.' },
]

const cursos = [
  { id: 'curriculo', titulo: 'Crie seu Currículo', pct: 87, bg: 'bg-[#DDF1E4]', emoji: '📄', descricao: 'Monte um currículo profissional do zero, destacando suas experiências e habilidades.' },
  { id: 'primeiro-emprego', titulo: 'Primeiro emprego', pct: 40, bg: 'bg-[#E6D6F8]', emoji: '🎯', descricao: 'Dicas práticas para conquistar sua primeira oportunidade no mercado de trabalho.' },
  { id: 'marketing-digital', titulo: 'Marketing digital básico', pct: 10, bg: 'bg-[#FBE3C9]', emoji: '📣', descricao: 'Fundamentos de marketing digital para divulgar produtos, serviços e a sua marca.' },
]

export default function Home() {
  const navigate = useNavigate()
  const [favoritos, setFavoritos] = useState([])
  const [vagaSel, setVagaSel] = useState(null)
  const [cursoSel, setCursoSel] = useState(null)

  const toggleFavorito = (id) =>
    setFavoritos((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Olá, Daniele !" subtitle="O que você quer conquistar hoje?" />

      <div className="-mt-5 mb-6 min-h-[60vh] rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Sua Jornada (card inteiro clicável → Cursos) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/cursos')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/cursos')}
          className="cursor-pointer rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-4 shadow-sm transition-transform active:scale-[0.99]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#291662]">Sua Jornada</h2>
              <p className="mt-0.5 text-[13px] text-[#291662]/80">Objetivo atual: conseguir renda própria</p>
            </div>
            <div className="ml-2 text-3xl">🛍️</div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E0D4F5]">
              <div className="h-full rounded-full bg-[#8F55E9]" style={{ width: '35%' }} />
            </div>
            <span className="text-[13px] font-bold text-[#291662]">35%</span>
          </div>
          <p className="mt-3 text-[12px] text-[#291662]/70">Próxima etapa:</p>
          <p className="text-[13px] font-medium text-[#291662]">Curso: Como montar seu currículo</p>
        </div>

        {/* Vagas recomendadas */}
        <SectionHeader title="Vagas recomendadas" action="Ver todas" onAction={() => navigate('/vagas')} />
        <div className="rounded-2xl border border-[#F0C98B]/60 bg-white p-2 shadow-sm">
          {vagas.map((v, i) => {
            const fav = favoritos.includes(v.id)
            return (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => setVagaSel(v)}
                onKeyDown={(e) => e.key === 'Enter' && setVagaSel(v)}
                className={`flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors active:bg-[#F6F1FE] ${
                  i < vagas.length - 1 ? 'border-b border-[#291662]/10' : ''
                }`}
              >
                <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl text-2xl ${v.bg}`}>
                  {v.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#291662]">{v.titulo}</p>
                  <p className="text-[14px] text-[#291662]/70">{v.compat} % compatível</p>
                </div>
                <button
                  type="button"
                  aria-label={fav ? 'Desfavoritar vaga' : 'Favoritar vaga'}
                  aria-pressed={fav}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorito(v.id)
                  }}
                  className="p-1 text-[#E84C8A] transition-transform active:scale-90"
                >
                  <HeartIcon className="h-6 w-6" filled={fav} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Cursos para você */}
        <SectionHeader title="Cursos para você" action="Ver todas" onAction={() => navigate('/cursos')} />
        <div className="rounded-2xl border border-[#8F55E9]/20 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            {cursos.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCursoSel(c)}
                className="flex flex-col items-center text-center transition-transform active:scale-95"
              >
                <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-xl text-2xl ${c.bg}`}>
                  {c.emoji}
                </div>
                <p className="text-[11px] font-medium leading-tight text-[#291662]">{c.titulo}</p>
                <p className="mt-1 text-[12px] font-bold text-[#291662]/70">{c.pct}%</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modais */}
      <VagaModal open={!!vagaSel} onClose={() => setVagaSel(null)} vaga={vagaSel} />

      <Modal open={!!cursoSel} onClose={() => setCursoSel(null)} title={cursoSel?.titulo}>
        {cursoSel && (
          <>
            <div className="flex items-center gap-2">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E0D4F5]">
                <div className="h-full rounded-full bg-[#8F55E9]" style={{ width: `${cursoSel.pct}%` }} />
              </div>
              <span className="text-[13px] font-bold text-[#291662]">{cursoSel.pct}%</span>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-[#291662]/80">{cursoSel.descricao}</p>
            <button
              type="button"
              onClick={() => {
                setCursoSel(null)
                navigate('/cursos')
              }}
              className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
            >
              Continuar curso
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h3 className="font-bold text-[#291662]">{title}</h3>
      {action && (
        <button type="button" onClick={onAction} className="text-[14px] font-medium text-[#291662]/70 active:text-[#8F55E9]">
          {action}
        </button>
      )}
    </div>
  )
}
