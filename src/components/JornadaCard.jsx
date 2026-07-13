import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { getUsuariaId } from '../utils/freelasRealizadosService'
import {
  TIPOS_JORNADA,
  getJornadaAtiva,
  listarHistoricoJornadas,
  criarJornada,
  incrementarProgresso,
  concluirJornada,
  cancelarJornada,
  assinarJornadas,
  sincronizarProgressoFreela,
  calcularPercentual,
  calcularProximaEtapa,
} from '../utils/jornadaService'

function formatarDataBr(valor) {
  if (!valor) return ''
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) {
    const d2 = new Date(`${valor}T00:00:00`)
    return Number.isNaN(d2.getTime()) ? '' : d2.toLocaleDateString('pt-BR')
  }
  return d.toLocaleDateString('pt-BR')
}

const tipoRotulo = (tipo) => TIPOS_JORNADA.find((t) => t.valor === tipo)?.rotulo || tipo

export default function JornadaCard() {
  const [jornada, setJornada] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [modalCriar, setModalCriar] = useState(false)
  const [modalHistorico, setModalHistorico] = useState(false)
  const [modalParabens, setModalParabens] = useState(false)
  const [historico, setHistorico] = useState([])

  // Form de criação
  const [fTitulo, setFTitulo] = useState('')
  const [fTipo, setFTipo] = useState('freela')
  const [fQtd, setFQtd] = useState('1')
  const [fPrazo, setFPrazo] = useState('')
  const [fDescricao, setFDescricao] = useState('')
  const [fAuto, setFAuto] = useState(true)
  const [erroForm, setErroForm] = useState('')

  const montadoRef = useRef(true)
  const usuariaIdRef = useRef(null)

  const carregar = async () => {
    const { data, error } = await getJornadaAtiva()
    if (!montadoRef.current) return
    if (error) {
      setErro('Não foi possível carregar sua jornada.')
      setCarregando(false)
      return
    }
    setErro('')

    // Sincroniza meta de freela automática com freelas concluídos.
    if (data && data.tipo === 'freela' && data.atualizacao_automatica) {
      const sync = await sincronizarProgressoFreela(data)
      if (!montadoRef.current) return
      const atual = sync.data || data
      setJornada(atual.status === 'ativa' ? atual : null)
      if (sync.mudou && atual.status === 'concluida') setModalParabens(true)
    } else {
      setJornada(data)
    }
    setCarregando(false)
  }

  useEffect(() => {
    montadoRef.current = true
    let cancelarJornadaRt = () => {}

    async function iniciar() {
      const uid = await getUsuariaId()
      if (!montadoRef.current) return
      usuariaIdRef.current = uid
      await carregar()
      cancelarJornadaRt = assinarJornadas(uid, () => carregar())
    }
    iniciar()

    return () => {
      montadoRef.current = false
      cancelarJornadaRt()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tipoSelecionado = TIPOS_JORNADA.find((t) => t.valor === fTipo)
  const suportaAuto = !!tipoSelecionado?.automatico

  const abrirCriar = () => {
    setFTitulo('')
    setFTipo('freela')
    setFQtd('1')
    setFPrazo('')
    setFDescricao('')
    setFAuto(true)
    setErroForm('')
    setModalCriar(true)
  }

  const submeterCriar = async () => {
    setErroForm('')
    const qtd = parseInt(fQtd, 10)
    if (!fTitulo.trim()) {
      setErroForm('Informe um título para a meta.')
      return
    }
    if (!Number.isFinite(qtd) || qtd < 1) {
      setErroForm('A quantidade deve ser pelo menos 1.')
      return
    }
    setSalvando(true)
    const { error } = await criarJornada({
      titulo: fTitulo,
      tipo: fTipo,
      meta_total: fTipo === 'curriculo' ? 1 : qtd,
      prazo: fPrazo || null,
      descricao: fDescricao,
      atualizacao_automatica: suportaAuto ? fAuto : false,
    })
    setSalvando(false)
    if (error) {
      setErroForm(error.message || 'Não foi possível criar a meta.')
      return
    }
    setModalCriar(false)
    carregar()
  }

  const atualizarProgresso = async () => {
    if (!jornada) return
    setSalvando(true)
    const res = await incrementarProgresso(jornada.id, 1)
    setSalvando(false)
    if (!res.error && res.concluiu) setModalParabens(true)
    carregar()
  }

  const marcarConcluida = async () => {
    if (!jornada) return
    setSalvando(true)
    const { error } = await concluirJornada(jornada.id)
    setSalvando(false)
    if (!error) {
      setModalParabens(true)
      carregar()
    }
  }

  const cancelar = async () => {
    if (!jornada) return
    setSalvando(true)
    await cancelarJornada(jornada.id)
    setSalvando(false)
    carregar()
  }

  const abrirHistorico = async () => {
    const { data } = await listarHistoricoJornadas()
    if (!montadoRef.current) return
    setHistorico(data || [])
    setModalHistorico(true)
  }

  // ---- Render ----

  const Card = ({ children }) => (
    <div className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-4 shadow-sm">{children}</div>
  )

  let conteudo
  if (carregando) {
    conteudo = (
      <Card>
        <h2 className="text-lg font-bold text-[#291662]">Sua Jornada</h2>
        <p className="mt-2 text-[13px] text-[#291662]/70">Carregando...</p>
      </Card>
    )
  } else if (erro) {
    conteudo = (
      <Card>
        <h2 className="text-lg font-bold text-[#291662]">Sua Jornada</h2>
        <p className="mt-2 text-[13px] font-medium text-[#D6479B]">{erro}</p>
      </Card>
    )
  } else if (!jornada) {
    conteudo = (
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#291662]">Sua Jornada</h2>
            <p className="mt-0.5 text-[13px] text-[#291662]/80">Você ainda não definiu um objetivo.</p>
          </div>
          <div className="ml-2 text-3xl">🎯</div>
        </div>
        <button
          type="button"
          onClick={abrirCriar}
          className="mt-4 w-full rounded-full bg-[#8F55E9] py-3 text-[14px] font-semibold text-white active:scale-[0.99]"
        >
          Criar minha primeira meta
        </button>
        <button
          type="button"
          onClick={abrirHistorico}
          className="mt-2 w-full text-center text-[13px] font-medium text-[#291662]/70 active:text-[#8F55E9]"
        >
          Ver histórico
        </button>
      </Card>
    )
  } else {
    const pct = calcularPercentual(jornada)
    const proxima = calcularProximaEtapa(jornada)
    const manual = !(jornada.tipo === 'freela' && jornada.atualizacao_automatica)
    const unidade = jornada.meta_total === 1 ? 'concluído' : 'concluídos'
    conteudo = (
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#291662]">Sua Jornada</h2>
            <p className="mt-0.5 text-[13px] text-[#291662]/80">Objetivo atual: {jornada.titulo}</p>
          </div>
          <div className="ml-2 text-3xl">🎯</div>
        </div>

        <p className="mt-2 text-[12px] font-medium text-[#291662]/70">
          {jornada.progresso_atual} de {jornada.meta_total} {unidade}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E0D4F5]">
            <div className="h-full rounded-full bg-[#8F55E9] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[13px] font-bold text-[#291662]">{pct}%</span>
        </div>

        <p className="mt-3 text-[12px] text-[#291662]/70">Próxima etapa:</p>
        <p className="text-[13px] font-medium text-[#291662]">{proxima}</p>

        {jornada.prazo && (
          <p className="mt-2 text-[12px] text-[#291662]/70">Prazo: {formatarDataBr(jornada.prazo)}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {manual && jornada.meta_total > 1 && (
            <button
              type="button"
              onClick={atualizarProgresso}
              disabled={salvando}
              className="flex-1 rounded-full bg-[#8F55E9] py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              + Registrar progresso
            </button>
          )}
          {manual && (
            <button
              type="button"
              onClick={marcarConcluida}
              disabled={salvando}
              className="flex-1 rounded-full border border-[#2EA043] py-2.5 text-[13px] font-semibold text-[#2EA043] disabled:opacity-60"
            >
              Concluir meta
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" onClick={cancelar} disabled={salvando} className="text-[12px] font-medium text-[#D6479B]/80 active:text-[#D6479B]">
            Cancelar meta
          </button>
          <button type="button" onClick={abrirHistorico} className="text-[12px] font-medium text-[#291662]/70 active:text-[#8F55E9]">
            Ver histórico
          </button>
        </div>
      </Card>
    )
  }

  return (
    <>
      {conteudo}

      {/* Modal criar meta */}
      <Modal open={modalCriar} onClose={() => setModalCriar(false)} title="Criar meta">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#291662]">Título da meta</label>
            <input
              type="text"
              value={fTitulo}
              onChange={(e) => { setFTitulo(e.target.value); setErroForm('') }}
              placeholder="Ex.: Concluir 3 freelas"
              className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#291662]">Tipo</label>
            <select
              value={fTipo}
              onChange={(e) => {
                const novo = e.target.value
                setFTipo(novo)
                if (novo === 'curriculo') setFQtd('1')
                const auto = TIPOS_JORNADA.find((t) => t.valor === novo)?.automatico
                setFAuto(!!auto)
                setErroForm('')
              }}
              className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
            >
              {TIPOS_JORNADA.map((t) => (
                <option key={t.valor} value={t.valor}>{t.rotulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#291662]">Quantidade</label>
            <input
              type="number"
              min="1"
              value={fTipo === 'curriculo' ? 1 : fQtd}
              disabled={fTipo === 'curriculo'}
              onChange={(e) => { setFQtd(e.target.value); setErroForm('') }}
              className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9] disabled:bg-[#F4F0FA] disabled:text-[#291662]/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#291662]">Prazo (opcional)</label>
            <input
              type="date"
              value={fPrazo}
              onChange={(e) => setFPrazo(e.target.value)}
              className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#291662]">Descrição (opcional)</label>
            <textarea
              value={fDescricao}
              onChange={(e) => setFDescricao(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
            />
          </div>
          {suportaAuto && (
            <label className="flex items-center gap-2 text-[13px] text-[#291662]">
              <input type="checkbox" checked={fAuto} onChange={(e) => setFAuto(e.target.checked)} className="h-4 w-4 accent-[#8F55E9]" />
              Atualizar automaticamente pelos meus freelas concluídos
            </label>
          )}
          {erroForm && <p className="text-center text-[13px] font-medium text-[#D6479B]">{erroForm}</p>}
        </div>
        <button
          type="button"
          onClick={submeterCriar}
          disabled={salvando}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {salvando ? 'Criando...' : 'Criar meta'}
        </button>
        <button
          type="button"
          onClick={() => setModalCriar(false)}
          className="mt-2 w-full rounded-full py-3 text-[14px] font-semibold text-[#291662]/70"
        >
          Cancelar
        </button>
      </Modal>

      {/* Modal parabéns */}
      <Modal open={modalParabens} onClose={() => setModalParabens(false)} title="Parabéns! 🎉">
        <p className="text-[14px] leading-relaxed text-[#291662]/80">
          Você concluiu sua meta! Ela foi movida para o seu histórico de conquistas.
        </p>
        <button
          type="button"
          onClick={() => {
            setModalParabens(false)
            abrirCriar()
          }}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Criar nova meta
        </button>
        <button
          type="button"
          onClick={() => setModalParabens(false)}
          className="mt-2 w-full rounded-full py-3 text-[14px] font-semibold text-[#291662]/70"
        >
          Fechar
        </button>
      </Modal>

      {/* Modal histórico */}
      <Modal open={modalHistorico} onClose={() => setModalHistorico(false)} title="Minhas conquistas">
        {historico.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-6 text-center text-[14px] text-[#291662]/70">
            Você ainda não possui metas no histórico.
          </p>
        ) : (
          <div className="space-y-3">
            {historico.map((h) => (
              <div key={h.id} className="rounded-2xl border border-[#8F55E9]/20 bg-[#F6F1FE] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#291662]">{h.titulo}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      h.status === 'concluida' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {h.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#291662]/70">
                  {tipoRotulo(h.tipo)} • {h.progresso_atual} de {h.meta_total}
                  {h.concluida_em ? ` • ${formatarDataBr(h.concluida_em)}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setModalHistorico(false)}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Fechar
        </button>
      </Modal>
    </>
  )
}
