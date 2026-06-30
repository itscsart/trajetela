import { useNavigate } from 'react-router-dom'
import perfil from '../assets/perfil.png'

/**
 * Cabeçalho roxo com título, subtítulo e avatar (Home, Cursos, Vagas, Renda Rápida).
 * O avatar leva ao Perfil.
 */
export default function UserHeader({ title, subtitle }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-b from-[#D7CAF6] to-[#C9B6F1] px-6 pb-10 pt-9">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#291662]">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-[#291662]/80">{subtitle}</p>}
        </div>
        <button
          onClick={() => navigate('/perfil')}
          aria-label="Abrir perfil"
          className="h-14 w-14 flex-none overflow-hidden rounded-full border-2 border-white shadow-md"
        >
          <img src={perfil} alt="Daniele" className="h-full w-full object-cover" />
        </button>
      </div>
    </div>
  )
}
