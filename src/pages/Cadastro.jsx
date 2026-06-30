import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoOficial from '../assets/logo-oficial.svg'
import { ArrowLeftIcon, GoogleIcon } from '../components/Icons'

export default function Cadastro() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#ECE6FA] px-7 pb-10">
      <div className="pt-6">
        <button
          onClick={() => navigate('/login')}
          aria-label="Voltar"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8F55E9] text-[#8F55E9] active:bg-[#8F55E9]/10"
        >
          <ArrowLeftIcon />
        </button>
      </div>

      <div className="mt-2 flex justify-center">
        <img src={logoOficial} alt="TrajetEla" className="mx-auto h-auto w-[276px] object-contain sm:w-[320px] lg:w-[345px]" />
      </div>

      <h1 className="mt-8 text-center text-2xl font-extrabold text-[#291662]">
        Cadastre-se no TrajetEla
      </h1>

      <div className="mt-7 space-y-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#291662]">E-mail ou telefone</label>
          <input
            type="text"
            className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#291662]">Senha</label>
          <div className="flex items-center rounded-xl border border-[#291662]/20 bg-white px-4">
            <input
              type={showPass ? 'text' : 'password'}
              className="w-full bg-transparent py-3.5 text-[15px] text-[#291662] outline-none"
            />
            <button onClick={() => setShowPass((v) => !v)} className="text-[14px] font-medium text-[#291662]">
              {showPass ? 'Ocultar' : 'Exibir'}
            </button>
          </div>
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-[14px] text-[#291662]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 accent-[#8F55E9]"
        />
        Lembrar dos meus dados
      </label>

      <p className="mt-7 text-center text-[13px] leading-relaxed text-[#291662]/80">
        Ao clicar em Continuar, você aceita o <span className="font-bold">Contrato do Usuário</span>,
        a <span className="font-bold">Política de Privacidade</span> e a{' '}
        <span className="font-bold">Política de Cookies</span> do TrajetEla.
      </p>

      <button
        onClick={() => navigate('/home')}
        className="mx-auto mt-7 block w-full max-w-[230px] rounded-full border-2 border-[#291662] bg-white py-3.5 text-[15px] font-bold text-[#291662] active:bg-[#8F55E9]/10"
      >
        Continuar
      </button>

      <button className="mx-auto mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[#291662]/25 bg-white py-3.5 text-[15px] font-medium text-[#291662]">
        <GoogleIcon className="h-5 w-5" /> Continuar com google
      </button>

      <p className="mt-6 text-center text-[14px] text-[#291662]">
        Já faz parte do TrajetEla?{' '}
        <button onClick={() => navigate('/login')} className="font-bold text-[#291662]">
          Entrar
        </button>
      </p>

      <p className="mt-5 text-center text-[14px] leading-relaxed text-[#291662]">
        Gostaria de criar uma página
        <br />
        para uma empresa? <span className="font-bold">Receber ajuda</span>
      </p>
    </div>
  )
}
