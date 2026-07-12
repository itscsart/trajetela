import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../../components/PageContainer'
import HeaderBack from '../../components/HeaderBack'
import {
  atualizarVaga,
  buscarVagaAdminPorId,
  criarVaga,
  verificarAdmin,
} from '../../utils/adminVagasService'

const FORMULARIO_INICIAL = {
  titulo: '',
  empresa: '',
  area: '',
  modalidade: '',
  tipo_vaga: '',
  status: 'rascunho',

  cidade: 'São Paulo',
  bairro: '',
  zona: '',
  endereco_referencia: '',
  latitude: '',
  longitude: '',

  tipo_salario: 'fixo',
  salario_min: '',
  salario_max: '',
  salario_exibir: '',

  descricao: '',
  atividades: '',
  requisitos: '',
  beneficios: '',
  observacoes_empresa: '',
  informacoes_adicionais: '',
  forma_candidatura: '',

  escolaridade_minima: '',
  aceita_sem_experiencia: false,
  horario: '',
  data_limite: '',

  whatsapp_contato: '',
  email_contato: '',
  contato_preferido: '',
}

const AREAS = [
  'Administrativo',
  'Atendimento',
  'Audiovisual',
  'Beleza',
  'Comunicação Social',
  'Cuidados',
  'Educação',
  'Financeiro',
  'Gastronomia',
  'Limpeza',
  'Marketing',
  'Outros',
  'Tecnologia',
  'Vendas',
]

const MODALIDADES = ['Presencial', 'Híbrido', 'Remoto']

const TIPOS_VAGA = ['CLT', 'Temporário', 'Primeiro Emprego']

const STATUS = [
  { valor: 'rascunho', rotulo: 'Rascunho' },
  { valor: 'ativa', rotulo: 'Ativa' },
  { valor: 'pausada', rotulo: 'Pausada' },
  { valor: 'encerrada', rotulo: 'Encerrada' },
]

