import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer'
import HeaderBack from '../../components/HeaderBack'
import {
  alterarStatusVaga,
  excluirVaga,
  listarTodasVagas,
  verificarAdmin,
} from '../../utils/adminVagasService'

const STATUS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'ativa', rotulo: 'Ativas' },
  { valor: 'rascunho', rotulo: 'Rascunhos' },
  { valor: 'pausada', rotulo: 'Pausadas' },
  { valor: 'encerrada', rotulo: 'Encerradas' },
]

const AREAS = [
  '',
  'Vendas',
  'Administrativo',
  'Educação',
  'Marketing',
  'Audiovisual',
  'Comunicação Social',
  'Atendimento',
  'Limpeza',
  'Gastronomia',
  'Beleza',
  'Cuidados',
  'Tecnologia',
  'Outros',
]

const MODALIDADES = [
  '',
  'Presencial',
  'Híbrido',
  'Remoto',
]

function formatarData(valor) {
  if (!valor) return '—'

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return '—'
  }

  return data.toLocaleDateString('pt-BR')
}

function formatarSalario(vaga) {
  if (vaga.salario_exibir) {
    return vaga.salario_exibir
  }

  const formatar = (valor) =>
    `R$ ${Number(valor).toLocaleString('pt-BR')}`

  if (
    vaga.salario_min != null &&
    vaga.salario_max != null
  ) {
    if (
      Number(vaga.salario_min) ===
      Number(vaga.salario_max)
    ) {
      return formatar(vaga.salario_min)
    }

    return `${formatar(vaga.salario_min)} a ${formatar(
      vaga.salario_max,
    )}`
  }

  if (vaga.salario_min != null) {
    return formatar(vaga.salario_min)
  }

  if (vaga.salario_max != null) {
    return formatar(vaga.salario_max)
  }

  return 'Não informado'
}

function classeStatus(status) {
  if (status === 'ativa') {
    return 'bg-green-100 text-green-700'
  }

  if (status === 'rascunho') {
    return 'bg-yellow-100 text-yellow-700'
  }

  if (status === 'pausada') {
    return 'bg-orange-100 text-orange-700'
  }

  if (status === 'encerrada') {
    return 'bg-gray-200 text-gray-700'
  }

  return 'bg-gray-100 text-gray-600'
}

