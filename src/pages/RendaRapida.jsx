import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import UserHeader from '../components/UserHeader'
import Modal from '../components/Modal'
import { CalendarIcon, ClockIcon, UserPinIcon, ChevronRight, MoneyIcon, StarIcon } from '../components/Icons'
import {
  getFreelasAtivos,
  getFreelaDestaque,
  contarFreelasAtivos,
  assinarFreelas,
  formatarValor,
  formatarData,
} from '../utils/freelasService'
import {
  getFreelasConcluidos,
  getAvaliacoes,
  getUsuariaId,
  assinarRegistrosUsuaria,
  totalDoMes,
  formatarReais,
  mediaReputacao,
} from '../utils/freelasRealizadosService'
import { useLocalizacao, distanciaValida, formatarDistancia } from '../utils/geolocalizacao'

function ContatoFreela({ freela }) {
  const whats = (freela?.whatsapp_contato || '').toString().replace(/\D/g, '')
  const mail = (freela?.email_contato || '').toString().trim()
  const pref = (freela?.contato_preferido || '').toString().toLowerCase()
  const titulo = freela?.titulo || ''
  const mensagem = `Olá! Tenho interesse no freela de ${titulo} publicado no TrajetEla.`

  const temWhats = !!whats
  const temEmail = !!mail
  if (!temWhats && !temEmail) return null

  const usarWhats = temWhats && (pref === 'whatsapp' || pref === 'ambos' || !pref || !temEmail)
  const href = usarWhats
    ? `https://wa.me/${whats}?text=${encodeURIComponent(mensagem)}`
    : `mailto:${mail}?subject=${encodeURIComponent(`Interesse no freela de ${titulo}`)}&body=${encodeURIComponent(mensagem)}`

  return (
    <a
      href={href}
      target={usarWhats ? '_blank' : undefined}
      rel={usarWhats ? 'noopener noreferrer' : undefined}
      className="flex-1 rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-2.5 text-center text-[13px] font-semibold text-white transition-transform active:scale-95"
    >
      Tenho interesse
    </a>
  )
}

