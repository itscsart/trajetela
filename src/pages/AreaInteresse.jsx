import { useEffect, useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { BriefcaseIcon, BoltIcon } from '../components/Icons'
import areaImg from '../assets/area-interesse.png'
import { getPerfil, salvarPerfil } from '../utils/profileService'

const areas = [
  'Vendas',
  'Administrativo',
  'Educação',
  'Marketing',
  'Limpeza',
  'Gastronomia',
  'Beleza',
  'Cuidados',
  'Tecnologia',
  'Outros',
]
const tipos = ['Presencial', 'Híbrido', 'Remoto']

export default function AreaInteresse() {
  const [prioridade, setPrioridade] = useState('Emprego')
  const [selectedAreas, setSelectedAreas] = useState([])
  const [tipo, setTipo] = useState('Presencial')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregarDados() {
      setCarregando(true)
      setErro('')

      const perfil = await getPerfil()

      if (!ativo) return

      if (perfil) {
        setPrioridade(perfil.prioridade || 'Emprego')
        setSelectedAreas(Array.isArray(perfil.areas_interesse) ? perfil.areas_interesse : [])
        setTipo(perfil.tipo_trabalho || 'Presencial')
      }

      setCarregando(false)
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [])

  const limparFeedback = () => {
    setSaved(false)
    setAviso('')
    setErro('')
  }

  const toggleArea = (area) => {
    limparFeedback()
    setSelectedAreas((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area)
      if (prev.length >= 3) {
        setAviso('Você pode escolher até 3 áreas de interesse.')
        return prev
      }
      return [...prev, area]
    })
  }

  const salvar = async () => {
    limparFeedback()
    setSalvando(true)

    const sucesso = await salvarPerfil({
      prioridade,
      areas_interesse: selectedAreas,
      tipo_trabalho: tipo,
    })

    setSalvando(false)

    if (!sucesso) {
      setErro('Não foi possível salvar suas preferências. Tente novamente.')
      return
    }

    setSaved(true)
  }

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Área de interesse" />

      <div className="flex justify-center pt-5">
        <img src={areaImg} alt="" className="h-40 object-contain" />
      </div>

      <div className="px-6 pt-5">
        <h2 className="text-xl font-bold text-[#291662]">Conte para a gente o que você procura!</h2>
        <p className="mt-2 text-[14px] text-[#291662]/80">
          Assim, podemos te mostrar oportunidades que combinam com você.
        </p>

        {carregando ? (
          <p className="mt-8 text-center text-[14px] font-medium text-[#291662]/70">
            Carregando preferências...
          </p>
        ) : (
          <>
            {/* Prioridade */}
            <p className="mt-6 text-[13px] font-semibold text-[#291662]">Prioridade</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <PrioridadeCard
                ativo={prioridade === 'Emprego'}
                onClick={() => { setPrioridade('Emprego'); limparFeedback() }}
                icon={<BriefcaseIcon className="h-7 w-7 text-[#8F55E9]" />}
                titulo="Emprego"
                desc="Vagas CLT, meio período, temporário ect."
              />
              <PrioridadeCard
                ativo={prioridade === 'Freela'}
                onClick={() => { setPrioridade('Freela'); limparFeedback() }}
                icon={
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E060A6] to-[#B14AD6] text-white">
                    <BoltIcon className="h-4 w-4" />
                  </span>
                }
                titulo="Freela"
                desc="Trabalhos por projeto, tarefa ou serviço."
              />
            </div>

            {/* Áreas de interesse */}
            <p className="mt-6 text-[15px] font-bold text-[#291662]">Áreas de interesse</p>
            <p className="text-[13px] text-[#291662]/70">Selecione até 3 áreas principais</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {areas.map((a) => (
                <Chip key={a} ativo={selectedAreas.includes(a)} onClick={() => toggleArea(a)}>
                  {a}
                </Chip>
              ))}
            </div>
            {aviso && (
              <p className="mt-2 text-[13px] font-medium text-[#D6479B]">{aviso}</p>
            )}

            {/* Tipo de trabalho */}
            <p className="mt-6 text-[15px] font-bold text-[#291662]">Tipo de trabalho</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tipos.map((t) => (
                <Chip key={t} ativo={tipo === t} onClick={() => { setTipo(t); limparFeedback() }}>
                  {t}
                </Chip>
              ))}
            </div>

            <button
              onClick={salvar}
              disabled={salvando}
              className="mt-7 w-full rounded-xl bg-[#A98BE0] py-3.5 text-[15px] font-semibold text-white shadow-sm active:bg-[#8F55E9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar preferências'}
            </button>
            {erro && (
              <p className="mt-3 text-center text-[14px] font-medium text-[#D6479B]">
                {erro}
              </p>
            )}
            {saved && (
              <p className="mt-3 text-center text-[14px] font-medium text-[#2EA043]">
                Preferências salvas com sucesso!
              </p>
            )}
          </>
        )}
      </div>
    </PageContainer>
  )
}

function PrioridadeCard({ ativo, onClick, icon, titulo, desc }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        ativo ? 'border-[#D6479B] bg-[#FBE7EC]' : 'border-[#8F55E9]/30 bg-white/60'
      }`}
    >
      {icon}
      <p className="mt-2 text-[16px] font-bold text-[#291662]">{titulo}</p>
      <p className="mt-1 text-[12px] leading-snug text-[#291662]/75">{desc}</p>
    </button>
  )
}

function Chip({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
        ativo ? 'border-[#8F55E9] bg-[#8F55E9] text-white' : 'border-[#8F55E9]/40 bg-white/50 text-[#291662]'
      }`}
    >
      {children}
    </button>
  )
}
