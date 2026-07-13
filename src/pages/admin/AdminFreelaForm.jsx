import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../../components/PageContainer'
import HeaderBack from '../../components/HeaderBack'
import {
  atualizarFreela,
  buscarFreelaAdminPorId,
  criarFreela,
  verificarAdmin,
} from '../../utils/adminFreelasService'

const FORMULARIO_INICIAL = {
  titulo: '',
  contratante: '',
  categoria: '',
  descricao: '',
  status: 'rascunho',
  destaque: false,

  cidade: 'São Paulo',
  bairro: '',
  zona: '',
  endereco_referencia: '',
  latitude: '',
  longitude: '',

  valor_min: '',
  duracao_estimada: '',
  data_servico: '',
  horario: '',
  quantidade_pessoas: '',

  atividades: '',
  requisitos: '',
  materiais_necessarios: '',
  observacoes: '',
  informacoes_adicionais: '',

  whatsapp_contato: '',
  email_contato: '',
  contato_preferido: '',
}

const CATEGORIAS = [
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

const STATUS = [
  {
    valor: 'rascunho',
    rotulo: 'Rascunho',
  },
  {
    valor: 'ativa',
    rotulo: 'Ativa',
  },
  {
    valor: 'encerrada',
    rotulo: 'Encerrada',
  },
]

const ZONAS = [
  'Centro',
  'Zona Norte',
  'Zona Sul',
  'Zona Leste',
  'Zona Oeste',
  'Grande São Paulo',
  'Interior',
]

function converterFreelaParaFormulario(freela) {
  return {
    titulo: freela.titulo || '',
    contratante: freela.contratante || '',
    categoria: freela.categoria || '',
    descricao: freela.descricao || '',
    status: freela.status || 'rascunho',
    destaque: Boolean(freela.destaque),

    cidade: freela.cidade || 'São Paulo',
    bairro: freela.bairro || '',
    zona: freela.zona || '',
    endereco_referencia:
      freela.endereco_referencia || '',
    latitude:
      freela.latitude == null
        ? ''
        : String(freela.latitude),
    longitude:
      freela.longitude == null
        ? ''
        : String(freela.longitude),

    valor_min:
      freela.valor_min == null
        ? ''
        : String(freela.valor_min),
    duracao_estimada:
      freela.duracao_estimada || '',
    data_servico:
      freela.data_servico || '',
    horario:
      freela.horario || '',
    quantidade_pessoas:
      freela.quantidade_pessoas == null
        ? ''
        : String(freela.quantidade_pessoas),

    atividades:
      freela.atividades || '',
    requisitos:
      freela.requisitos || '',
    materiais_necessarios:
      freela.materiais_necessarios || '',
    observacoes:
      freela.observacoes || '',
    informacoes_adicionais:
      freela.informacoes_adicionais || '',

    whatsapp_contato:
      freela.whatsapp_contato || '',
    email_contato:
      freela.email_contato || '',
    contato_preferido:
      freela.contato_preferido || '',
  }
}

function CampoErro({ mensagem }) {
  if (!mensagem) return null

  return (
    <p className="mt-1 text-[12px] font-medium text-red-600">
      {mensagem}
    </p>
  )
}

function Rotulo({
  children,
  obrigatorio = false,
}) {
  return (
    <label className="mb-1.5 block text-[13px] font-semibold text-[#291662]">
      {children}

      {obrigatorio && (
        <span className="ml-1 text-[#D6479B]">
          *
        </span>
      )}
    </label>
  )
}

function SecaoFormulario({
  titulo,
  descricao,
  children,
}) {
  return (
    <section className="mt-5 rounded-3xl border border-[#8F55E9]/15 bg-white p-5 shadow-sm">
      <h2 className="text-[17px] font-bold text-[#291662]">
        {titulo}
      </h2>

      {descricao && (
        <p className="mt-1 text-[13px] leading-relaxed text-[#291662]/60">
          {descricao}
        </p>
      )}

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </section>
  )
}

const classeCampo =
  'w-full rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none focus:border-[#8F55E9]'

const classeAreaTexto =
  'min-h-[110px] w-full resize-y rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] leading-relaxed text-[#291662] outline-none focus:border-[#8F55E9]'

export default function AdminFreelaForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const editando = Boolean(id)

  const [formulario, setFormulario] =
    useState(FORMULARIO_INICIAL)

  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] =
    useState(true)
  const [salvando, setSalvando] =
    useState(false)
  const [autorizada, setAutorizada] =
    useState(false)

  const tituloPagina = useMemo(
    () =>
      editando
        ? 'Editar freela'
        : 'Novo freela',
    [editando],
  )

  useEffect(() => {
    let ativo = true

    async function iniciar() {
      setCarregando(true)
      setErroGeral('')

      const admin = await verificarAdmin()

      if (!ativo) return

      if (!admin.isAdmin) {
        setAutorizada(false)
        setCarregando(false)
        return
      }

      setAutorizada(true)

      if (!editando) {
        setCarregando(false)
        return
      }

      const { data, error } =
        await buscarFreelaAdminPorId(id)

      if (!ativo) return

      if (error) {
        console.error(error)

        setErroGeral(
          'Não foi possível carregar os dados do freela.',
        )
      } else if (!data) {
        setErroGeral(
          'Freela não encontrado.',
        )
      } else {
        setFormulario(
          converterFreelaParaFormulario(data),
        )
      }

      setCarregando(false)
    }

    iniciar()

    return () => {
      ativo = false
    }
  }, [editando, id])

  function atualizarCampo(nome, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [nome]: valor,
    }))

    setErros((anteriores) => {
      if (!anteriores[nome]) {
        return anteriores
      }

      const novosErros = {
        ...anteriores,
      }

      delete novosErros[nome]

      return novosErros
    })

    setErroGeral('')
    setSucesso('')
  }

  async function salvar(evento) {
    evento.preventDefault()

    if (salvando) return

    setSalvando(true)
    setErroGeral('')
    setSucesso('')
    setErros({})

    const resultado = editando
      ? await atualizarFreela(
          id,
          formulario,
        )
      : await criarFreela(formulario)

    if (resultado.validationErrors) {
      setErros(
        resultado.validationErrors,
      )
    }

    if (resultado.error) {
      console.error(resultado.error)

      setErroGeral(
        resultado.error.message ===
          'Revise os campos do formulário.'
          ? 'Revise os campos destacados antes de continuar.'
          : 'Não foi possível salvar o freela. Verifique os dados e tente novamente.',
      )

      setSalvando(false)
      return
    }

    setSucesso(
      editando
        ? 'Freela atualizado com sucesso.'
        : 'Freela criado com sucesso.',
    )

    setSalvando(false)

    window.setTimeout(() => {
      navigate('/admin/freelas')
    }, 800)
  }

  if (carregando) {
    return (
      <PageContainer className="bg-[#EFE7FB]">
        <HeaderBack
          title={tituloPagina}
          to="/admin/freelas"
        />

        <p className="px-6 pt-10 text-center text-[14px] font-medium text-[#291662]/70">
          Carregando formulário...
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

          <p className="mt-3 text-[14px] leading-relaxed text-[#291662]/65">
            Esta página está disponível apenas para administradoras.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/home')
            }
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
        title={tituloPagina}
        to="/admin/freelas"
      />

      <form
        onSubmit={salvar}
        className="px-4 pb-28"
      >
        <div className="mt-4">
          <h1 className="text-[22px] font-extrabold text-[#291662]">
            {tituloPagina}
          </h1>

          <p className="mt-1 text-[13px] leading-relaxed text-[#291662]/65">
            Preencha as informações do serviço que será publicado para as usuárias.
          </p>
        </div>

        {erroGeral && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
            {erroGeral}
          </p>
        )}

        {sucesso && (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-[14px] font-medium text-green-700">
            {sucesso}
          </p>
        )}

        <SecaoFormulario
          titulo="Informações principais"
          descricao="Dados exibidos no card e usados nos filtros."
        >
          <div>
            <Rotulo obrigatorio>
              Título do freela
            </Rotulo>

            <input
              value={formulario.titulo}
              onChange={(evento) =>
                atualizarCampo(
                  'titulo',
                  evento.target.value,
                )
              }
              placeholder="Ex.: Videomaker"
              className={classeCampo}
            />

            <CampoErro
              mensagem={erros.titulo}
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Contratante
            </Rotulo>

            <input
              value={
                formulario.contratante
              }
              onChange={(evento) =>
                atualizarCampo(
                  'contratante',
                  evento.target.value,
                )
              }
              placeholder="Nome da empresa ou contratante"
              className={classeCampo}
            />

            <CampoErro
              mensagem={
                erros.contratante
              }
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Categoria
            </Rotulo>

            <select
              value={formulario.categoria}
              onChange={(evento) =>
                atualizarCampo(
                  'categoria',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">
                Selecione
              </option>

              {CATEGORIAS.map(
                (categoria) => (
                  <option
                    key={categoria}
                    value={categoria}
                  >
                    {categoria}
                  </option>
                ),
              )}
            </select>

            <CampoErro
              mensagem={erros.categoria}
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Descrição
            </Rotulo>

            <textarea
              value={formulario.descricao}
              onChange={(evento) =>
                atualizarCampo(
                  'descricao',
                  evento.target.value,
                )
              }
              placeholder="Descreva brevemente o serviço."
              className={classeAreaTexto}
            />

            <CampoErro
              mensagem={erros.descricao}
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Status
            </Rotulo>

            <select
              value={formulario.status}
              onChange={(evento) =>
                atualizarCampo(
                  'status',
                  evento.target.value,
                )
              }
              className={classeCampo}
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

            <CampoErro
              mensagem={erros.status}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#291662]/15 px-4 py-3">
            <input
              type="checkbox"
              checked={
                formulario.destaque
              }
              onChange={(evento) =>
                atualizarCampo(
                  'destaque',
                  evento.target.checked,
                )
              }
              className="h-5 w-5 accent-[#D6479B]"
            />

            <div>
              <p className="text-[14px] font-semibold text-[#291662]">
                Freela em destaque
              </p>

              <p className="mt-0.5 text-[12px] text-[#291662]/60">
                Será priorizado na página Renda Rápida.
              </p>
            </div>
          </label>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Serviço"
          descricao="Informe o valor total, o dia e o horário do freela."
        >
          <div>
            <Rotulo obrigatorio>
              Valor do freela
            </Rotulo>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                formulario.valor_min
              }
              onChange={(evento) =>
                atualizarCampo(
                  'valor_min',
                  evento.target.value,
                )
              }
              placeholder="Ex.: 900"
              className={classeCampo}
            />

            <p className="mt-1 text-[12px] leading-relaxed text-[#291662]/55">
              Informe o valor total que será pago ao final do serviço.
            </p>

            <CampoErro
              mensagem={erros.valor_min}
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Duração estimada
            </Rotulo>

            <input
              value={
                formulario.duracao_estimada
              }
              onChange={(evento) =>
                atualizarCampo(
                  'duracao_estimada',
                  evento.target.value,
                )
              }
              placeholder="Ex.: Diária, 3 dias ou 1 semana"
              className={classeCampo}
            />

            <CampoErro
              mensagem={
                erros.duracao_estimada
              }
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Data do serviço
            </Rotulo>

            <input
              type="date"
              value={
                formulario.data_servico
              }
              onChange={(evento) =>
                atualizarCampo(
                  'data_servico',
                  evento.target.value,
                )
              }
              className={classeCampo}
            />

            <CampoErro
              mensagem={erros.data_servico}
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Horário
            </Rotulo>

            <input
              value={formulario.horario}
              onChange={(evento) =>
                atualizarCampo(
                  'horario',
                  evento.target.value,
                )
              }
              placeholder="Ex.: 08h às 18h"
              className={classeCampo}
            />

            <CampoErro
              mensagem={erros.horario}
            />
          </div>

          <div>
            <Rotulo>
              Quantidade de pessoas
            </Rotulo>

            <input
              type="number"
              min="1"
              step="1"
              value={
                formulario.quantidade_pessoas
              }
              onChange={(evento) =>
                atualizarCampo(
                  'quantidade_pessoas',
                  evento.target.value,
                )
              }
              placeholder="Ex.: 2"
              className={classeCampo}
            />

            <CampoErro
              mensagem={
                erros.quantidade_pessoas
              }
            />
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Localização"
          descricao="As coordenadas permitem calcular a distância até a usuária."
        >
          <div>
            <Rotulo obrigatorio>
              Cidade
            </Rotulo>

            <input
              value={formulario.cidade}
              onChange={(evento) =>
                atualizarCampo(
                  'cidade',
                  evento.target.value,
                )
              }
              placeholder="São Paulo"
              className={classeCampo}
            />

            <CampoErro
              mensagem={erros.cidade}
            />
          </div>

          <div>
            <Rotulo obrigatorio>
              Bairro
            </Rotulo>

            <input
              value={formulario.bairro}
              onChange={(evento) =>
                atualizarCampo(
                  'bairro',
                  evento.target.value,
                )
              }
              placeholder="Ex.: Pinheiros"
              className={classeCampo}
            />

            <CampoErro
              mensagem={erros.bairro}
            />
          </div>

          <div>
            <Rotulo>
              Zona ou região
            </Rotulo>

            <select
              value={formulario.zona}
              onChange={(evento) =>
                atualizarCampo(
                  'zona',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">
                Selecione
              </option>

              {ZONAS.map((zona) => (
                <option
                  key={zona}
                  value={zona}
                >
                  {zona}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Rotulo>
              Endereço ou referência
            </Rotulo>

            <input
              value={
                formulario.endereco_referencia
              }
              onChange={(evento) =>
                atualizarCampo(
                  'endereco_referencia',
                  evento.target.value,
                )
              }
              placeholder="Ex.: Próximo ao metrô"
              className={classeCampo}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Rotulo>
                Latitude
              </Rotulo>

              <input
                type="number"
                step="any"
                value={
                  formulario.latitude
                }
                onChange={(evento) =>
                  atualizarCampo(
                    'latitude',
                    evento.target.value,
                  )
                }
                placeholder="-23.5505"
                className={classeCampo}
              />

              <CampoErro
                mensagem={erros.latitude}
              />
            </div>

            <div>
              <Rotulo>
                Longitude
              </Rotulo>

              <input
                type="number"
                step="any"
                value={
                  formulario.longitude
                }
                onChange={(evento) =>
                  atualizarCampo(
                    'longitude',
                    evento.target.value,
                  )
                }
                placeholder="-46.6333"
                className={classeCampo}
              />

              <CampoErro
                mensagem={erros.longitude}
              />
            </div>
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Detalhes do serviço"
          descricao="Os campos vazios não serão exibidos para a usuária."
        >
          <div>
            <Rotulo>
              Atividades
            </Rotulo>

            <textarea
              value={
                formulario.atividades
              }
              onChange={(evento) =>
                atualizarCampo(
                  'atividades',
                  evento.target.value,
                )
              }
              placeholder="Descreva as atividades que serão realizadas."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>
              Requisitos
            </Rotulo>

            <textarea
              value={
                formulario.requisitos
              }
              onChange={(evento) =>
                atualizarCampo(
                  'requisitos',
                  evento.target.value,
                )
              }
              placeholder="Informe conhecimentos ou experiências necessárias."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>
              Materiais necessários
            </Rotulo>

            <textarea
              value={
                formulario.materiais_necessarios
              }
              onChange={(evento) =>
                atualizarCampo(
                  'materiais_necessarios',
                  evento.target.value,
                )
              }
              placeholder="Informe se a profissional precisa levar algum material."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>
              Observações
            </Rotulo>

            <textarea
              value={
                formulario.observacoes
              }
              onChange={(evento) =>
                atualizarCampo(
                  'observacoes',
                  evento.target.value,
                )
              }
              placeholder="Adicione orientações importantes."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>
              Informações adicionais
            </Rotulo>

            <textarea
              value={
                formulario.informacoes_adicionais
              }
              onChange={(evento) =>
                atualizarCampo(
                  'informacoes_adicionais',
                  evento.target.value,
                )
              }
              placeholder="Acrescente outros detalhes sobre o freela."
              className={classeAreaTexto}
            />
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Contato"
          descricao="Defina como a usuária poderá demonstrar interesse."
        >
          <div>
            <Rotulo>
              WhatsApp
            </Rotulo>

            <input
              inputMode="tel"
              value={
                formulario.whatsapp_contato
              }
              onChange={(evento) =>
                atualizarCampo(
                  'whatsapp_contato',
                  evento.target.value,
                )
              }
              placeholder="5511999999999"
              className={classeCampo}
            />

            <CampoErro
              mensagem={
                erros.whatsapp_contato
              }
            />
          </div>

          <div>
            <Rotulo>
              E-mail
            </Rotulo>

            <input
              type="email"
              value={
                formulario.email_contato
              }
              onChange={(evento) =>
                atualizarCampo(
                  'email_contato',
                  evento.target.value,
                )
              }
              placeholder="contato@empresa.com.br"
              className={classeCampo}
            />

            <CampoErro
              mensagem={
                erros.email_contato
              }
            />
          </div>

          <div>
            <Rotulo>
              Canal de contato
            </Rotulo>

            <select
              value={
                formulario.contato_preferido
              }
              onChange={(evento) =>
                atualizarCampo(
                  'contato_preferido',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">
                Nenhum definido
              </option>

              <option value="whatsapp">
                WhatsApp
              </option>

              <option value="email">
                E-mail
              </option>

              <option value="ambos">
                WhatsApp e e-mail
              </option>
            </select>
          </div>
        </SecaoFormulario>

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando
              ? 'Salvando...'
              : editando
                ? 'Salvar alterações'
                : 'Criar freela'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/admin/freelas')
            }
            disabled={salvando}
            className="mt-3 w-full rounded-full border border-[#8F55E9] py-3.5 text-[15px] font-semibold text-[#291662] disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </PageContainer>
  )
}