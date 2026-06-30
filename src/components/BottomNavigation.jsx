import { useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, CoursesIcon, BriefcaseIcon, MoreIcon, BoltIcon } from './Icons'

const items = [
  { label: 'Início', path: '/home', Icon: HomeIcon },
  { label: 'Cursos', path: '/cursos', Icon: CoursesIcon },
  { label: 'Vagas', path: '/vagas', Icon: BriefcaseIcon },
  { label: 'Mais', path: '/mais', Icon: MoreIcon },
]

export default function BottomNavigation() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (path) => pathname === path

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-3 pb-3">
      <div className="relative flex items-end justify-between rounded-2xl border border-[#8F55E9]/20 bg-white px-5 py-2.5 shadow-[0_-2px_18px_rgba(41,22,98,0.10)]">
        {/* Esquerda */}
        <div className="flex flex-1 items-center justify-around">
          {items.slice(0, 2).map(({ label, path, Icon }) => (
            <NavButton key={path} label={label} Icon={Icon} active={isActive(path)} onClick={() => navigate(path)} />
          ))}
        </div>

        {/* Botão central raio → Renda Rápida */}
        <button
          onClick={() => navigate('/renda-rapida')}
          aria-label="Renda Rápida"
          className="mx-2 -mt-7 flex h-14 w-14 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#E060A6] to-[#B14AD6] text-white shadow-[0_8px_18px_rgba(177,74,214,0.45)] transition-transform active:scale-95"
        >
          <BoltIcon className="h-7 w-7" />
        </button>

        {/* Direita */}
        <div className="flex flex-1 items-center justify-around">
          {items.slice(2).map(({ label, path, Icon }) => (
            <NavButton key={path} label={label} Icon={Icon} active={isActive(path)} onClick={() => navigate(path)} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function NavButton({ label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors ${
        active ? 'text-[#8F55E9]' : 'text-[#291662]/55'
      }`}
    >
      <Icon className="h-[22px] w-[22px]" />
      {label}
    </button>
  )
}
