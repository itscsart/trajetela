import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoOficial from '../assets/logo-oficial.svg'
import { GoogleIcon, MicrosoftIcon } from '../components/Icons'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [emailOuTelefone, setEmailOuTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false)

  const entrarComGoogle = async () => {
    setErro('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    })

    if (error) {
      setErro('Não foi possível entrar com o Google.')
    }
  }

  const recuperarSenha = async () => {
    setErro('')
    setMensagem('')

    const email = emailOuTelefone.trim()

    if (!email || !email.includes('@')) {
      setErro('Digite seu e-mail para receber o link de recuperação.')
      return
    }

    setEnviandoRecuperacao(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    setEnviandoRecuperacao(false)

    if (error) {
      setErro('Não foi possível enviar o e-mail de recuperação. Tente novamente.')
      return
    }

    setMensagem('Enviamos um link para redefinir sua senha. Confira também a caixa de spam.')
  }

  const entrar = async () => {
    setErro('')

    if (!emailOuTelefone.trim() || !senha.trim()) {
      setErro('Preencha seu e-mail e senha.')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOuTelefone.trim(),
      password: senha
    })

    if (error) {
      setErro('E-mail ou senha inválidos.')
      return
    }

    if (!data.user) {
      setErro('Usuário não encontrado.')
      return
    }

    const usuarioReal = {
      id: data.user.id,
      nome: data.user.user_metadata?.nome || '',
      emailOuTelefone: data.user.email || '',
      verificado: Boolean(data.user.email_confirmed_at),
      logado: true,
    }

    localStorage.setItem(
      'trajetela_usuario',
      JSON.stringify(usuarioReal)
    )

    navigate('/home')
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#ECE6FA] px-7 pb-10">
      <div className="flex justify-center pt-8">
        <img src={logoOficial} alt="TrajetEla" className="mx-auto h-auto w-[276px] object-contain sm:w-[320px] lg:w-[345px]" />
      </div>

      <h1 className="mt-8 text-center text-2xl font-extrabold text-[#291662]">
        Bem-vinda ao TrajetEla
      </h1>

      <div className="mt-9 space-y-3">
        <button
          type="button"
          onClick={entrarComGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-[#291662]/25 bg-white py-3.5 text-[15px] font-medium text-[#291662]"
        >
          <GoogleIcon className="h-5 w-5" /> Continuar com Google
        </button>
        <button className="flex w-full items-center justify-center gap-3 rounded-full border border-[#291662]/25 bg-white py-3.5 text-[15px] font-medium text-[#291662]">
          <MicrosoftIcon className="h-4 w-4" /> Entrar com a Microsoft
        </button>
      </div>

      <p className="mt-5 text-center text-[13px] leading-relaxed text-[#291662]/80">
        Ao clicar em Continuar, você aceita o <span className="underline">Contrato do Usuário</span>,
        a <span className="underline">Política de Privacidade</span> e a{' '}
        <span className="underline">Política de Cookies</span> do TrajetEla.
      </p>

      <div className="mt-9 space-y-3">
        <input
          type="text"
          value={emailOuTelefone}
          onChange={(e) => {
            setEmailOuTelefone(e.target.value)
            setErro('')
          }}
          placeholder="E-mail ou telefone"
          className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
        />

        <div className="flex items-center rounded-xl border border-[#291662]/20 bg-white px-4">
          <input
            type={showPass ? 'text' : 'password'}
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value)
              setErro('')
            }}
            placeholder="Senha"
            className="w-full bg-transparent py-3.5 text-[15px] text-[#291662] outline-none"
          />

          <button
            onClick={() => setShowPass((v) => !v)}
            className="text-[14px] font-medium text-[#291662]"
          >
            {showPass ? 'Ocultar' : 'Exibir'}
          </button>
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

      <button
        type="button"
        onClick={recuperarSenha}
        disabled={enviandoRecuperacao}
        className="mt-4 block text-[15px] font-semibold text-[#291662] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviandoRecuperacao ? 'Enviando...' : 'Esqueceu a senha?'}
      </button>

      {erro && (
        <p className="mt-4 text-center text-[14px] font-medium text-[#D6479B]">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="mt-4 text-center text-[14px] font-medium text-[#2EA043]">
          {mensagem}
        </p>
      )}

      <button
        onClick={entrar}
        className="mx-auto mt-7 block w-full max-w-[230px] rounded-full border-2 border-[#8F55E9] bg-white py-3.5 text-[15px] font-bold text-[#291662] transition-colors active:bg-[#8F55E9]/10"
      >
        Continuar
      </button>

      <p className="mt-7 text-center text-[14px] text-[#291662]">
        Ainda não faz parte do TrajetEla?{' '}
        <button
          onClick={() => navigate('/cadastro')}
          className="font-bold text-[#291662] underline"
        >
          Cadastre-se agora
        </button>
      </p>
    </div>
  )
}