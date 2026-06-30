import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { ShieldIcon, ClockIcon, TrashIcon } from '../components/Icons'
import excluirImg from '../assets/excluir-conta.png'

const avisos = [
  { Icon: ShieldIcon, texto: 'Você perderá o acesso a todas as suas informações e histórico.' },
  { Icon: ClockIcon, texto: 'Essa ação não poderá ser desfeita.' },
  { Icon: TrashIcon, texto: 'Seus dados serão removidos de forma definitiva dos nossos sistemas, em até 30 dias.' },
]

export default function ExcluirConta() {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const habilitado = texto === 'EXCLUIR'

  const excluir = () => {
    if (!habilitado) return
    localStorage.clear()
    navigate('/login')
  }

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Excluir conta" />

      <div className="flex justify-center pt-5">
        <img src={excluirImg} alt="" className="h-40 object-contain" />
      </div>

      <div className="px-6 pt-4">
        <h2 className="text-lg font-bold text-[#291662]">Antes de excluir sua conta, leia com atenção.</h2>

        <div className="mt-4 space-y-4 rounded-2xl border border-[#E89BB0] bg-[#FBE7EC] p-4">
          {avisos.map(({ Icon, texto }, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-6 w-6 flex-none text-[#D6479B]" />
              <p className="text-[13px] leading-snug text-[#291662]/85">{texto}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 font-bold text-[#291662]">Tem certeza que deseja excluir sua conta?</h3>
        <p className="mt-1 text-[13px] text-[#291662]/75">
          Digite a palavra EXCLUIR no campo abaixo para confirmar.
        </p>

        <label className="mt-5 block text-[13px] font-bold text-[#291662]">Digite EXCLUIR</label>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E89BB0] bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#D6479B]"
        />

        <button
          onClick={excluir}
          disabled={!habilitado}
          className={`mt-6 w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition-colors ${
            habilitado ? 'bg-[#D6479B] active:bg-[#bb3b86]' : 'cursor-not-allowed bg-[#EBA7BE]'
          }`}
        >
          Excluir minha conta
        </button>
      </div>
    </PageContainer>
  )
}
