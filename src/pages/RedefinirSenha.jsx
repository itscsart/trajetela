import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoOficial from '../assets/logo-oficial.svg'
import { supabase } from '../lib/supabase'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregandoSessao, setCarregandoSessao] = useState(true)
  const [sessaoValida, setSessaoValida] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    let ativo = true

    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (ativo) {
        setSessaoValida(Boolean(session))
        setCarregandoSessao(false)
      }
    }

    verificarSessao()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, session) => {
      if (!ativo) return

      if (evento === 'PASSWORD_RECOVERY' || session) {
        setSessaoValida(true)
      }

      setCarregandoSessao(false)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  const salvarNovaSenha = async () => {
    setErro('')

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setSalvando(true)

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    })

    setSalvando(false)

    if (error) {
      setErro('Não foi possível atualizar a senha. Solicite um novo link de recuperação.')
      return
    }

    await supabase.auth.signOut()
    setSucesso(true)
    setNovaSenha('')
    setConfirmarSenha('')
  }

  if (carregandoSessao) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ECE6FA]">
        <p className="text-[15px] font-semibold text-[#291662]">Validando link...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#ECE6FA] px-7 pb-10">
      <div className="flex justify-center pt-8">
        <img
          src={logoOficial}
          alt="TrajetEla"
          className="mx-auto h-auto w-[276px] object-contain sm:w-[320px] lg:w-[345px]"
        />
      </div>

      <h1 className="mt-8 text-center text-2xl font-extrabold text-[#291662]">
        Redefinir senha
      </h1>

      {sucesso ? (
        <div className="mt-10 rounded-2xl border border-[#8F55E9]/25 bg-white/70 p-6 text-center">
          <p className="text-[15px] font-semibold text-[#2EA043]">
            Senha atualizada com sucesso!
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-bold text-white"
          >
            Voltar ao login
          </button>
        </div>
      ) : !sessaoValida ? (
        <div className="mt-10 rounded-2xl border border-[#D6479B]/30 bg-white/70 p-6 text-center">
          <p className="text-[14px] leading-relaxed text-[#D6479B]">
            Este link é inválido ou expirou. Volte ao login e solicite um novo e-mail de recuperação.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-6 w-full rounded-full border-2 border-[#8F55E9] bg-white py-3.5 text-[15px] font-bold text-[#291662]"
          >
            Voltar ao login
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-center text-[14px] leading-relaxed text-[#291662]/75">
            Digite e confirme sua nova senha.
          </p>

          <div className="mt-9 space-y-4">
            <div className="flex items-center rounded-xl border border-[#291662]/20 bg-white px-4">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value)
                  setErro('')
                }}
                placeholder="Nova senha"
                className="w-full bg-transparent py-3.5 text-[15px] text-[#291662] outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((valor) => !valor)}
                className="text-[14px] font-medium text-[#291662]"
              >
                {mostrarSenha ? 'Ocultar' : 'Exibir'}
              </button>
            </div>

            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={confirmarSenha}
              onChange={(e) => {
                setConfirmarSenha(e.target.value)
                setErro('')
              }}
              placeholder="Confirmar nova senha"
              className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
            />
          </div>

          {erro && (
            <p className="mt-4 text-center text-[14px] font-medium text-[#D6479B]">
              {erro}
            </p>
          )}

          <button
            type="button"
            onClick={salvarNovaSenha}
            disabled={salvando}
            className="mx-auto mt-7 block w-full max-w-[250px] rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </>
      )}
    </div>
  )
}