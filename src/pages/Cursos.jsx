import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import { PlayIcon, HeartIcon } from '../components/Icons'
import { addSalvo } from '../utils/salvos'

import cursoBeleza from '../assets/curso-beleza.png'
import cursoNegocios from '../assets/curso-negocios.png'
import cursoInformatica from '../assets/curso-informatica.png'
import cursoFinancas from '../assets/curso-financas.png'

const cursosLivres = [
  {
    titulo: 'Área da beleza',
    aulas: 35,
    img: cursoBeleza,
    cursos: ['Design de sobrancelha', 'Automaquiagem básica', 'Atendimento em salão'],
  },
  {
    titulo: 'Negócios e Gestão',
    aulas: 65,
    img: cursoNegocios,
    cursos: ['Excel Básico', 'Organização financeira', 'Atendimento ao cliente'],
  },
  {
    titulo: 'Informática',
    aulas: 24,
    img: cursoInformatica,
    cursos: ['Informática básica', 'Canva para iniciantes', 'Introdução ao pacote Office'],
  },
  {
    titulo: 'Finanças',
    aulas: 70,
    img: cursoFinancas,
    cursos: ['Finanças sem complicação', 'Como controlar seus gastos', 'Planejamento financeiro básico'],
  },
]

const emAndamentoInicial = [
  { id: 'curriculo', titulo: 'Crie seu currículo', categoria: 'Qualificações', progresso: 60, restante: '10min restantes' },
  { id: 'excel', titulo: 'Excel Básico', categoria: 'Negócios e Gestão', progresso: 35, restante: '25min restantes' },
  { id: 'financas', titulo: 'Finanças sem complicação', categoria: 'Finanças', progresso: 80, restante: '5min restantes' },
  { id: 'canva', titulo: 'Canva para iniciantes', categoria: 'Informática', progresso: 45, restante: '18min restantes' },
]

const aulasBase = [
  { id: 'sobrancelha', titulo: 'Design de sobrancelha', instrutor: 'Bruna Barcelos', dia: '26', mes: 'Junho', desc: 'Aprenda técnicas de design de sobrancelhas para valorizar a harmonia do rosto, realçar a beleza natural e atender diferentes perfis de clientes.', horas: '36 horas' },
  { id: 'excel', titulo: 'Excel Básico', instrutor: 'Renata Vasconcelos', dia: '20', mes: 'Junho', desc: 'Aprenda os fundamentos do Excel, criando planilhas, organizando dados e utilizando fórmulas básicas para aumentar sua produtividade.', horas: '62 horas' },
  { id: 'contas', titulo: 'Administre suas contas', instrutor: 'Fernanda Coelho', dia: '21', mes: 'Junho', desc: 'Aprenda a controlar receitas, despesas e orçamento para manter suas finanças organizadas e equilibradas.', horas: '24 horas' },
  { id: 'ingles', titulo: 'Inglês Básico', instrutor: 'Marina Martins', dia: '22', mes: 'Junho', desc: 'Aprenda o essencial do inglês para se comunicar no dia a dia, ampliar oportunidades e dar os primeiros passos rumo à fluência.', horas: '100 horas' },
  { id: 'marketing', titulo: 'Marketing', instrutor: 'Marcela Morim', dia: '02', mes: 'Julho', desc: 'Descubra como promover produtos, serviços e ideias de forma estratégica, atraindo clientes e gerando mais oportunidades de negócio.', horas: '150 horas' },
  { id: 'social', titulo: 'Social Media', instrutor: 'Carla Silva', dia: '10', mes: 'Julho', desc: 'Aprenda a criar conteúdos estratégicos para redes sociais, fortalecer marcas, engajar públicos e ampliar sua presença digital.', horas: '75 horas' },
]

const aulasExtras = [
  { id: 'vendas', titulo: 'Técnicas de Vendas', instrutor: 'Paula Andrade', dia: '14', mes: 'Julho', desc: 'Aprenda abordagens de vendas, negociação e fechamento para aumentar seus resultados.', horas: '40 horas' },
  { id: 'atendimento', titulo: 'Atendimento ao Cliente', instrutor: 'Júlia Ramos', dia: '18', mes: 'Julho', desc: 'Boas práticas de atendimento, comunicação e resolução de conflitos com clientes.', horas: '30 horas' },
]

