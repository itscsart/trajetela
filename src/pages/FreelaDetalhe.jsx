import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import OportunidadeDetalhes from '../components/OportunidadeDetalhes'
import { getFreelaPorId, formatarValor, formatarData } from '../utils/freelasService'
import { useLocalizacao, distanciaValida } from '../utils/geolocalizacao'

export default function FreelaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const { coords } = useLocalizacao()

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro('')

      const { data, error } = await getFreelaPorId(id)

      if (!ativo) return

      if (error) {
        setErro('Não foi possível carregar os detalhes. Tente novamente.')
      } else if (!data) {
        setErro('Freela não encontrado ou indisponível.')
      } else if (data.status !== 'ativa') {
        setErro('Freela não encontrado ou indisponível.')
      } else {
        setFreela(data)
      }
      setCarregando(false)
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [id])

  if (carregando) {
    return (
      <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
        <HeaderBack title="Detalhes" to="/freelas" />
        <p className="px-6 pt-10 text-center text-[14px] font-medium text-[#291662]/70">
          Carregando detalhes...
        </p>
      </PageContainer>
    )
  }

  if (erro || !freela) {
    return (
      <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
        <HeaderBack title="Detalhes" to="/freelas" />
        <div className="px-6 pt-10 text-center">
          <p className="text-[15px] font-medium text-[#D6479B]">
            {erro || 'Freela não encontrado ou indisponível.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/freelas')}
            className="mt-6 rounded-full bg-[#8F55E9] px-6 py-3 text-[14px] font-semibold text-white"
          >
            Voltar para freelas
          </button>
        </div>
      </PageContainer>
    )
  }

  const distanciaKm = distanciaValida(coords, freela.latitude, freela.longitude)
  const valor = formatarValor(freela)

  const meta = [
    { label: 'Categoria', valor: freela.categoria },
    { label: 'Data', valor: formatarData(freela.data_servico) },
    { label: 'Horário', valor: freela.horario },
    { label: 'Duração', valor: freela.duracao_estimada },
    { label: 'Cidade', valor: freela.cidade },
    {
      label: 'Vagas',
      valor:
        freela.quantidade_pessoas != null && freela.quantidade_pessoas > 0
          ? `${freela.quantidade_pessoas} ${freela.quantidade_pessoas > 1 ? 'pessoas' : 'pessoa'}`
          : '',
    },
  ]

  const secoes = [
    { titulo: 'Descrição', conteudo: freela.descricao },
    { titulo: 'Atividades', conteudo: freela.atividades },
    { titulo: 'Requisitos', conteudo: freela.requisitos },
    { titulo: 'Materiais necessários', conteudo: freela.materiais_necessarios },
    { titulo: 'Observações', conteudo: freela.observacoes },
    { titulo: 'Informações adicionais', conteudo: freela.informacoes_adicionais },
    { titulo: 'Endereço de referência', conteudo: freela.endereco_referencia },
  ]

  const titulo = freela.titulo || ''
  const mensagem = `Olá! Tenho interesse no freela de ${titulo} publicado no TrajetEla.`

  const contato = {
    whatsapp: freela.whatsapp_contato,
    email: freela.email_contato,
    preferido: freela.contato_preferido,
    mensagem,
    assuntoEmail: `Interesse no freela de ${titulo}`,
    rotuloWhatsapp: 'Tenho interesse pelo WhatsApp',
    rotuloEmail: 'Tenho interesse por e-mail',
  }

  return (
    <OportunidadeDetalhes
      titulo={titulo}
      subtitulo={freela.contratante}
      bairro={freela.bairro}
      zona={freela.zona}
      distanciaKm={distanciaKm}
      valorPrincipal={valor}
      meta={meta}
      secoes={secoes}
      contato={contato}
      voltarPara="/freelas"
    />
  )
}
