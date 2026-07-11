import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import avatar from '../assets/perfil.png'
import { StarIcon, BriefcaseIcon, ChevronRight } from '../components/Icons'
import { getUsuario, setLogado } from '../utils/auth'
import { supabase } from '../lib/supabase'
import { getPerfil, salvarPerfil } from '../utils/profileService'

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
const LIMITE_BYTES = 5 * 1024 * 1024

function lerConquistas() {
  try {
    return JSON.parse(localStorage.getItem('trajetela_conquistas') || '[]')
  } catch {
    return []
  }
}

const avaliacoes = [
  { id: 'av1', contratante: 'Eventos SP', servico: 'Recepcionista de Evento', data: '12/06/2026', nota: '8.0', comentario: 'Daniele chegou no horário, atendeu bem os convidados e demonstrou muita responsabilidade durante todo o evento.' },
  { id: 'av2', contratante: 'Buffet Central', servico: 'Garçonete', data: '08/06/2026', nota: '7.5', comentario: 'Teve boa postura, ajudou a equipe durante o atendimento e concluiu as atividades combinadas.' },
  { id: 'av3', contratante: 'Produções ABC', servico: 'Assistente de produção', data: '03/06/2026', nota: '8.5', comentario: 'Manteve boa comunicação com a equipe, seguiu as orientações e demonstrou comprometimento.' },
]

const trabalhos = [
  { id: 'tr1', titulo: 'Recepcionista de Evento', contratante: 'Eventos SP', data: '12/06/2026', valor: 'R$180', status: 'Concluído' },
  { id: 'tr2', titulo: 'Garçonete', contratante: 'Buffet Central', data: '08/06/2026', valor: 'R$180', status: 'Concluído' },
  { id: 'tr3', titulo: 'Assistente de produção', contratante: 'Produções ABC', data: '03/06/2026', valor: 'R$220', status: 'Concluído' },
]

const matchesIniciais = [
  { id: 'mt1', nome: 'Maria Fernanda', area: 'Design Gráfico', compat: 92, interesses: ['Marketing', 'Design', 'Redes Sociais'] },
  { id: 'mt2', nome: 'Juliana Costa', area: 'Audiovisual', compat: 88, interesses: ['Eventos', 'Fotografia', 'Produção'] },
]

