import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { BookIcon, BoltIcon, ClockIcon, GridIcon, DoorIcon } from '../components/Icons'

function BookmarkIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4V4Z" />
    </svg>
  )
}

const itens = [
  { label: 'E-book', path: '/ebook', Icon: BookIcon },
  { label: 'Salvos', path: '/salvos', Icon: BookmarkIcon },
  { label: 'TrajetEla  Potência', path: '/potencia', Icon: BoltIcon },
  { label: 'Autoridade por 40 minutos', path: '/autoridade-40-minutos', Icon: ClockIcon },
  { label: 'Macth', path: '/match', Icon: GridIcon },
  { label: 'Portas Abertas', path: '/portas-abertas', Icon: DoorIcon },
]

export default function Mais() {
  const navigate = useNavigate()

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack />

      <div className="px-7 pt-5">
        <h1 className="text-2xl font-extrabold text-[#291662]">TrajetEla</h1>
        <p className="mt-1 text-[15px] text-[#291662]/80">Ferramentas que impulsionam sua jornada</p>

        <div className="mt-10 space-y-7">
          {itens.map(({ label, path, Icon }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex w-full items-center gap-4 text-left"
            >
              <Icon className="h-6 w-6 text-[#291662]" />
              <span className="text-[16px] text-[#291662]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
