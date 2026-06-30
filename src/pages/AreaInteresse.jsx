import { useEffect, useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { BriefcaseIcon, BoltIcon } from '../components/Icons'
import areaImg from '../assets/area-interesse.png'

const areas = ['Vendas', 'Administrativo', 'Educação', 'Marketing', 'Audiovisual', 'Limpeza', 'Gastronomia', 'Outros']
const tipos = ['Presencial', 'Híbrido', 'Remoto']
const STORAGE_KEY = 'trajetela_area_interesse'

export default function AreaInteresse() {
  const [prioridade, setPrioridade] = useState('Emprego')
  const [selectedAreas, setSelectedAreas] = useState([])
  const [tipo, setTipo] = useState('Presencial')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        setPrioridade(data.prioridade ?? 'Emprego')
        setSelectedAreas(data.selectedAreas ?? [])
        setTipo(data.tipo ?? 'Presencial')
      } catch {
        /* ignora dados inválidos */
      }
    }
  }, [])

  const toggleArea = (area) => {
    setSaved(false)
    setSelectedAreas((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area)
      if (prev.length >= 3) return prev // máximo 3 áreas
      return [...prev, area]
    })
  }

  const salvar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ prioridade, selectedAreas, tipo }))
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

        {/* Prioridade */}
        <p className="mt-6 text-[13px] font-semibold text-[#291662]">Prioridade</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <PrioridadeCard
            ativo={prioridade === 'Emprego'}
            onClick={() => { setPrioridade('Emprego'); setSaved(false) }}
            icon={<BriefcaseIcon className="h-7 w-7 text-[#8F55E9]" />}
            titulo="Emprego"
            desc="Vagas CLT, meio período, temporário ect."
          />
          <PrioridadeCard
            ativo={prioridade === 'Freela'}
            onClick={() => { setPrioridade('Freela'); setSaved(false) }}
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

        {/* Tipo de trabalho */}
        <p className="mt-6 text-[15px] font-bold text-[#291662]">Tipo de trabalho</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tipos.map((t) => (
            <Chip key={t} ativo={tipo === t} onClick={() => { setTipo(t); setSaved(false) }}>
              {t}
            </Chip>
          ))}
        </div>

        <button
          onClick={salvar}
          className="mt-7 w-full rounded-xl bg-[#A98BE0] py-3.5 text-[15px] font-semibold text-white shadow-sm active:bg-[#8F55E9]"
        >
          Salvar preferências
        </button>
        {saved && (
          <p className="mt-3 text-center text-[14px] font-medium text-[#2EA043]">
            Preferências salvas com sucesso!
          </p>
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
