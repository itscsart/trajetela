import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer'
import HeaderBack from '../../components/HeaderBack'
import {
  contarVagasPorStatus,
  verificarAdmin,
} from '../../utils/adminVagasService'
import {
  contarFreelasPorStatus,
} from '../../utils/adminFreelasService'

function IconeVagas() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
      <path d="M10 12v2h4v-2" />
    </svg>
  )
}

function IconeFreelas() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      <path d="M13 2 4.5 12.5a1 1 0 0 0 .8 1.6H11l-1 7.9 8.5-10.5a1 1 0 0 0-.8-1.6H12L13 2Z" />
    </svg>
  )
}

function IconeAplicativo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect x="4" y="2" width="16" height="20" rx="3" />
      <path d="M9 18h6" />
    </svg>
  )
}

function IconeConfiguracoes() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-3v-.78a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 5 15.74a1.7 1.7 0 0 0-1.56-1.03H2.66v-3h.78A1.7 1.7 0 0 0 5 10.68a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 8.66 7a1.7 1.7 0 0 0 1.03-1.56V4.66h3v.78A1.7 1.7 0 0 0 13.72 7a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.78v3h-.78A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  )
}

function CartaoResumo({
  titulo,
  total,
  ativas,
  rascunhos,
}) {
  return (
    <div className="rounded-3xl border border-[#8F55E9]/15 bg-white p-5 shadow-sm">
      <p className="text-[13px] font-semibold text-[#291662]/60">
        {titulo}
      </p>

      <p className="mt-1 text-[30px] font-extrabold text-[#291662]">
        {total}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
          {ativas} ativas
        </span>

        <span className="rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-semibold text-yellow-700">
          {rascunhos} rascunhos
        </span>
      </div>
    </div>
  )
}

