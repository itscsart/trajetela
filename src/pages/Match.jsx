import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import { ChevronRight } from '../components/Icons'

const PONTOS_KEY = 'trajetela_match_pontos'
const DISPONIBILIDADE_KEY = 'trajetela_match_disponibilidade'

const filtros = [
  'Todas',
  'Freelancer',
  'Primeiro Emprego',
  'Empreendedoras',
  'Mentoras',
  'Networking',
  'Parcerias',
  'Indicações',
]

const mulheres = [
  { id: 'maria', nome: 'Maria Fernanda', area: 'Designer Gráfica', compat: 92, interesses: ['Marketing', 'Design', 'Redes Sociais'], tags: ['Freelancer', 'Parcerias', 'Networking'] },
  { id: 'juliana', nome: 'Juliana Costa', area: 'Fotógrafa', compat: 88, interesses: ['Eventos', 'Audiovisual', 'Produção'], tags: ['Freelancer', 'Indicações', 'Networking'] },
  { id: 'beatriz', nome: 'Beatriz Lima', area: 'Social Media', compat: 90, interesses: ['Marketing', 'Conteúdo', 'Redes Sociais'], tags: ['Empreendedoras', 'Networking', 'Parcerias'] },
  { id: 'camila', nome: 'Camila Rocha', area: 'Mentora de Carreira', compat: 85, interesses: ['Liderança', 'Carreira', 'RH'], tags: ['Mentoras', 'Networking'] },
  { id: 'aline', nome: 'Aline Souza', area: 'Maquiadora', compat: 80, interesses: ['Beleza', 'Eventos', 'Freela'], tags: ['Freelancer', 'Parcerias', 'Primeiro Emprego'] },
]

const oportunidades = [
  { id: 'fotografa', titulo: 'Preciso indicar uma fotógrafa para evento corporativo', autora: 'Ana Souza', descricao: 'Não poderei atender este cliente e estou indicando outra profissional.' },
  { id: 'manicure', titulo: 'Procuro manicure para parceria em salão', autora: 'Patrícia Oliveira', descricao: 'Tenho espaço disponível no salão e busco uma parceira para atender a demanda.' },
  { id: 'designer', titulo: 'Busco designer para projeto de marca', autora: 'Renata Dias', descricao: 'Projeto pontual de identidade visual para o lançamento de uma nova marca.' },
]

const rede = [
  { id: 'mentorias', titulo: 'Mentorias', descricao: 'Encontre mulheres dispostas a orientar sua carreira.' },
  { id: 'parcerias', titulo: 'Parcerias', descricao: 'Encontre parceiras para projetos e trabalhos.' },
  { id: 'networking', titulo: 'Networking', descricao: 'Amplie sua rede profissional e gere novas conexões.' },
]

const regrasPontos = [
  { acao: 'Conectar com alguém', pontos: '+10' },
  { acao: 'Fazer indicação', pontos: '+20' },
  { acao: 'Receber avaliação positiva', pontos: '+30' },
  { acao: 'Participar de evento', pontos: '+15' },
  { acao: 'Concluir mentoria', pontos: '+40' },
]

const disponibilidades = [
  'Disponível para Freelancer',
  'Disponível para Networking',
  'Disponível para Parcerias',
  'Disponível para Mentorias',
  'Disponível para Indicações',
]

