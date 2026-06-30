import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoRosa from '../assets/logo-rosa.png'
import avatar from '../assets/avatar.png'

export default function Splash() {
  const navigate = useNavigate()
  // 'rosa-in' -> 'rosa-out' -> 'oficial'
  const [fase, setFase] = useState('rosa-in')

  useEffect(() => {
    const t1 = setTimeout(() => setFase('rosa-out'), 1800)
    const t2 = setTimeout(() => setFase('oficial'), 2200)
    const t3 = setTimeout(() => navigate('/login'), 4200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#EFE7FB]">
      <style>{`
        @keyframes rosaIn {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes rosaOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.95); }
        }
        @keyframes symbolIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes textIn {
          0%   { opacity: 0; transform: translateX(-100%); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .te-rosa-in  { animation: rosaIn 1.4s ease-out forwards; }
        .te-rosa-out { animation: rosaOut 0.4s ease-in forwards; }
        .te-symbol   { animation: symbolIn 0.45s ease-out forwards; }
        .te-text     { opacity: 0; animation: textIn 0.7s ease-out 0.45s forwards; }
        @media (prefers-reduced-motion: reduce) {
          .te-rosa-in, .te-rosa-out, .te-symbol, .te-text {
            animation: none; opacity: 1; transform: none;
          }
        }
      `}</style>

      {/* Apenas um logo por vez */}
      {fase === 'oficial' ? (
        <div className="flex items-center">
          <img src={avatar} alt="TrajetEla" className="te-symbol relative z-20 w-20 object-contain" />
          {/* O texto nasce atrás do símbolo e desliza para a direita */}
          <div className="-ml-2 overflow-hidden">
            <span className="te-text inline-block whitespace-nowrap pl-2 text-[30px] font-bold text-[#291662]">
              TrajetEla
            </span>
          </div>
        </div>
      ) : (
        <img
          src={logoRosa}
          alt="TrajetEla"
          className={`${fase === 'rosa-out' ? 'te-rosa-out' : 'te-rosa-in'} w-[135px] object-contain`}
        />
      )}
    </div>
  )
}
