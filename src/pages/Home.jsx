import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import JornadaCard from '../components/JornadaCard'
import { CalendarIcon, ClockIcon, UserPinIcon, PinIcon, ChevronRight } from '../components/Icons'
import { getPerfil } from '../utils/profileService'
import { getVagas, assinarVagas } from '../utils/vagasService'
import {
  getFreelasAtivos,
  assinarFreelas,
  formatarValor,
  formatarData,
} from '../utils/freelasService'
import { useLocalizacao, distanciaValida, formatarDistancia } from '../utils/geolocalizacao'

// Cursos permanecem como mock visual nesta etapa (módulo ainda não integrado ao banco).
const cursos = [
  { id: 'curriculo', titulo: 'Crie seu Currículo', pct: 87, bg: 'bg-[#DDF1E4]', emoji: '📄', descricao: 'Monte um currículo profissional do zero, destacando suas experiências e habilidades.' },
  { id: 'primeiro-emprego', titulo: 'Primeiro emprego', pct: 40, bg: 'bg-[#E6D6F8]', emoji: '🎯', descricao: 'Dicas práticas para conquistar sua primeira oportunidade no mercado de trabalho.' },
  { id: 'marketing-digital', titulo: 'Marketing digital básico', pct: 10, bg: 'bg-[#FBE3C9]', emoji: '📣', descricao: 'Fundamentos de marketing digital para divulgar produtos, serviços e a sua marca.' },
]

// Formatador de salário local (vagasService não expõe um). Não inventa valores.
function formatarSalario(v) {
  if (!v) return 'A combinar'
  if (v.salario_exibir) return v.salario_exibir
  const fmt = (n) => `R$${Number(n).toLocaleString('pt-BR')}`
  if (v.salario_min != null && v.salario_max != null) {
    return v.salario_min === v.salario_max ? fmt(v.salario_min) : `${fmt(v.salario_min)} – ${fmt(v.salario_max)}`
  }
  if (v.salario_min != null) return fmt(v.salario_min)
  if (v.salario_max != null) return fmt(v.salario_max)
  return 'A combinar'
}

function localVagaTexto(v) {
  const partes = [v.cidade, v.modalidade].filter(Boolean)
  return partes.join(' · ')
}

