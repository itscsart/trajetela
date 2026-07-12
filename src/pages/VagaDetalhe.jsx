import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import OportunidadeDetalhes from '../components/OportunidadeDetalhes'
import { getVagaPorId } from '../utils/vagasService'
import { getPerfil } from '../utils/profileService'
import { calcularCompatibilidade, classificarCompatibilidade } from '../utils/compatibilidade'
import { calcularDistanciaKm } from '../utils/distancia'

const LIMITE_PRECISAO_METROS = 1000

function formatarSalario(v) {
  if (v.salario_exibir) return v.salario_exibir
  const fmt = (n) => `R$${Number(n).toLocaleString('pt-BR')}`
  if (v.salario_min != null && v.salario_max != null) {
    return v.salario_min === v.salario_max ? fmt(v.salario_min) : `${fmt(v.salario_min)} – ${fmt(v.salario_max)}`
  }
  if (v.salario_min != null) return fmt(v.salario_min)
  if (v.salario_max != null) return fmt(v.salario_max)
  return ''
}

function abreviarHorario(horario) {
  if (!horario) return ''
  let texto = String(horario)
  texto = texto.replace(/segunda a sexta/gi, 'Seg a sex')
  texto = texto.replace(/segunda a s[áa]bado/gi, 'Seg a sáb')
  texto = texto.replace(/,?\s*das\s+/gi, ', ')
  return texto
}

function formatarData(valor) {
  if (!valor) return ''
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

export default function VagaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vaga, setVaga] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro('')

      const [{ data, error }, perfilUsuaria] = await Promise.all([getVagaPorId(id), getPerfil()])

      if (!ativo) return

      if (error) {
        setErro('Não foi possível carregar os detalhes. Tente novamente.')
      } else if (!data) {
        setErro('Oportunidade não encontrada.')
      } else if (data.status && data.status !== 'ativa') {
        setErro('Esta oportunidade não está mais disponível.')
      } else {
        setVaga(data)
      }
      setPerfil(perfilUsuaria || null)
      setCarregando(false)
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [id])

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos.coords.accuracy <= LIMITE_PRECISAO_METROS) {
          // Somente em memória; não é salvo em banco/localStorage.
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy })
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    )
  }, [])

  if (carregando) {
    return (
      <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
        <HeaderBack title="Detalhes" to="/vagas" />
        <p className="px-6 pt-10 text-center text-[14px] font-medium text-[#291662]/70">
          Carregando detalhes...
        </p>
      </PageContainer>
    )
  }

  if (erro || !vaga) {
    return (
      <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
        <HeaderBack title="Detalhes" to="/vagas" />
        <div className="px-6 pt-10 text-center">
          <p className="text-[15px] font-medium text-[#D6479B]">{erro || 'Oportunidade não encontrada.'}</p>
          <button
            type="button"
            onClick={() => navigate('/vagas')}
            className="mt-6 rounded-full bg-[#8F55E9] px-6 py-3 text-[14px] font-semibold text-white"
          >
            Voltar para vagas
          </button>
        </div>
      </PageContainer>
    )
  }

  let distanciaKm = null
  if (coords && coords.accuracy <= LIMITE_PRECISAO_METROS && vaga.latitude != null && vaga.longitude != null) {
    distanciaKm = calcularDistanciaKm(coords.lat, coords.lon, Number(vaga.latitude), Number(vaga.longitude))
  }

  const compat = calcularCompatibilidade(perfil, vaga)
  const salario = formatarSalario(vaga)

  const meta = [
    { label: 'Área', valor: vaga.area },
    { label: 'Modalidade', valor: vaga.modalidade },
    { label: 'Tipo de vaga', valor: vaga.tipo_vaga },
    { label: 'Horário', valor: abreviarHorario(vaga.horario) },
    { label: 'Cidade', valor: vaga.cidade },
    { label: 'Escolaridade mínima', valor: vaga.escolaridade_minima },
    { label: 'Publicada em', valor: formatarData(vaga.created_at) },
    { label: 'Candidaturas até', valor: formatarData(vaga.data_limite) },
    { label: 'Experiência', valor: vaga.aceita_sem_experiencia ? 'Aceita sem experiência' : '' },
  ]

  const secoes = [
    { titulo: 'Descrição', conteudo: vaga.descricao },
    { titulo: 'Atividades', conteudo: vaga.atividades },
    { titulo: 'Requisitos', conteudo: vaga.requisitos },
    { titulo: 'Benefícios', conteudo: vaga.beneficios },
    { titulo: 'Observações da empresa', conteudo: vaga.observacoes_empresa },
    { titulo: 'Informações adicionais', conteudo: vaga.informacoes_adicionais },
    { titulo: 'Endereço de referência', conteudo: vaga.endereco_referencia },
    { titulo: 'Forma de candidatura', conteudo: vaga.forma_candidatura },
  ]

  const titulo = vaga.titulo || ''
  const empresa = vaga.empresa || ''
  const mensagem = `Olá! Encontrei a vaga de ${titulo} da empresa ${empresa} no TrajetEla e tenho interesse em participar do processo seletivo.`

  const contato = {
    whatsapp: vaga.whatsapp_contato,
    email: vaga.email_contato,
    preferido: vaga.contato_preferido,
    mensagem,
    assuntoEmail: `Interesse na vaga de ${titulo}`,
    rotuloWhatsapp: 'Enviar currículo pelo WhatsApp',
    rotuloEmail: 'Enviar currículo por e-mail',
  }

  return (
    <OportunidadeDetalhes
      titulo={titulo}
      subtitulo={empresa}
      bairro={vaga.bairro}
      zona={vaga.zona}
      distanciaKm={distanciaKm}
      compatValor={perfil ? compat : null}
      compatLabel={perfil ? classificarCompatibilidade(compat) : ''}
      valorPrincipal={salario}
      meta={meta}
      secoes={secoes}
      contato={contato}
      voltarPara="/vagas"
    />
  )
}