export default function Cursos() {
  const [favoritos, setFavoritos] = useState([])
  const [verTodas, setVerTodas] = useState(false)
  const [aulaSel, setAulaSel] = useState(null)
  const [categoriaSel, setCategoriaSel] = useState(null)
  const [lembradas, setLembradas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trajetela_aulas_lembrar') || '[]')
    } catch {
      return []
    }
  })
  const [emAndamento, setEmAndamento] = useState(() => {
    try {
      const salvo = localStorage.getItem('trajetela_em_andamento')
      return salvo ? JSON.parse(salvo) : emAndamentoInicial
    } catch {
      return emAndamentoInicial
    }
  })

  const persistirAndamento = (lista) => {
    localStorage.setItem('trajetela_em_andamento', JSON.stringify(lista))
    return lista
  }

  const removerAndamento = (id) =>
    setEmAndamento((prev) => persistirAndamento(prev.filter((a) => a.id !== id)))

  const toggleFavorito = (id) =>
    setFavoritos((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

  const lembrarDepois = (aula) => {
    setLembradas((prev) => {
      const novo = prev.includes(aula.id) ? prev : [...prev, aula.id]
      localStorage.setItem('trajetela_aulas_lembrar', JSON.stringify(novo))
      return novo
    })
    addSalvo({
      id: `curso-${aula.id}`,
      tipo: 'curso',
      titulo: aula.titulo,
      subtitulo: aula.instrutor || aula.horas || '',
      valor: '',
      origem: 'Cursos',
    })
  }

  const aulas = verTodas ? [...aulasBase, ...aulasExtras] : aulasBase
  // Aulas concluídas (100%) somem automaticamente da seção.
  const andamentoVisivel = emAndamento.filter((a) => a.progresso < 100)

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Olá, Daniele !" subtitle="O que você quer conquistar hoje?" />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Cursos Livres */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#291662]">Cursos Livres</h3>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#8F55E9]" />
            <span className="h-2 w-2 rounded-full bg-[#CFC2EA]" />
          </div>
        </div>

        <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cursosLivres.map((c) => (
            <button
              key={c.titulo}
              type="button"
              onClick={() => setCategoriaSel(c)}
              className="flex w-40 flex-none flex-col items-center justify-center rounded-2xl bg-[#E7D9F8] px-3 py-6 text-center shadow-sm transition-transform active:scale-95"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70">
                <img src={c.img} alt={c.titulo} className="h-full w-full object-contain p-1" />
              </div>
              <p className="text-[15px] font-semibold text-[#291662]">{c.titulo}</p>
              <p className="mt-1 text-[13px] text-[#291662]/70">{c.aulas} aulas</p>
            </button>
          ))}
        </div>

        {/* Últimas aulas vistas (linha horizontal estilo Netflix) */}
        <h3 className="mt-7 font-bold text-[#291662]">Últimas aulas vistas</h3>
        {andamentoVisivel.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Nenhuma aula em andamento no momento.
          </p>
        ) : (
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {andamentoVisivel.map((a) => (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setAulaSel({
                    id: a.id,
                    titulo: a.titulo,
                    instrutor: a.categoria,
                    desc: 'Continue de onde parou e avance na sua aula.',
                    horas: a.restante,
                  })
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  setAulaSel({ id: a.id, titulo: a.titulo, instrutor: a.categoria, desc: 'Continue de onde parou e avance na sua aula.', horas: a.restante })
                }
                className="relative w-64 flex-none cursor-pointer overflow-hidden rounded-2xl border border-[#8F55E9]/30 bg-gradient-to-br from-[#4B3A78] to-[#2B1B52] p-4 text-left text-white shadow-sm transition-transform active:scale-[0.98]"
              >
                <button
                  type="button"
                  aria-label="Remover da lista"
                  onClick={(e) => {
                    e.stopPropagation()
                    removerAndamento(a.id)
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition-colors active:bg-white/30"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>

                <h4 className="pr-8 text-[15px] font-bold leading-tight">{a.titulo}</h4>
                <p className="mt-0.5 text-[12px] text-white/75">{a.categoria}</p>

                <div className="mt-8 flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2">
                    <PlayIcon className="h-5 w-5" /> Continue assistindo
                  </span>
                  <span>{a.restante}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-[#B14AD6]" style={{ width: `${a.progresso}%` }} />
                </div>
                <p className="mt-1 text-right text-[11px] text-white/70">{a.progresso}%</p>
              </div>
            ))}
          </div>
        )}

        {/* Próximas aulas */}
        <div className="mb-3 mt-7 flex items-center justify-between">
          <h3 className="font-bold text-[#291662]">Próximas aulas</h3>
          <button
            type="button"
            onClick={() => setVerTodas((v) => !v)}
            className="text-[14px] font-medium text-[#291662]/70 active:text-[#8F55E9]"
          >
            {verTodas ? 'Ver menos' : 'Ver todas'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {aulas.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => setAulaSel(a)}
              onKeyDown={(e) => e.key === 'Enter' && setAulaSel(a)}
              className="flex min-h-[190px] cursor-pointer flex-col rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3.5 shadow-sm transition-transform active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold leading-tight text-[#291662]">{a.titulo}</h4>
                  <p className="mt-0.5 text-[11px] text-[#291662]/70">{a.instrutor}</p>
                </div>
                <div className="flex-none rounded-lg bg-[#8F55E9] px-2 py-1 text-center text-white">
                  <p className="text-[14px] font-extrabold leading-none">{a.dia}</p>
                  <p className="text-[10px] leading-tight">{a.mes}</p>
                </div>
              </div>
              <p className="mt-2 flex-1 text-[11px] leading-snug text-[#291662]/75">{a.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[12px] font-bold text-[#291662]">{a.horas}</p>
                <button
                  type="button"
                  aria-label="Favoritar curso"
                  aria-pressed={favoritos.includes(a.id)}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorito(a.id)
                  }}
                  className="p-0.5 text-[#8F55E9] transition-transform active:scale-90"
                >
                  <HeartIcon className="h-5 w-5" filled={favoritos.includes(a.id)} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de categoria (Cursos Livres) */}
      <Modal open={!!categoriaSel} onClose={() => setCategoriaSel(null)} title={categoriaSel?.titulo}>
        {categoriaSel && (
          <>
            <p className="-mt-2 text-[14px] text-[#291662]/80">Cursos desta área</p>
            <div className="mt-3 space-y-3">
              {categoriaSel.cursos.map((nome) => (
                <div
                  key={nome}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3"
                >
                  <span className="text-[14px] font-medium text-[#291662]">{nome}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriaSel(null)
                      setAulaSel({
                        id: nome,
                        titulo: nome,
                        instrutor: categoriaSel.titulo,
                        desc: 'Curso da área de ' + categoriaSel.titulo + '. Comece agora e avance no seu ritmo.',
                      })
                    }}
                    className="flex-none rounded-full bg-[#8F55E9] px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    Ver curso
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCategoriaSel(null)}
              className="mt-6 w-full rounded-full border border-[#8F55E9] py-3.5 text-[15px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
            >
              Voltar
            </button>
          </>
        )}
      </Modal>

      {/* Modal de detalhes da aula */}
      <Modal open={!!aulaSel} onClose={() => setAulaSel(null)} title={aulaSel?.titulo}>
        {aulaSel && (
          <>
            {aulaSel.instrutor && <p className="-mt-2 text-[14px] text-[#291662]/80">{aulaSel.instrutor}</p>}
            {aulaSel.desc && <p className="mt-4 text-[14px] leading-relaxed text-[#291662]/80">{aulaSel.desc}</p>}
            {aulaSel.horas && <p className="mt-3 text-[13px] font-bold text-[#291662]">{aulaSel.horas}</p>}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => console.log('Iniciar aula:', aulaSel.id)}
                className="w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
              >
                Iniciar aula
              </button>
              <button
                type="button"
                onClick={() => lembrarDepois(aulaSel)}
                disabled={lembradas.includes(aulaSel.id)}
                className={`w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
                  lembradas.includes(aulaSel.id)
                    ? 'border-[#2EA043] text-[#2EA043]'
                    : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
                }`}
              >
                {lembradas.includes(aulaSel.id) ? '✓ Lembrete salvo' : 'Lembrar depois'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
