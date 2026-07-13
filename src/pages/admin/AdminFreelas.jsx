import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer'
import HeaderBack from '../../components/HeaderBack'
import {
  alterarDestaqueFreela,
  alterarStatusFreela,
  excluirFreela,
  listarTodosFreelas,
  verificarAdmin,
} from '../../utils/adminFreelasService'

const STATUS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'ativa', rotulo: 'Ativos' },
  { valor: 'rascunho', rotulo: 'Rascunhos' },
  { valor: 'encerrada', rotulo: 'Encerrados' },
]

const CATEGORIAS = [
  '',
  'Audiovisual',
  'Atendimento',
  'Beleza',
  'Cozinha',
  'Cuidados',
  'Eventos',
  'Limpeza',
  'Marketing',
  'Produção',
  'Tecnologia',
  'Outros',
]

function formatarData(valor) {
  if (!valor) return 'Não informada'

  const data = new Date(`${valor}T12:00:00`)

  if (Number.isNaN(data.getTime())) {
    return 'Não informada'
  }

  return data.toLocaleDateString('pt-BR')
}

function formatarValor(freela) {
  if (freela.valor_exibir) {
    return freela.valor_exibir
  }

  if (freela.valor_min == null) {
    return 'Não informado'
  }

  return Number(freela.valor_min).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  )
}

function classeStatus(status) {
  if (status === 'ativa') {
    return 'bg-green-100 text-green-700'
  }

  if (status === 'rascunho') {
    return 'bg-yellow-100 text-yellow-700'
  }

  if (status === 'encerrada') {
    return 'bg-gray-200 text-gray-700'
  }

  return 'bg-gray-100 text-gray-600'
}