export default function Home() {
  const navigate = useNavigate()
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [cursoSel, setCursoSel] = useState(null)

  const [vagas, setVagas] = useState([])
  const [carregandoVagas, setCarregandoVagas] = useState(true)
  const [erroVagas, setErroVagas] = useState('')

  const [freelas, setFreelas] = useState([])
  const [carregandoFreelas, setCarregandoFreelas] = useState(true)
  const [erroFreelas, setErroFreelas] = useState('')

  const montadoRef = useRef(true)
  const { coords } = useLocalizacao()

  // Nome real (mantém a única consulta de perfil já existente).
  useEffect(() => {
    let ativo = true
    async function carregarNome() {
      const perfil = await getPerfil()
      const nomeCompleto = perfil?.nome?.trim() || ''
      const primeiro = nomeCompleto ? nomeCompleto.split(/\s+/)[0] : ''
      if (ativo) setPrimeiroNome(primeiro)
    }
    carregarNome()
    return () => {
      ativo = false
    }
  }, [])

  // Vagas reais + realtime (erro em vagas não afeta freelas).
  const carregarVagas = async () => {
    const { data, error } = await getVagas()
    if (!montadoRef.current) return
    if (error) {
      setErroVagas('Não foi possível carregar as vagas.')
    } else {
      setErroVagas('')
      setVagas(data || [])
    }
    setCarregandoVagas(false)
  }

  // Freelas reais + realtime (erro em freelas não afeta vagas).
  const carregarFreelas = async () => {
    const { data, error } = await getFreelasAtivos()
    if (!montadoRef.current) return
    if (error) {
      setErroFreelas('Não foi possível carregar as oportunidades.')
    } else {
      setErroFreelas('')
      setFreelas(data || [])
    }
    setCarregandoFreelas(false)
  }

  useEffect(() => {
    montadoRef.current = true
    carregarVagas()
    carregarFreelas()

    const cancelarVagas = assinarVagas(() => carregarVagas())
    const cancelarFreelas = assinarFreelas(() => carregarFreelas())

    return () => {
      montadoRef.current = false
      cancelarVagas()
      cancelarFreelas()
    }
  }, [])

  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!'

  const vagasView = useMemo(
    () =>
      vagas.slice(0, 3).map((v) => ({
        ...v,
        salarioTexto: formatarSalario(v),
        localTexto: localVagaTexto(v),
      })),
    [vagas],
  )

  const freelasView = useMemo(
    () =>
      freelas.slice(0, 3).map((f) => {
        const distancia_km = distanciaValida(coords, f.latitude, f.longitude)
        return {
          ...f,
          valorTexto: formatarValor(f),
          dataTexto: formatarData(f.data_servico),
          distanciaTexto: formatarDistancia(distancia_km),
          localCard: [f.bairro, f.cidade].filter(Boolean).join(' · '),
        }
      }),
    [freelas, coords],
  )

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title={saudacao} subtitle="O que você quer conquistar hoje?" />

      <div className="-mt-5 mb-6 min-h-[60vh] rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Sua Jornada (metas reais por usuária) */}
        <JornadaCard />

        {/* Renda rápida para você */}
        <SectionHeader title="Renda rápida para você" action="Ver todas" onAction={() => navigate('/freelas')} />
        {carregandoFreelas ? (
          <EstadoTexto>Carregando oportunidades...</EstadoTexto>
        ) : erroFreelas ? (
          <EstadoTexto erro>{erroFreelas}</EstadoTexto>
        ) : freelasView.length === 0 ? (
          <EstadoVazio>Nenhuma oportunidade de renda rápida no momento.</EstadoVazio>
        ) : (
          <div className="rounded-2xl border border-[#F3B6C9]/60 bg-white p-2 shadow-sm">
            {freelasView.map((f, i) => (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/freelas/${f.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/freelas/${f.id}`)}
                className={`flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors active:bg-[#F6F1FE] ${
                  i < freelasView.length - 1 ? 'border-b border-[#291662]/10' : ''
                }`}
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#F1EAFD] text-[#8F55E9]">
                  <UserPinIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#291662]">{f.titulo}</p>
                  {f.contratante && <p className="text-[13px] text-[#291662]/70">{f.contratante}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#291662]/75">
                    <span className="flex items-center gap-0.5">
                      <UserPinIcon className="h-3.5 w-3.5" /> {f.distanciaTexto ? `${f.distanciaTexto} de você` : (f.localCard || '—')}
                    </span>
                    {f.dataTexto && <span className="flex items-center gap-0.5"><CalendarIcon className="h-3.5 w-3.5" /> {f.dataTexto}</span>}
                    {f.horario && <span className="flex items-center gap-0.5"><ClockIcon className="h-3.5 w-3.5" /> {f.horario}</span>}
                  </div>
                </div>
                <span className="flex items-center gap-0.5 font-bold text-[#D6479B]">
                  {f.valorTexto} <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Vagas recomendadas */}
        <SectionHeader title="Vagas recomendadas" action="Ver todas" onAction={() => navigate('/vagas')} />
        {carregandoVagas ? (
          <EstadoTexto>Carregando vagas...</EstadoTexto>
        ) : erroVagas ? (
          <EstadoTexto erro>{erroVagas}</EstadoTexto>
        ) : vagasView.length === 0 ? (
          <EstadoVazio>Nenhuma vaga disponível no momento.</EstadoVazio>
        ) : (
          <div className="rounded-2xl border border-[#F0C98B]/60 bg-white p-2 shadow-sm">
            {vagasView.map((v, i) => (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/vagas/${v.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/vagas/${v.id}`)}
                className={`flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors active:bg-[#F6F1FE] ${
                  i < vagasView.length - 1 ? 'border-b border-[#291662]/10' : ''
                }`}
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#F6F1FE] text-[#8F55E9]">
                  <PinIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#291662]">{v.titulo}</p>
                  {v.empresa && <p className="text-[13px] text-[#291662]/70">{v.empresa}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#291662]/75">
                    {v.localTexto && <span className="flex items-center gap-0.5"><PinIcon className="h-3.5 w-3.5" /> {v.localTexto}</span>}
                  </div>
                </div>
                <span className="flex items-center gap-0.5 font-bold text-[#291662]">
                  {v.salarioTexto} <ChevronRight className="h-4 w-4 text-[#291662]/50" />
                </span>
              </div>
            ))}
          </div>
        )}

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

      {/* Modal de curso (mantido) */}
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

function EstadoTexto({ children, erro = false }) {
  return (
    <p className={`py-6 text-center text-[14px] font-medium ${erro ? 'text-[#D6479B]' : 'text-[#291662]/70'}`}>
      {children}
    </p>
  )
}

function EstadoVazio({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
      {children}
    </div>
  )
}