export default function AdminVagas() {
  const navigate = useNavigate()

  const [vagas, setVagas] = useState([])
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [area, setArea] = useState('')
  const [modalidade, setModalidade] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [processandoId, setProcessandoId] = useState('')
  const [erro, setErro] = useState('')
  const [autorizada, setAutorizada] = useState(false)

  async function carregarVagas() {
    setCarregando(true)
    setErro('')

    const { data, error } = await listarTodasVagas({
      busca,
      status,
      area,
      modalidade,
    })

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível carregar as vagas administrativas.',
      )

      setVagas([])
    } else {
      setVagas(data)
    }

    setCarregando(false)
  }

  useEffect(() => {
    let ativa = true

    async function iniciar() {
      setCarregando(true)

      const resultado = await verificarAdmin()

      if (!ativa) return

      if (resultado.error) {
        console.error(resultado.error)
      }

      if (!resultado.isAdmin) {
        setAutorizada(false)
        setCarregando(false)
        return
      }

      setAutorizada(true)

      const { data, error } = await listarTodasVagas()

      if (!ativa) return

      if (error) {
        console.error(error)

        setErro(
          'Não foi possível carregar as vagas administrativas.',
        )

        setVagas([])
      } else {
        setVagas(data)
      }

      setCarregando(false)
    }

    iniciar()

    return () => {
      ativa = false
    }
  }, [])

  const totais = useMemo(() => {
    return {
      total: vagas.length,
      ativa: vagas.filter(
        (vaga) => vaga.status === 'ativa',
      ).length,
      rascunho: vagas.filter(
        (vaga) => vaga.status === 'rascunho',
      ).length,
      pausada: vagas.filter(
        (vaga) => vaga.status === 'pausada',
      ).length,
      encerrada: vagas.filter(
        (vaga) => vaga.status === 'encerrada',
      ).length,
    }
  }, [vagas])

  async function mudarStatus(id, novoStatus) {
    setProcessandoId(id)
    setErro('')

    const { error } = await alterarStatusVaga(
      id,
      novoStatus,
    )

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível alterar o status da vaga.',
      )
    } else {
      await carregarVagas()
    }

    setProcessandoId('')
  }

  async function removerVaga(vaga) {
    const confirmou = window.confirm(
      `Deseja realmente excluir a vaga "${vaga.titulo}"?\n\nEssa ação não poderá ser desfeita.`,
    )

    if (!confirmou) return

    setProcessandoId(vaga.id)
    setErro('')

    const { error } = await excluirVaga(vaga.id)

    if (error) {
      console.error(error)
      setErro('Não foi possível excluir a vaga.')
    } else {
      await carregarVagas()
    }

    setProcessandoId('')
  }

  function limparFiltros() {
    setBusca('')
    setStatus('')
    setArea('')
    setModalidade('')
  }

  if (carregando && !autorizada) {
    return (
      <PageContainer className="bg-[#EFE7FB]">
        <HeaderBack
          title="Vagas administrativas"
          to="/home"
        />

        <p className="px-6 pt-10 text-center text-[14px] font-medium text-[#291662]/70">
          Verificando acesso...
        </p>
      </PageContainer>
    )
  }

  if (!autorizada) {
    return (
      <PageContainer className="bg-[#EFE7FB]">
        <HeaderBack
          title="Área administrativa"
          to="/home"
        />

        <div className="mx-5 mt-8 rounded-3xl border border-[#E84C8A]/25 bg-white p-6 text-center shadow-sm">
          <h1 className="text-[20px] font-bold text-[#291662]">
            Acesso não autorizado
          </h1>

          <p className="mt-3 text-[14px] leading-relaxed text-[#291662]/70">
            Esta área está disponível apenas para administradoras do
            TrajetEla.
          </p>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
          >
            Voltar ao início
          </button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <HeaderBack
        title="Gerenciar vagas"
        to="/home"
      />

      <div className="px-4 pb-28">
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#291662]">
              Vagas
            </h1>

            <p className="text-[13px] text-[#291662]/65">
              Cadastre e gerencie as oportunidades.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/vagas/nova')}
            className="rounded-full bg-[#8F55E9] px-5 py-3 text-[14px] font-semibold text-white shadow-sm"
          >
            + Nova vaga
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] font-medium text-[#291662]/55">
              Total
            </p>

            <p className="mt-1 text-[24px] font-bold text-[#291662]">
              {totais.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] font-medium text-[#291662]/55">
              Ativas
            </p>

            <p className="mt-1 text-[24px] font-bold text-green-600">
              {totais.ativa}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] font-medium text-[#291662]/55">
              Rascunhos
            </p>

            <p className="mt-1 text-[24px] font-bold text-yellow-600">
              {totais.rascunho}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] font-medium text-[#291662]/55">
              Pausadas/encerradas
            </p>

            <p className="mt-1 text-[24px] font-bold text-orange-600">
              {totais.pausada + totais.encerrada}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4 shadow-sm">
          <input
            type="search"
            value={busca}
            onChange={(evento) =>
              setBusca(evento.target.value)
            }
            placeholder="Buscar título, empresa, área ou cidade..."
            className="w-full rounded-2xl border border-[#291662]/15 px-4 py-3 text-[14px] text-[#291662] outline-none focus:border-[#8F55E9]"
          />

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={status}
              onChange={(evento) =>
                setStatus(evento.target.value)
              }
              className="rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none"
            >
              {STATUS.map((item) => (
                <option
                  key={item.valor}
                  value={item.valor}
                >
                  {item.rotulo}
                </option>
              ))}
            </select>

            <select
              value={area}
              onChange={(evento) =>
                setArea(evento.target.value)
              }
              className="rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none"
            >
              <option value="">Todas as áreas</option>

              {AREAS.filter(Boolean).map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <select
              value={modalidade}
              onChange={(evento) =>
                setModalidade(evento.target.value)
              }
              className="rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none"
            >
              <option value="">
                Todas as modalidades
              </option>

              {MODALIDADES.filter(Boolean).map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={carregarVagas}
              className="flex-1 rounded-full bg-[#8F55E9] py-3 text-[14px] font-semibold text-white"
            >
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={limparFiltros}
              className="flex-1 rounded-full border border-[#8F55E9] py-3 text-[14px] font-semibold text-[#291662]"
            >
              Limpar
            </button>
          </div>
        </div>

        {erro && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
            {erro}
          </p>
        )}

        <div className="mt-5 space-y-4">
          {carregando ? (
            <p className="py-10 text-center text-[14px] font-medium text-[#291662]/65">
              Carregando vagas...
            </p>
          ) : vagas.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="text-[16px] font-bold text-[#291662]">
                Nenhuma vaga encontrada
              </p>

              <p className="mt-2 text-[14px] text-[#291662]/60">
                Cadastre uma nova vaga ou altere os filtros.
              </p>
            </div>
          ) : (
            vagas.map((vaga) => {
              const processando =
                processandoId === vaga.id

              return (
                <article
                  key={vaga.id}
                  className="rounded-3xl border border-[#8F55E9]/20 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[17px] font-bold text-[#291662]">
                        {vaga.titulo}
                      </h2>

                      <p className="mt-1 text-[14px] text-[#291662]/70">
                        {vaga.empresa}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold ${classeStatus(
                        vaga.status,
                      )}`}
                    >
                      {vaga.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <p className="text-[#291662]/50">
                        Área
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {vaga.area || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Modalidade
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {vaga.modalidade || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Localização
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {[vaga.bairro, vaga.cidade]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Salário
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {formatarSalario(vaga)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Publicada
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {formatarData(vaga.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Prazo
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {formatarData(vaga.data_limite)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/vagas/${vaga.id}/editar`,
                        )
                      }
                      disabled={processando}
                      className="rounded-full border border-[#8F55E9] py-2.5 text-[13px] font-semibold text-[#291662] disabled:opacity-50"
                    >
                      Editar
                    </button>

                    {vaga.status !== 'ativa' && (
                      <button
                        type="button"
                        onClick={() =>
                          mudarStatus(vaga.id, 'ativa')
                        }
                        disabled={processando}
                        className="rounded-full bg-green-600 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        Ativar
                      </button>
                    )}

                    {vaga.status === 'ativa' && (
                      <button
                        type="button"
                        onClick={() =>
                          mudarStatus(vaga.id, 'pausada')
                        }
                        disabled={processando}
                        className="rounded-full bg-orange-500 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        Pausar
                      </button>
                    )}

                    {vaga.status !== 'encerrada' && (
                      <button
                        type="button"
                        onClick={() =>
                          mudarStatus(
                            vaga.id,
                            'encerrada',
                          )
                        }
                        disabled={processando}
                        className="rounded-full border border-gray-400 py-2.5 text-[13px] font-semibold text-gray-700 disabled:opacity-50"
                      >
                        Encerrar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removerVaga(vaga)}
                      disabled={processando}
                      className="rounded-full border border-red-400 py-2.5 text-[13px] font-semibold text-red-600 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>

                  {processando && (
                    <p className="mt-3 text-center text-[12px] font-medium text-[#8F55E9]">
                      Processando...
                    </p>
                  )}
                </article>
              )
            })
          )}
        </div>
      </div>
    </PageContainer>
  )
}