function CartaoModulo({
  titulo,
  descricao,
  Icone,
  textoBotao,
  onClick,
  desabilitado = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      className={`w-full rounded-3xl border bg-white p-5 text-left shadow-sm transition-transform active:scale-[0.99] ${
        desabilitado
          ? 'cursor-not-allowed border-gray-200 opacity-55'
          : 'border-[#8F55E9]/20'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#F1EAFD] text-[#8F55E9]">
          <Icone />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold text-[#291662]">
            {titulo}
          </h2>

          <p className="mt-1 text-[13px] leading-relaxed text-[#291662]/60">
            {descricao}
          </p>

          <p className="mt-3 text-[13px] font-bold text-[#8F55E9]">
            {textoBotao}
          </p>
        </div>

        {!desabilitado && (
          <span className="mt-1 text-[22px] text-[#8F55E9]">
            ›
          </span>
        )}
      </div>
    </button>
  )
}

const CONTAGEM_INICIAL = {
  total: 0,
  ativa: 0,
  rascunho: 0,
  pausada: 0,
  encerrada: 0,
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [autorizada, setAutorizada] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [vagas, setVagas] = useState(CONTAGEM_INICIAL)
  const [freelas, setFreelas] = useState(CONTAGEM_INICIAL)

  useEffect(() => {
    let ativo = true

    async function carregarPainel() {
      setCarregando(true)
      setErro('')

      const admin = await verificarAdmin()

      if (!ativo) return

      if (!admin.isAdmin) {
        setAutorizada(false)
        setCarregando(false)
        return
      }

      setAutorizada(true)

      const [
        resultadoVagas,
        resultadoFreelas,
      ] = await Promise.all([
        contarVagasPorStatus(),
        contarFreelasPorStatus(),
      ])

      if (!ativo) return

      if (resultadoVagas.error) {
        console.error(
          'Erro ao carregar contagem de vagas:',
          resultadoVagas.error,
        )
      } else if (resultadoVagas.data) {
        setVagas(resultadoVagas.data)
      }

      if (resultadoFreelas.error) {
        console.error(
          'Erro ao carregar contagem de freelas:',
          resultadoFreelas.error,
        )
      } else if (resultadoFreelas.data) {
        setFreelas(resultadoFreelas.data)
      }

      if (
        resultadoVagas.error ||
        resultadoFreelas.error
      ) {
        setErro(
          'Parte das informações do painel não pôde ser carregada.',
        )
      }

      setCarregando(false)
    }

    carregarPainel()

    return () => {
      ativo = false
    }
  }, [])

  if (carregando) {
    return (
      <PageContainer className="bg-[#EFE7FB]">
        <HeaderBack
          title="Painel administrativo"
          to="/mais"
        />

        <div className="flex min-h-[65vh] items-center justify-center px-6">
          <p className="text-[14px] font-medium text-[#291662]/65">
            Carregando painel...
          </p>
        </div>
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

          <p className="mt-3 text-[14px] leading-relaxed text-[#291662]/65">
            Esta área está disponível apenas para administradoras do
            TrajetEla.
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
        title="Painel administrativo"
        to="/mais"
      />

      <div className="px-4 pb-28">
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#291662] to-[#6B34D4] p-6 text-white shadow-sm">
          <p className="text-[13px] font-semibold text-white/70">
            Administração TrajetEla
          </p>

          <h1 className="mt-1 text-[24px] font-extrabold">
            Gestão de conteúdo
          </h1>

          <p className="mt-2 text-[14px] leading-relaxed text-white/80">
            Cadastre, edite e acompanhe as informações publicadas no
            aplicativo.
          </p>
        </div>

        {erro && (
          <p className="mt-4 rounded-2xl bg-yellow-50 px-4 py-3 text-[13px] font-medium text-yellow-700">
            {erro}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <CartaoResumo
            titulo="Vagas"
            total={vagas.total}
            ativas={vagas.ativa}
            rascunhos={vagas.rascunho}
          />

          <CartaoResumo
            titulo="Freelas"
            total={freelas.total}
            ativas={freelas.ativa}
            rascunhos={freelas.rascunho}
          />
        </div>

        <div className="mt-7">
          <h2 className="text-[18px] font-bold text-[#291662]">
            Gerenciar conteúdo
          </h2>

          <p className="mt-1 text-[13px] text-[#291662]/60">
            Escolha o módulo que deseja atualizar.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <CartaoModulo
            titulo="Vagas de emprego"
            descricao="Cadastre, edite, pause, encerre ou exclua vagas."
            Icone={IconeVagas}
            textoBotao="Gerenciar vagas"
            onClick={() => navigate('/admin/vagas')}
          />

          <CartaoModulo
            titulo="Freelas"
            descricao="Cadastre oportunidades rápidas, defina destaques e gerencie publicações."
            Icone={IconeFreelas}
            textoBotao="Gerenciar freelas"
            onClick={() => navigate('/admin/freelas')}
          />
        </div>

        <div className="mt-7">
          <h2 className="text-[18px] font-bold text-[#291662]">
            Outros módulos
          </h2>

          <p className="mt-1 text-[13px] text-[#291662]/60">
            Estes recursos serão habilitados nas próximas etapas.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <CartaoModulo
            titulo="Cursos"
            descricao="Cadastro e organização dos cursos da plataforma."
            Icone={IconeConfiguracoes}
            textoBotao="Em breve"
            desabilitado
          />

          <CartaoModulo
            titulo="E-books"
            descricao="Cadastro e gerenciamento de materiais digitais."
            Icone={IconeConfiguracoes}
            textoBotao="Em breve"
            desabilitado
          />

          <CartaoModulo
            titulo="Usuárias e candidaturas"
            descricao="Acompanhamento de inscrições, serviços e avaliações."
            Icone={IconeConfiguracoes}
            textoBotao="Em breve"
            desabilitado
          />
        </div>

        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-[#8F55E9] bg-white py-3.5 text-[14px] font-semibold text-[#291662]"
        >
          <IconeAplicativo />
          Visualizar aplicativo
        </button>
      </div>
    </PageContainer>
  )
}