const ESCOLARIDADES = [
  'Ensino fundamental incompleto',
  'Ensino fundamental completo',
  'Ensino médio incompleto',
  'Ensino médio completo',
  'Ensino técnico',
  'Ensino superior incompleto',
  'Ensino superior completo',
  'Pós-graduação',
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

function detectarTipoSalario(vaga) {
  if (vaga.salario_exibir) {
    const texto = String(vaga.salario_exibir).trim().toLowerCase()

    if (texto === 'a combinar') {
      return 'combinar'
    }

    return 'personalizado'
  }

  if (
    vaga.salario_min != null &&
    vaga.salario_max != null &&
    Number(vaga.salario_min) !== Number(vaga.salario_max)
  ) {
    return 'faixa'
  }

  if (vaga.salario_min != null || vaga.salario_max != null) {
    return 'fixo'
  }

  return 'nao_informar'
}

function converterVagaParaFormulario(vaga) {
  return {
    titulo: vaga.titulo || '',
    empresa: vaga.empresa || '',
    area: vaga.area || '',
    modalidade: vaga.modalidade || '',
    tipo_vaga: vaga.tipo_vaga || '',
    status: vaga.status || 'rascunho',

    cidade: vaga.cidade || 'São Paulo',
    bairro: vaga.bairro || '',
    zona: vaga.zona || '',
    endereco_referencia: vaga.endereco_referencia || '',
    latitude: vaga.latitude == null ? '' : String(vaga.latitude),
    longitude: vaga.longitude == null ? '' : String(vaga.longitude),

    tipo_salario: detectarTipoSalario(vaga),
    salario_min:
      vaga.salario_min == null ? '' : String(vaga.salario_min),
    salario_max:
      vaga.salario_max == null ? '' : String(vaga.salario_max),
    salario_exibir: vaga.salario_exibir || '',

    descricao: vaga.descricao || '',
    atividades: vaga.atividades || '',
    requisitos: vaga.requisitos || '',
    beneficios: vaga.beneficios || '',
    observacoes_empresa: vaga.observacoes_empresa || '',
    informacoes_adicionais: vaga.informacoes_adicionais || '',
    forma_candidatura: vaga.forma_candidatura || '',

    escolaridade_minima: vaga.escolaridade_minima || '',
    aceita_sem_experiencia: Boolean(vaga.aceita_sem_experiencia),
    horario: vaga.horario || '',
    data_limite: vaga.data_limite || '',

    whatsapp_contato: vaga.whatsapp_contato || '',
    email_contato: vaga.email_contato || '',
    contato_preferido: vaga.contato_preferido || '',
  }
}

function prepararDadosParaSalvar(formulario) {
  const dados = {
    ...formulario,
  }

  if (formulario.tipo_salario === 'fixo') {
    dados.salario_max = formulario.salario_min
    dados.salario_exibir = ''
  }

  if (formulario.tipo_salario === 'faixa') {
    dados.salario_exibir = ''
  }

  if (formulario.tipo_salario === 'combinar') {
    dados.salario_min = ''
    dados.salario_max = ''
    dados.salario_exibir = 'A combinar'
  }

  if (formulario.tipo_salario === 'nao_informar') {
    dados.salario_min = ''
    dados.salario_max = ''
    dados.salario_exibir = ''
  }

  if (formulario.tipo_salario === 'personalizado') {
    dados.salario_min = ''
    dados.salario_max = ''
  }

  delete dados.tipo_salario

  return dados
}

function CampoErro({ mensagem }) {
  if (!mensagem) return null

  return (
    <p className="mt-1 text-[12px] font-medium text-red-600">
      {mensagem}
    </p>
  )
}

function Rotulo({ children, obrigatorio = false }) {
  return (
    <label className="mb-1.5 block text-[13px] font-semibold text-[#291662]">
      {children}
      {obrigatorio && (
        <span className="ml-1 text-[#D6479B]">*</span>
      )}
    </label>
  )
}

function SecaoFormulario({ titulo, descricao, children }) {
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

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

const classeCampo =
  'w-full rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] text-[#291662] outline-none focus:border-[#8F55E9]'

const classeAreaTexto =
  'min-h-[110px] w-full resize-y rounded-2xl border border-[#291662]/15 bg-white px-4 py-3 text-[14px] leading-relaxed text-[#291662] outline-none focus:border-[#8F55E9]'

export default function AdminVagaForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const editando = Boolean(id)

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [autorizada, setAutorizada] = useState(false)

  const tituloPagina = useMemo(
    () => (editando ? 'Editar vaga' : 'Nova vaga'),
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

      const { data, error } = await buscarVagaAdminPorId(id)

      if (!ativo) return

      if (error) {
        console.error(error)
        setErroGeral(
          'Não foi possível carregar os dados da vaga.',
        )
      } else if (!data) {
        setErroGeral('Vaga não encontrada.')
      } else {
        setFormulario(converterVagaParaFormulario(data))
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

  function alterarTipoSalario(tipo) {
    setFormulario((anterior) => {
      const novoFormulario = {
        ...anterior,
        tipo_salario: tipo,
      }

      if (tipo === 'fixo') {
        novoFormulario.salario_max = ''
        novoFormulario.salario_exibir = ''
      }

      if (tipo === 'faixa') {
        novoFormulario.salario_exibir = ''
      }

      if (tipo === 'combinar') {
        novoFormulario.salario_min = ''
        novoFormulario.salario_max = ''
        novoFormulario.salario_exibir = 'A combinar'
      }

      if (tipo === 'nao_informar') {
        novoFormulario.salario_min = ''
        novoFormulario.salario_max = ''
        novoFormulario.salario_exibir = ''
      }

      if (tipo === 'personalizado') {
        novoFormulario.salario_min = ''
        novoFormulario.salario_max = ''
      }

      return novoFormulario
    })

    setErros((anteriores) => {
      const novosErros = {
        ...anteriores,
      }

      delete novosErros.salario_min
      delete novosErros.salario_max
      delete novosErros.salario_exibir

      return novosErros
    })
  }

  async function salvar(evento) {
    evento.preventDefault()

    if (salvando) return

    setSalvando(true)
    setErroGeral('')
    setSucesso('')
    setErros({})

    const dados = prepararDadosParaSalvar(formulario)

    const resultado = editando
      ? await atualizarVaga(id, dados)
      : await criarVaga(dados)

    if (resultado.validationErrors) {
      setErros(resultado.validationErrors)
    }

    if (resultado.error) {
      console.error(resultado.error)

      setErroGeral(
        resultado.error.message ===
          'Revise os campos do formulário.'
          ? 'Revise os campos destacados antes de continuar.'
          : 'Não foi possível salvar a vaga. Verifique os dados e tente novamente.',
      )

      setSalvando(false)
      return
    }

    setSucesso(
      editando
        ? 'Vaga atualizada com sucesso.'
        : 'Vaga criada com sucesso.',
    )

    setSalvando(false)

    window.setTimeout(() => {
      navigate('/admin/vagas')
    }, 800)
  }

  if (carregando) {
    return (
      <PageContainer className="bg-[#EFE7FB]">
        <HeaderBack
          title={tituloPagina}
          to="/admin/vagas"
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

        <div className="mx-5 mt-8 rounded-3xl border border-[#E84C8A]/25 bg-white p-6 text-center shadow-sm">
          <h1 className="text-[20px] font-bold text-[#291662]">
            Acesso não autorizado
          </h1>

          <p className="mt-3 text-[14px] leading-relaxed text-[#291662]/70">
            Esta página está disponível apenas para administradoras.
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
        title={tituloPagina}
        to="/admin/vagas"
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
            Preencha as informações que serão apresentadas às usuárias.
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
          descricao="Dados básicos utilizados na listagem e na compatibilidade."
        >
          <div>
            <Rotulo obrigatorio>Título da vaga</Rotulo>

            <input
              value={formulario.titulo}
              onChange={(evento) =>
                atualizarCampo('titulo', evento.target.value)
              }
              placeholder="Ex.: Assistente Administrativo"
              className={classeCampo}
            />

            <CampoErro mensagem={erros.titulo} />
          </div>

          <div>
            <Rotulo obrigatorio>Empresa</Rotulo>

            <input
              value={formulario.empresa}
              onChange={(evento) =>
                atualizarCampo('empresa', evento.target.value)
              }
              placeholder="Nome da empresa"
              className={classeCampo}
            />

            <CampoErro mensagem={erros.empresa} />
          </div>

          <div>
            <Rotulo obrigatorio>Área profissional</Rotulo>

            <select
              value={formulario.area}
              onChange={(evento) =>
                atualizarCampo('area', evento.target.value)
              }
              className={classeCampo}
            >
              <option value="">Selecione</option>

              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <CampoErro mensagem={erros.area} />
          </div>

          <div>
            <Rotulo obrigatorio>Modalidade</Rotulo>

            <select
              value={formulario.modalidade}
              onChange={(evento) =>
                atualizarCampo(
                  'modalidade',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">Selecione</option>

              {MODALIDADES.map((modalidade) => (
                <option
                  key={modalidade}
                  value={modalidade}
                >
                  {modalidade}
                </option>
              ))}
            </select>

            <CampoErro mensagem={erros.modalidade} />
          </div>

          <div>
            <Rotulo obrigatorio>Tipo de vaga</Rotulo>

            <select
              value={formulario.tipo_vaga}
              onChange={(evento) =>
                atualizarCampo(
                  'tipo_vaga',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">Selecione</option>

              {TIPOS_VAGA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <CampoErro mensagem={erros.tipo_vaga} />
          </div>

          <div>
            <Rotulo obrigatorio>Status</Rotulo>

            <select
              value={formulario.status}
              onChange={(evento) =>
                atualizarCampo('status', evento.target.value)
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

            <CampoErro mensagem={erros.status} />
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Localização"
          descricao="A distância só será exibida quando as coordenadas estiverem preenchidas."
        >
          <div>
            <Rotulo obrigatorio>Cidade</Rotulo>

            <input
              value={formulario.cidade}
              onChange={(evento) =>
                atualizarCampo('cidade', evento.target.value)
              }
              placeholder="São Paulo"
              className={classeCampo}
            />

            <CampoErro mensagem={erros.cidade} />
          </div>

          <div>
            <Rotulo>Bairro</Rotulo>

            <input
              value={formulario.bairro}
              onChange={(evento) =>
                atualizarCampo('bairro', evento.target.value)
              }
              placeholder="Ex.: Pinheiros"
              className={classeCampo}
            />
          </div>

          <div>
            <Rotulo>Zona ou região</Rotulo>

            <select
              value={formulario.zona}
              onChange={(evento) =>
                atualizarCampo('zona', evento.target.value)
              }
              className={classeCampo}
            >
              <option value="">Selecione</option>

              {ZONAS.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Rotulo>Endereço ou referência</Rotulo>

            <input
              value={formulario.endereco_referencia}
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
              <Rotulo>Latitude</Rotulo>

              <input
                type="number"
                step="any"
                value={formulario.latitude}
                onChange={(evento) =>
                  atualizarCampo(
                    'latitude',
                    evento.target.value,
                  )
                }
                placeholder="-23.5505"
                className={classeCampo}
              />

              <CampoErro mensagem={erros.latitude} />
            </div>

            <div>
              <Rotulo>Longitude</Rotulo>

              <input
                type="number"
                step="any"
                value={formulario.longitude}
                onChange={(evento) =>
                  atualizarCampo(
                    'longitude',
                    evento.target.value,
                  )
                }
                placeholder="-46.6333"
                className={classeCampo}
              />

              <CampoErro mensagem={erros.longitude} />
            </div>
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Remuneração"
          descricao="Escolha como a empresa deseja exibir a remuneração."
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              ['fixo', 'Valor fixo'],
              ['faixa', 'Faixa salarial'],
              ['combinar', 'A combinar'],
              ['nao_informar', 'Não informar'],
              ['personalizado', 'Texto personalizado'],
            ].map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                onClick={() => alterarTipoSalario(valor)}
                className={`rounded-2xl border px-3 py-3 text-[13px] font-semibold ${
                  formulario.tipo_salario === valor
                    ? 'border-[#8F55E9] bg-[#F1EAFD] text-[#8F55E9]'
                    : 'border-[#291662]/15 text-[#291662]'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          {formulario.tipo_salario === 'fixo' && (
            <div>
              <Rotulo>Valor do salário</Rotulo>

              <input
                type="number"
                min="0"
                step="0.01"
                value={formulario.salario_min}
                onChange={(evento) =>
                  atualizarCampo(
                    'salario_min',
                    evento.target.value,
                  )
                }
                placeholder="Ex.: 2400"
                className={classeCampo}
              />

              <CampoErro mensagem={erros.salario_min} />
            </div>
          )}

          {formulario.tipo_salario === 'faixa' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Rotulo>Salário mínimo</Rotulo>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.salario_min}
                  onChange={(evento) =>
                    atualizarCampo(
                      'salario_min',
                      evento.target.value,
                    )
                  }
                  className={classeCampo}
                />

                <CampoErro
                  mensagem={erros.salario_min}
                />
              </div>

              <div>
                <Rotulo>Salário máximo</Rotulo>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.salario_max}
                  onChange={(evento) =>
                    atualizarCampo(
                      'salario_max',
                      evento.target.value,
                    )
                  }
                  className={classeCampo}
                />

                <CampoErro
                  mensagem={erros.salario_max}
                />
              </div>
            </div>
          )}

          {formulario.tipo_salario === 'combinar' && (
            <p className="rounded-2xl bg-[#F6F1FE] px-4 py-3 text-[14px] text-[#291662]/75">
              O aplicativo exibirá “A combinar”.
            </p>
          )}

          {formulario.tipo_salario ===
            'nao_informar' && (
            <p className="rounded-2xl bg-[#F6F1FE] px-4 py-3 text-[14px] text-[#291662]/75">
              A remuneração não será exibida.
            </p>
          )}

          {formulario.tipo_salario ===
            'personalizado' && (
            <div>
              <Rotulo>Texto da remuneração</Rotulo>

              <input
                value={formulario.salario_exibir}
                onChange={(evento) =>
                  atualizarCampo(
                    'salario_exibir',
                    evento.target.value,
                  )
                }
                placeholder="Ex.: Conforme experiência"
                className={classeCampo}
              />

              <CampoErro
                mensagem={erros.salario_exibir}
              />
            </div>
          )}
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Descrição da oportunidade"
          descricao="Os campos vazios não aparecerão para a usuária."
        >
          <div>
            <Rotulo>Descrição geral</Rotulo>

            <textarea
              value={formulario.descricao}
              onChange={(evento) =>
                atualizarCampo(
                  'descricao',
                  evento.target.value,
                )
              }
              placeholder="Apresente a vaga e o contexto da oportunidade."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>Atividades</Rotulo>

            <textarea
              value={formulario.atividades}
              onChange={(evento) =>
                atualizarCampo(
                  'atividades',
                  evento.target.value,
                )
              }
              placeholder="Descreva o que a profissional fará."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>Requisitos</Rotulo>

            <textarea
              value={formulario.requisitos}
              onChange={(evento) =>
                atualizarCampo(
                  'requisitos',
                  evento.target.value,
                )
              }
              placeholder="Conhecimentos, habilidades ou documentos necessários."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>Benefícios</Rotulo>

            <textarea
              value={formulario.beneficios}
              onChange={(evento) =>
                atualizarCampo(
                  'beneficios',
                  evento.target.value,
                )
              }
              placeholder="Vale-transporte, alimentação, plano de saúde..."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>Observações da empresa</Rotulo>

            <textarea
              value={formulario.observacoes_empresa}
              onChange={(evento) =>
                atualizarCampo(
                  'observacoes_empresa',
                  evento.target.value,
                )
              }
              placeholder="Informações que a empresa considera importantes."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>Informações adicionais</Rotulo>

            <textarea
              value={formulario.informacoes_adicionais}
              onChange={(evento) =>
                atualizarCampo(
                  'informacoes_adicionais',
                  evento.target.value,
                )
              }
              placeholder="Treinamento, possibilidade de crescimento, orientações..."
              className={classeAreaTexto}
            />
          </div>

          <div>
            <Rotulo>Forma de candidatura</Rotulo>

            <textarea
              value={formulario.forma_candidatura}
              onChange={(evento) =>
                atualizarCampo(
                  'forma_candidatura',
                  evento.target.value,
                )
              }
              placeholder="Ex.: Envie seu currículo pelos botões abaixo."
              className={classeAreaTexto}
            />
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Perfil da vaga"
          descricao="Essas informações influenciam a compatibilidade."
        >
          <div>
            <Rotulo>Escolaridade mínima</Rotulo>

            <select
              value={formulario.escolaridade_minima}
              onChange={(evento) =>
                atualizarCampo(
                  'escolaridade_minima',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">Não exigir</option>

              {ESCOLARIDADES.map((escolaridade) => (
                <option
                  key={escolaridade}
                  value={escolaridade}
                >
                  {escolaridade}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#291662]/15 px-4 py-3">
            <input
              type="checkbox"
              checked={formulario.aceita_sem_experiencia}
              onChange={(evento) =>
                atualizarCampo(
                  'aceita_sem_experiencia',
                  evento.target.checked,
                )
              }
              className="h-5 w-5 accent-[#8F55E9]"
            />

            <span className="text-[14px] font-medium text-[#291662]">
              Aceita pessoas sem experiência
            </span>
          </label>

          <div>
            <Rotulo>Horário</Rotulo>

            <input
              value={formulario.horario}
              onChange={(evento) =>
                atualizarCampo(
                  'horario',
                  evento.target.value,
                )
              }
              placeholder="Ex.: Seg a sex, 09h às 18h"
              className={classeCampo}
            />
          </div>

          <div>
            <Rotulo>Data limite para candidatura</Rotulo>

            <input
              type="date"
              value={formulario.data_limite}
              onChange={(evento) =>
                atualizarCampo(
                  'data_limite',
                  evento.target.value,
                )
              }
              className={classeCampo}
            />

            <CampoErro mensagem={erros.data_limite} />
          </div>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Contato"
          descricao="Defina os canais disponíveis para candidatura."
        >
          <div>
            <Rotulo>WhatsApp</Rotulo>

            <input
              inputMode="tel"
              value={formulario.whatsapp_contato}
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
              mensagem={erros.whatsapp_contato}
            />
          </div>

          <div>
            <Rotulo>E-mail</Rotulo>

            <input
              type="email"
              value={formulario.email_contato}
              onChange={(evento) =>
                atualizarCampo(
                  'email_contato',
                  evento.target.value,
                )
              }
              placeholder="rh@empresa.com.br"
              className={classeCampo}
            />

            <CampoErro mensagem={erros.email_contato} />
          </div>

          <div>
            <Rotulo>Canal de contato</Rotulo>

            <select
              value={formulario.contato_preferido}
              onChange={(evento) =>
                atualizarCampo(
                  'contato_preferido',
                  evento.target.value,
                )
              }
              className={classeCampo}
            >
              <option value="">Nenhum definido</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
              <option value="ambos">WhatsApp e e-mail</option>
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
                : 'Criar vaga'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/vagas')}
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