function iniciais(nome) {
  return nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function ler(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export default function Match() {
  const [filtro, setFiltro] = useState('Todas')
  const [perfilSel, setPerfilSel] = useState(null)
  const [redeSel, setRedeSel] = useState(null)
  const [conectados, setConectados] = useState([])
  const [interesses, setInteresses] = useState([])
  const [pontos, setPontos] = useState(() => Number(localStorage.getItem(PONTOS_KEY) || 0))
  const [disponivel, setDisponivel] = useState(() => ler(DISPONIBILIDADE_KEY))

  const addPontos = (n) =>
    setPontos((prev) => {
      const novo = prev + n
      localStorage.setItem(PONTOS_KEY, String(novo))
      return novo
    })

  const conectar = (id) => {
    if (conectados.includes(id)) return
    setConectados((p) => [...p, id])
    addPontos(10) // Conectar com alguém
  }

  const temInteresse = (id) => {
    if (interesses.includes(id)) return
    setInteresses((p) => [...p, id])
    addPontos(20) // Fazer indicação
  }

  const conversar = (titulo) => {
    // Estrutura pronta para chat interno / WhatsApp futuramente.
    const texto = encodeURIComponent(`Olá! Vi sua publicação no TrajetEla Match: ${titulo}`)
    window.open(`https://wa.me/5511999999999?text=${texto}`, '_blank', 'noopener')
  }

  const toggleDisponivel = (item) =>
    setDisponivel((prev) => {
      const novo = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
      localStorage.setItem(DISPONIBILIDADE_KEY, JSON.stringify(novo))
      return novo
    })

  const sugestoes = filtro === 'Todas' ? mulheres : mulheres.filter((m) => m.tags.includes(filtro))

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="TrajetEla Match" />

      <p className="px-6 pt-3 text-center text-[14px] text-[#291662]/80">
        Conecte-se com mulheres que compartilham seus objetivos profissionais.
      </p>

      <div className="mx-4 mb-6 mt-4 rounded-[28px] border border-[#8F55E9]/25 bg-white px-5 pb-8 pt-6 shadow-sm">
        {/* Filtros */}
        <div className="-mx-5 flex flex-nowrap gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {/* Seção 1 — Sugestões para você */}
        <h3 className="mb-3 mt-6 font-bold text-[#291662]">Sugestões para você</h3>
        <div className="space-y-3">
          {sugestoes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
              Nenhuma sugestão para este filtro.
            </p>
          ) : (
            sugestoes.map((m) => (
              <div key={m.id} className="rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#B79BE6] to-[#8F55E9] text-[14px] font-bold text-white">
                    {iniciais(m.nome)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-bold text-[#291662]">{m.nome}</h4>
                    <p className="text-[13px] text-[#291662]/75">{m.area}</p>
                  </div>
                  <span className="flex-none text-[13px] font-bold text-[#2EA043]">{m.compat}%</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.interesses.map((i) => (
                    <span key={i} className="rounded-full bg-[#F1EAFD] px-2.5 py-1 text-[11px] font-medium text-[#8F55E9]">
                      {i}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPerfilSel(m)}
                    className="flex-1 rounded-full border border-[#8F55E9] py-2.5 text-[13px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
                  >
                    Ver Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => conectar(m.id)}
                    disabled={conectados.includes(m.id)}
                    className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold text-white ${
                      conectados.includes(m.id) ? 'bg-[#A98BE0]' : 'bg-gradient-to-r from-[#E060A6] to-[#B14AD6]'
                    }`}
                  >
                    {conectados.includes(m.id) ? 'Conectada ✓' : 'Conectar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Seção 2 — Oportunidades por Indicação */}
        <h3 className="mb-1 mt-7 font-bold text-[#291662]">Oportunidades por Indicação</h3>
        <p className="mb-3 text-[12px] text-[#291662]/70">Oportunidades compartilhadas por outras mulheres.</p>
        <div className="space-y-3">
          {oportunidades.map((o) => (
            <div key={o.id} className="rounded-2xl border border-[#8F55E9]/25 bg-[#F6F1FE] p-4 shadow-sm">
              <h4 className="text-[15px] font-bold leading-tight text-[#291662]">{o.titulo}</h4>
              <p className="mt-1 text-[12px] text-[#291662]/70">Publicado por: {o.autora}</p>
              <p className="mt-2 text-[13px] leading-snug text-[#291662]/80">{o.descricao}</p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => temInteresse(o.id)}
                  disabled={interesses.includes(o.id)}
                  className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold text-white ${
                    interesses.includes(o.id) ? 'bg-[#A98BE0]' : 'bg-[#8F55E9]'
                  }`}
                >
                  {interesses.includes(o.id) ? 'Interesse enviado ✓' : 'Tenho interesse'}
                </button>
                <button
                  type="button"
                  onClick={() => conversar(o.titulo)}
                  className="flex-1 rounded-full border border-[#8F55E9] py-2.5 text-[13px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
                >
                  Conversar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Seção 3 — Rede de Apoio */}
        <h3 className="mb-3 mt-7 font-bold text-[#291662]">Rede de Apoio</h3>
        <div className="space-y-3">
          {rede.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRedeSel(r)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#8F55E9]/25 bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
            >
              <div>
                <h4 className="text-[15px] font-bold text-[#291662]">{r.titulo}</h4>
                <p className="mt-0.5 text-[13px] text-[#291662]/75">{r.descricao}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-none text-[#291662]/40" />
            </button>
          ))}
        </div>

        {/* Gamificação */}
        <h3 className="mb-3 mt-7 font-bold text-[#291662]">Sua evolução no Match</h3>
        <div className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#291662]">Seus pontos</span>
            <span className="text-2xl font-extrabold text-[#8F55E9]">{pontos}</span>
          </div>
          <div className="mt-3 space-y-2">
            {regrasPontos.map((r) => (
              <div key={r.acao} className="flex items-center justify-between border-t border-[#291662]/10 pt-2 text-[13px]">
                <span className="text-[#291662]/80">{r.acao}</span>
                <span className="font-bold text-[#2EA043]">{r.pontos}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#291662]/60">
            Sua pontuação vai alimentar a área de Conquistas do seu perfil.
          </p>
        </div>

        {/* Disponibilidade (integração futura com Perfil) */}
        <h3 className="mb-1 mt-7 font-bold text-[#291662]">Sua disponibilidade</h3>
        <p className="mb-3 text-[12px] text-[#291662]/70">Mostre para a rede como você quer se conectar.</p>
        <div className="flex flex-wrap gap-2">
          {disponibilidades.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDisponivel(d)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-medium transition-colors ${
                disponivel.includes(d)
                  ? 'border-[#8F55E9] bg-[#8F55E9] text-white'
                  : 'border-[#8F55E9]/40 bg-white/50 text-[#291662]'
              }`}
            >
              <span>{disponivel.includes(d) ? '☑' : '☐'}</span> {d.replace('Disponível para ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Modal — Ver Perfil */}
      <Modal open={!!perfilSel} onClose={() => setPerfilSel(null)} title={perfilSel?.nome}>
        {perfilSel && (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#B79BE6] to-[#8F55E9] text-[16px] font-bold text-white">
                {iniciais(perfilSel.nome)}
              </span>
              <div>
                <p className="text-[15px] font-bold text-[#291662]">{perfilSel.area}</p>
                <p className="text-[13px] font-medium text-[#2EA043]">{perfilSel.compat}% compatível</p>
              </div>
            </div>

            <p className="mt-4 text-[13px] font-semibold text-[#291662]">Interesses</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {perfilSel.interesses.map((i) => (
                <span key={i} className="rounded-full bg-[#F1EAFD] px-2.5 py-1 text-[12px] font-medium text-[#8F55E9]">
                  {i}
                </span>
              ))}
            </div>

            <p className="mt-4 text-[13px] font-semibold text-[#291662]">Aberta para</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {perfilSel.tags.map((t) => (
                <span key={t} className="rounded-full border border-[#8F55E9]/40 px-2.5 py-1 text-[12px] font-medium text-[#291662]">
                  {t}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => conectar(perfilSel.id)}
              disabled={conectados.includes(perfilSel.id)}
              className={`mt-6 w-full rounded-full py-3.5 text-[15px] font-semibold text-white ${
                conectados.includes(perfilSel.id) ? 'bg-[#A98BE0]' : 'bg-gradient-to-r from-[#E060A6] to-[#B14AD6]'
              }`}
            >
              {conectados.includes(perfilSel.id) ? 'Conectada ✓' : 'Conectar'}
            </button>
          </>
        )}
      </Modal>

      {/* Modal — Rede de Apoio */}
      <Modal open={!!redeSel} onClose={() => setRedeSel(null)} title={redeSel?.titulo}>
        {redeSel && (
          <>
            <p className="text-[14px] leading-relaxed text-[#291662]/80">{redeSel.descricao}</p>
            <button
              type="button"
              onClick={() => setRedeSel(null)}
              className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
            >
              Explorar {redeSel.titulo}
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