export default function Perfil() {
  const navigate = useNavigate()
  const usuario = getUsuario()
  const nome = usuario && usuario.nome ? usuario.nome : 'Usuária'
  const contato = usuario && usuario.emailOuTelefone ? usuario.emailOuTelefone : ''
  const [aberto, setAberto] = useState(null) // 'avaliacao' | 'trabalhos' | 'conquistas' | 'match'
  const [conquistas] = useState(lerConquistas)
  const [matches, setMatches] = useState(matchesIniciais)
  const [feedback, setFeedback] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [erroFoto, setErroFoto] = useState('')
  const inputFotoRef = useRef(null)

  const totalConquistas = 2 + conquistas.length

  useEffect(() => {
    let ativo = true

    async function carregarPerfil() {
      const perfil = await getPerfil()
      if (!ativo) return
      if (perfil && perfil.foto_url) {
        setFotoUrl(perfil.foto_url)
      }
    }

    carregarPerfil()

    return () => {
      ativo = false
    }
  }, [])

  const desfazerMatch = (id) => {
    setMatches((prev) => prev.filter((m) => m.id !== id))
    setFeedback('Match desfeito.')
  }

  const abrir = (qual) => {
    setFeedback('')
    setAberto(qual)
  }

  const sair = () => {
    setLogado(false)
    navigate('/login')
  }

  const abrirSeletorFoto = () => {
    setErroFoto('')
    if (inputFotoRef.current) inputFotoRef.current.click()
  }

  const enviarFoto = async (e) => {
    setErroFoto('')
    const arquivo = e.target.files && e.target.files[0]
    if (arquivo) {
      if (!TIPOS_ACEITOS.includes(arquivo.type)) {
        setErroFoto('Formato inválido. Envie uma imagem JPG, PNG ou WEBP.')
        e.target.value = ''
        return
      }
      if (arquivo.size > LIMITE_BYTES) {
        setErroFoto('A imagem deve ter no máximo 5 MB.')
        e.target.value = ''
        return
      }

      setEnviandoFoto(true)
      try {
        const { data: sessao } = await supabase.auth.getUser()
        const user = sessao && sessao.user
        if (!user) {
          setErroFoto('Não foi possível identificar sua conta. Faça login novamente.')
          setEnviandoFoto(false)
          e.target.value = ''
          return
        }

        const caminho = `${user.id}/avatar`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type })

        if (uploadError) {
          setErroFoto('Não foi possível enviar sua foto. Tente novamente.')
          setEnviandoFoto(false)
          e.target.value = ''
          return
        }

        const { data: publica } = supabase.storage.from('avatars').getPublicUrl(caminho)
        const url = publica && publica.publicUrl ? `${publica.publicUrl}?t=${Date.now()}` : ''

        await salvarPerfil({ foto_url: url })
        setFotoUrl(url)
      } catch {
        setErroFoto('Não foi possível enviar sua foto. Tente novamente.')
      } finally {
        setEnviandoFoto(false)
        e.target.value = ''
      }
    }
  }

  const links = [
    { label: 'Área de interesse', action: () => navigate('/area-interesse') },
    { label: 'Informações pessoais', action: () => navigate('/informacoes-pessoais') },
    { label: 'Ajuda', action: () => navigate('/ajuda') },
    { label: 'Sair', action: sair },
  ]

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack to="/home" />

      <div className="flex flex-col items-center px-7 pt-2">
        <button
          type="button"
          onClick={abrirSeletorFoto}
          className="h-36 w-36 overflow-hidden rounded-full border-4 border-[#8F55E9]/40 shadow-md"
        >
          <img src={fotoUrl || avatar} alt="Daniele Dourado" className="h-full w-full object-cover" />
        </button>
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={enviarFoto}
          className="hidden"
        />
        {enviandoFoto && (
          <p className="mt-2 text-center text-[13px] font-medium text-[#8F55E9]">Enviando foto...</p>
        )}
        {erroFoto && (
          <p className="mt-2 text-center text-[13px] font-medium text-[#D6479B]">{erroFoto}</p>
        )}
        <h1 className="mt-4 text-2xl font-extrabold text-[#291662]">{nome}</h1>
        <p className="text-[14px] font-bold text-[#291662]">Aprendiz</p>
        {contato && <p className="mt-1 text-[13px] text-[#291662]/70">{contato}</p>}

        {/* Stats em grid 2x2 */}
        <div className="mt-7 grid w-full grid-cols-2 gap-3">
          <StatCard onClick={() => abrir('avaliacao')} icon={<StarIcon className="h-6 w-6 text-[#8F55E9]" />} label="Avaliação" valor="8.0" />
          <StatCard onClick={() => abrir('trabalhos')} icon={<BriefcaseIcon className="h-6 w-6 text-[#8F55E9]" />} label="Trabalhos" valor={trabalhos.length} />
          <StatCard onClick={() => abrir('conquistas')} icon={<span className="text-[20px]">🌸</span>} label="Conquistas" valor={totalConquistas} />
          <StatCard onClick={() => abrir('match')} icon={<span className="text-[20px]">🤝</span>} label="Match" valor={matches.length} />
        </div>

        {/* Links */}
        <div className="mt-8 w-full">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={l.action}
              className="flex w-full items-center justify-between border-b border-[#291662]/10 py-4 text-left"
            >
              <span className="text-[16px] text-[#291662]">{l.label}</span>
              <ChevronRight className="h-5 w-5 text-[#291662]/40" />
            </button>
          ))}
        </div>
      </div>

      {/* Modal Avaliações */}
      <Modal open={aberto === 'avaliacao'} onClose={() => setAberto(null)} title="Avaliações">
        <div className="space-y-3">
          {avaliacoes.map((a) => (
            <div key={a.id} className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#291662]">{a.contratante}</span>
                <span className="flex items-center gap-1 text-[14px] font-bold text-[#291662]">
                  <StarIcon className="h-4 w-4 text-[#F4B400]" /> {a.nota}
                </span>
              </div>
              <p className="text-[12px] text-[#291662]/70">{a.servico} • {a.data}</p>
              <p className="mt-1 text-[13px] leading-snug text-[#291662]/80">“{a.comentario}”</p>
            </div>
          ))}
        </div>
        <FecharBtn onClose={() => setAberto(null)} />
      </Modal>

      {/* Modal Trabalhos */}
      <Modal open={aberto === 'trabalhos'} onClose={() => setAberto(null)} title="Trabalhos realizados">
        <div className="space-y-3">
          {trabalhos.map((t) => (
            <div key={t.id} className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#291662]">{t.titulo}</span>
                <span className="text-[14px] font-bold text-[#291662]">{t.valor}</span>
              </div>
              <p className="text-[12px] text-[#291662]/70">{t.contratante} • {t.data}</p>
              <span className="mt-2 inline-block rounded-full bg-[#DDF1E4] px-3 py-1 text-[11px] font-medium text-[#2EA043]">{t.status}</span>
            </div>
          ))}
        </div>
        <FecharBtn onClose={() => setAberto(null)} />
      </Modal>

      {/* Modal Conquistas */}
      <Modal open={aberto === 'conquistas'} onClose={() => setAberto(null)} title="Conquistas">
        {conquistas.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Você ainda não desbloqueou novas conquistas.
          </p>
        ) : (
          <ul className="space-y-2">
            {conquistas.map((c) => (
              <li key={c} className="flex items-center gap-3 rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3">
                <span className="text-[18px]">🏅</span>
                <span className="text-[14px] font-medium text-[#291662]">{c}</span>
              </li>
            ))}
          </ul>
        )}
        <FecharBtn onClose={() => setAberto(null)} />
      </Modal>

      {/* Modal Match */}
      <Modal open={aberto === 'match'} onClose={() => setAberto(null)} title="Seus Matches">
        {matches.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Você ainda não possui matches ativos.
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#291662]">{m.nome}</span>
                  <span className="text-[13px] font-bold text-[#2EA043]">{m.compat}%</span>
                </div>
                <p className="text-[12px] text-[#291662]/70">{m.area}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.interesses.map((i) => (
                    <span key={i} className="rounded-full bg-[#F1EAFD] px-2.5 py-1 text-[11px] font-medium text-[#8F55E9]">{i}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => desfazerMatch(m.id)}
                  className="mt-3 w-full rounded-full border border-[#E89BB0] py-2.5 text-[13px] font-semibold text-[#D6479B] transition-colors active:bg-[#FBE7EC]"
                >
                  Desfazer match
                </button>
              </div>
            ))}
          </div>
        )}
        {feedback && <p className="mt-3 text-center text-[14px] font-medium text-[#2EA043]">{feedback}</p>}
        <FecharBtn onClose={() => setAberto(null)} />
      </Modal>
    </PageContainer>
  )
}

function StatCard({ onClick, icon, label, valor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center rounded-2xl border border-[#8F55E9]/35 bg-white/60 py-4 transition-transform active:scale-95"
    >
      {icon}
      <p className="mt-2 text-[12px] text-[#291662]/80">{label}</p>
      <p className="text-[14px] font-bold text-[#291662]">{valor}</p>
    </button>
  )
}

function FecharBtn({ onClose }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
    >
      Fechar
    </button>
  )
}