export default function AdminFreelas() {
  const navigate = useNavigate()

  const [freelas, setFreelas] = useState([])
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [categoria, setCategoria] = useState('')
  const [destaque, setDestaque] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [processandoId, setProcessandoId] =
    useState('')
  const [erro, setErro] = useState('')
  const [autorizada, setAutorizada] =
    useState(false)

  async function carregarFreelas(filtros = {}) {
    setCarregando(true)
    setErro('')

    const { data, error } =
      await listarTodosFreelas({
        busca:
          filtros.busca !== undefined
            ? filtros.busca
            : busca,
        status:
          filtros.status !== undefined
            ? filtros.status
            : status,
        categoria:
          filtros.categoria !== undefined
            ? filtros.categoria
            : categoria,
        destaque:
          filtros.destaque !== undefined
            ? filtros.destaque
            : destaque,
      })

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível carregar os freelas administrativos.',
      )

      setFreelas([])
    } else {
      setFreelas(data)
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

      const { data, error } =
        await listarTodosFreelas()

      if (!ativa) return

      if (error) {
        console.error(error)

        setErro(
          'Não foi possível carregar os freelas administrativos.',
        )

        setFreelas([])
      } else {
        setFreelas(data)
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
      total: freelas.length,
      ativa: freelas.filter(
        (freela) => freela.status === 'ativa',
      ).length,
      rascunho: freelas.filter(
        (freela) => freela.status === 'rascunho',
      ).length,
      encerrada: freelas.filter(
        (freela) => freela.status === 'encerrada',
      ).length,
      destaque: freelas.filter(
        (freela) => freela.destaque === true,
      ).length,
    }
  }, [freelas])

  async function mudarStatus(id, novoStatus) {
    setProcessandoId(id)
    setErro('')

    const { error } = await alterarStatusFreela(
      id,
      novoStatus,
    )

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível alterar o status do freela.',
      )
    } else {
      await carregarFreelas()
    }

    setProcessandoId('')
  }

  async function mudarDestaque(
    id,
    novoDestaque,
  ) {
    setProcessandoId(id)
    setErro('')

    const { error } =
      await alterarDestaqueFreela(
        id,
        novoDestaque,
      )

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível alterar o destaque do freela.',
      )
    } else {
      await carregarFreelas()
    }

    setProcessandoId('')
  }

  async function removerFreela(freela) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o freela "${freela.titulo}"?\n\nEssa ação não poderá ser desfeita.`,
    )

    if (!confirmou) return

    setProcessandoId(freela.id)
    setErro('')

    const { error } = await excluirFreela(
      freela.id,
    )

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível excluir o freela.',
      )
    } else {
      await carregarFreelas()
    }

    setProcessandoId('')
  }

  async function limparFiltros() {
    setBusca('')
    setStatus('')
    setCategoria('')
    setDestaque('')

    await carregarFreelas({
      busca: '',
      status: '',
      categoria: '',
      destaque: '',
    })
  }

  if (carregando && !autorizada) {
    return (
      <PageContainer className="bg-[#EFE7FB]">
        <HeaderBack
          title="Freelas administrativos"
          to="/admin"
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

        <div className="mx-5 mt-8 rounded-3xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-[20px] font-bold text-[#291662]">
            Acesso não autorizado
          </h1>

          <p className="mt-3 text-[14px] leading-relaxed text-[#291662]/70">
            Esta área está disponível apenas
            para administradoras do TrajetEla.
          </p>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
          >
            Voltar ao aplicativo
          </button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <HeaderBack
        title="Gerenciar freelas"
        to="/admin"
      />

      <div className="px-4 pb-28">
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#291662]">
              Freelas
            </h1>

            <p className="text-[13px] text-[#291662]/65">
              Cadastre e gerencie as
              oportunidades rápidas.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/admin/freelas/novo')
            }
            className="rounded-full bg-[#8F55E9] px-5 py-3 text-[14px] font-semibold text-white shadow-sm"
          >
            + Novo freela
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
              Ativos
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
              Encerrados
            </p>

            <p className="mt-1 text-[24px] font-bold text-gray-600">
              {totais.encerrada}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-[#F1EAFD] px-4 py-3">
          <p className="text-[13px] font-semibold text-[#8F55E9]">
            {totais.destaque}{' '}
            {totais.destaque === 1
              ? 'freela em destaque'
              : 'freelas em destaque'}
          </p>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4 shadow-sm">
          <input
            type="search"
            value={busca}
            onChange={(evento) =>
              setBusca(evento.target.value)
            }
            placeholder="Buscar título, contratante, categoria ou cidade..."
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
              value={categoria}
              onChange={(evento) =>
                setCategoria(evento.target.value)
              }
              className="rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none"
            >
              <option value="">
                Todas as categorias
              </option>

              {CATEGORIAS.filter(Boolean).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>

            <select
              value={destaque}
              onChange={(evento) =>
                setDestaque(evento.target.value)
              }
              className="rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none"
            >
              <option value="">
                Todos os destaques
              </option>

              <option value="sim">
                Somente destaques
              </option>

              <option value="nao">
                Sem destaque
              </option>
            </select>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => carregarFreelas()}
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
              Carregando freelas...
            </p>
          ) : freelas.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="text-[16px] font-bold text-[#291662]">
                Nenhum freela encontrado
              </p>

              <p className="mt-2 text-[14px] text-[#291662]/60">
                Cadastre um novo freela ou
                altere os filtros.
              </p>
            </div>
          ) : (
            freelas.map((freela) => {
              const processando =
                processandoId === freela.id

              return (
                <article
                  key={freela.id}
                  className="rounded-3xl border border-[#8F55E9]/20 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[17px] font-bold text-[#291662]">
                          {freela.titulo}
                        </h2>

                        {freela.destaque && (
                          <span className="rounded-full bg-[#FBE7F3] px-2.5 py-1 text-[11px] font-semibold text-[#D6479B]">
                            Destaque
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[14px] text-[#291662]/70">
                        {freela.contratante}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold ${classeStatus(
                        freela.status,
                      )}`}
                    >
                      {freela.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <p className="text-[#291662]/50">
                        Categoria
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {freela.categoria || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Valor
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {formatarValor(freela)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Data
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {formatarData(
                          freela.data_servico,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Horário
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {freela.horario || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Duração
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {freela.duracao_estimada ||
                          '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#291662]/50">
                        Localização
                      </p>

                      <p className="font-semibold text-[#291662]">
                        {[
                          freela.bairro,
                          freela.cidade,
                        ]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/freelas/${freela.id}/editar`,
                        )
                      }
                      disabled={processando}
                      className="rounded-full border border-[#8F55E9] py-2.5 text-[13px] font-semibold text-[#291662] disabled:opacity-50"
                    >
                      Editar
                    </button>

                    {freela.status !== 'ativa' && (
                      <button
                        type="button"
                        onClick={() =>
                          mudarStatus(
                            freela.id,
                            'ativa',
                          )
                        }
                        disabled={processando}
                        className="rounded-full bg-green-600 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        Reativar
                      </button>
                    )}

                    {freela.status === 'ativa' && (
                      <button
                        type="button"
                        onClick={() =>
                          mudarStatus(
                            freela.id,
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
                      onClick={() =>
                        mudarDestaque(
                          freela.id,
                          !freela.destaque,
                        )
                      }
                      disabled={processando}
                      className={`rounded-full border py-2.5 text-[13px] font-semibold disabled:opacity-50 ${
                        freela.destaque
                          ? 'border-[#D6479B] text-[#D6479B]'
                          : 'border-[#8F55E9] text-[#8F55E9]'
                      }`}
                    >
                      {freela.destaque
                        ? 'Remover destaque'
                        : 'Destacar'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removerFreela(freela)
                      }
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