export default function RendaRapida() {
  const navigate = useNavigate()
  const [saldoAberto, setSaldoAberto] = useState(false)
  const [reputacaoAberta, setReputacaoAberta] = useState(false)
  const [avaliacaoSel, setAvaliacaoSel] = useState(null)

  const [destaque, setDestaque] = useState(null)
  const [outras, setOutras] = useState([])
  const [totalAtivos, setTotalAtivos] = useState(0)
  const [concluidos, setConcluidos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const montadoRef = useRef(true)
  const usuariaIdRef = useRef(null)

  const { coords } = useLocalizacao()

  const carregarFreelas = async () => {
    const [dest, { data: ativos }, { count }] = await Promise.all([
      getFreelaDestaque(),
      getFreelasAtivos(),
      contarFreelasAtivos(),
    ])
    if (!montadoRef.current) return

    const listaAtivos = ativos || []
    let destaqueFinal = dest.data
    if (!destaqueFinal && listaAtivos.length > 0) {
      destaqueFinal = listaAtivos[0] // fallback: primeiro ativo
    }
    setDestaque(destaqueFinal || null)
    setOutras(listaAtivos.filter((f) => !destaqueFinal || f.id !== destaqueFinal.id).slice(0, 3))
    setTotalAtivos(count || 0)
  }

  const carregarRegistros = async () => {
    const [{ data: conc }, { data: avals }] = await Promise.all([getFreelasConcluidos(), getAvaliacoes()])
    if (!montadoRef.current) return
    setConcluidos(conc || [])
    setAvaliacoes(avals || [])
  }

  useEffect(() => {
    montadoRef.current = true
    carregarFreelas()
    carregarRegistros()

    const cancelarFreelas = assinarFreelas(() => carregarFreelas())

    let cancelarRegistros = () => {}
    getUsuariaId().then((uid) => {
      if (!montadoRef.current) return
      usuariaIdRef.current = uid
      cancelarRegistros = assinarRegistrosUsuaria(uid, () => carregarRegistros())
    })

    return () => {
      montadoRef.current = false
      cancelarFreelas()
      cancelarRegistros()
    }
  }, [])

  const destaqueView = useMemo(() => {
    if (!destaque) return null
    const distanciaKm = distanciaValida(coords, destaque.latitude, destaque.longitude)
    return {
      ...destaque,
      valorTexto: formatarValor(destaque),
      dataTexto: formatarData(destaque.data_servico),
      distanciaTexto: formatarDistancia(distanciaKm),
      localCard: [destaque.bairro, destaque.cidade].filter(Boolean).join(' · '),
    }
  }, [destaque, coords])

  const outrasView = useMemo(
    () =>
      outras.map((f) => {
        const distanciaKm = distanciaValida(coords, f.latitude, f.longitude)
        return {
          ...f,
          valorTexto: formatarValor(f),
          dataTexto: formatarData(f.data_servico),
          distanciaTexto: formatarDistancia(distanciaKm),
          localCard: [f.bairro, f.cidade].filter(Boolean).join(' · '),
        }
      }),
    [outras, coords],
  )

  const totalMes = totalDoMes(concluidos)
  const media = mediaReputacao(avaliacoes)
  const subtitulo = totalAtivos === 1 ? '1 oportunidade ativa' : `${totalAtivos} oportunidades ativas`

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <UserHeader title="Renda Rápida" subtitle={subtitulo} />

      <div className="-mt-5 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Próxima a você */}
        <h3 className="font-bold text-[#291662]">Próxima a você</h3>
        {destaqueView ? (
          <div className="mt-3 rounded-2xl border border-[#F3B6C9] bg-gradient-to-br from-[#FCEEF1] to-[#F9E1E8] p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-[16px] font-bold text-[#291662]">{destaqueView.titulo}</h4>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#291662]/80">
                  <span className="flex items-center gap-1">
                    <UserPinIcon className="h-4 w-4" /> {destaqueView.distanciaTexto || destaqueView.localCard || '—'}
                  </span>
                  {destaqueView.dataTexto && <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {destaqueView.dataTexto}</span>}
                  {destaqueView.horario && <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {destaqueView.horario}</span>}
                </div>
                <p className="mt-1 text-[13px] text-[#291662]/80">{destaqueView.contratante}</p>
              </div>
              <p className="text-xl font-bold text-[#D6479B]">{destaqueView.valorTexto}</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => navigate(`/freelas/${destaqueView.id}`)}
                className="flex-1 rounded-full border border-[#D6479B] bg-white py-2.5 text-[13px] font-semibold text-[#291662] transition-transform active:scale-95"
              >
                Ver detalhes
              </button>
              <ContatoFreela freela={destaqueView} />
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Nenhuma oportunidade em destaque no momento.
          </div>
        )}

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
        {outrasView.length > 0 ? (
          <div className="rounded-2xl border border-[#8F55E9]/25 bg-white p-2 shadow-sm">
            {outrasView.map((o, i) => (
              <div
                key={o.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/freelas/${o.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/freelas/${o.id}`)}
                className={`flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors active:bg-[#F6F1FE] ${
                  i < outrasView.length - 1 ? 'border-b border-[#291662]/10' : ''
                }`}
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#F1EAFD] text-[#8F55E9]">
                  <UserPinIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#291662]">{o.titulo}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#291662]/75">
                    <span className="flex items-center gap-0.5"><UserPinIcon className="h-3.5 w-3.5" /> {o.distanciaTexto || o.localCard || '—'}</span>
                    {o.dataTexto && <span className="flex items-center gap-0.5"><CalendarIcon className="h-3.5 w-3.5" /> {o.dataTexto}</span>}
                    {o.horario && <span className="flex items-center gap-0.5"><ClockIcon className="h-3.5 w-3.5" /> {o.horario}</span>}
                  </div>
                </div>
                <span className="flex items-center gap-0.5 font-bold text-[#D6479B]">
                  {o.valorTexto} <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Nenhuma outra oportunidade disponível ainda.
          </div>
        )}

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
            <p className="text-lg font-bold text-[#291662]">{formatarReais(totalMes)}</p>
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
            <p className="mt-2 text-[13px] text-[#291662]/70">Média geral</p>
            <p className="text-lg font-bold text-[#291662]">{media == null ? 'Sem avaliações' : media}</p>
          </button>
        </div>
      </div>

      {/* Modal Seu saldo */}
      <Modal open={saldoAberto} onClose={() => setSaldoAberto(false)} title="Seu saldo">
        <p className="-mt-2 text-[14px] font-semibold text-[#291662]">Freelas concluídos este mês</p>
        {concluidos.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Você ainda não possui freelas concluídos.
          </p>
        ) : (
          <>
            <div className="mt-3 divide-y divide-[#291662]/10">
              {concluidos.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 text-[14px]">
                  <span className="text-[#291662]">{r.freela?.titulo || 'Freela'}</span>
                  <span className="font-bold text-[#2EA043]">{formatarReais(r.valor_confirmado)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
              <span className="text-[14px] font-semibold text-[#291662]">Total do mês</span>
              <span className="text-lg font-bold text-[#291662]">{formatarReais(totalMes)}</span>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setSaldoAberto(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Fechar
        </button>
      </Modal>

      {/* Modal Sua reputação */}
      <Modal open={reputacaoAberta} onClose={() => setReputacaoAberta(false)} title="Sua reputação">
        <p className="-mt-2 text-[14px] font-semibold text-[#291662]">Avaliações de contratantes</p>
        {avaliacoes.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Você ainda não recebeu avaliações.
          </p>
        ) : (
          <>
            <div className="mt-3 space-y-3">
              {avaliacoes.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvaliacaoSel(a)}
                  className="w-full rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3 text-left transition-transform hover:border-[#8F55E9]/40 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#291662]">{a.contratante_nome || 'Contratante'}</span>
                    <span className="flex items-center gap-1 text-[14px] font-bold text-[#291662]">
                      <StarIcon className="h-4 w-4 text-[#F4B400]" /> {a.nota}
                    </span>
                  </div>
                  {a.comentario && (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-[13px] text-[#291662]/80">“{a.comentario}”</p>
                      <ChevronRight className="h-4 w-4 flex-none text-[#291662]/40" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
              <span className="text-[14px] font-semibold text-[#291662]">Média</span>
              <span className="text-lg font-bold text-[#291662]">{media}</span>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setReputacaoAberta(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Fechar
        </button>
      </Modal>

      {/* Modal de detalhes de uma avaliação */}
      <Modal open={!!avaliacaoSel} onClose={() => setAvaliacaoSel(null)} title={avaliacaoSel?.contratante_nome || 'Avaliação'}>
        {avaliacaoSel && (
          <>
            <div className="space-y-2 text-[14px] text-[#291662]">
              <p><span className="font-semibold">Contratante:</span> {avaliacaoSel.contratante_nome || '—'}</p>
              {avaliacaoSel.freela?.titulo && <p><span className="font-semibold">Serviço:</span> {avaliacaoSel.freela.titulo}</p>}
              <p><span className="font-semibold">Data:</span> {formatarData(avaliacaoSel.created_at)}</p>
              <p className="flex items-center gap-1">
                <span className="font-semibold">Nota:</span>
                <StarIcon className="h-4 w-4 text-[#F4B400]" /> {avaliacaoSel.nota}
              </p>
            </div>
            {avaliacaoSel.comentario && (
              <div className="mt-4 rounded-2xl bg-[#F6F1FE] p-4">
                <p className="text-[13px] font-semibold text-[#291662]">Comentário</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#291662]/80">“{avaliacaoSel.comentario}”</p>
              </div>
            )}
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
