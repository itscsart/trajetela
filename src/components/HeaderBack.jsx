import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './Icons'

/**
 * Botão de voltar circular com borda roxa.
 * - to: rota fixa de destino. Se não informado, volta no histórico.
 * - title: título centralizado opcional (ex.: telas Perfil, E-book).
 */
export default function HeaderBack({ to, title }) {
  const navigate = useNavigate()
  const goBack = () => (to ? navigate(to) : navigate(-1))

  return (
    <div className="relative flex items-center px-5 pt-6">
      <button
        onClick={goBack}
        aria-label="Voltar"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8F55E9] text-[#8F55E9] transition-colors active:bg-[#8F55E9]/10"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      {title && (
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xl font-bold text-[#291662]">
          {title}
        </h1>
      )}
    </div>
  )
}
