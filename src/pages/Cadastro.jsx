import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoOficial from '../assets/logo-oficial.svg'
import Modal from '../components/Modal'
import { ArrowLeftIcon, GoogleIcon } from '../components/Icons'

export default function Cadastro() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [nome, setNome] = useState('')
  const [emailOuTelefone, setEmailOuTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [codigoGerado, setCodigoGerado] = useState('')
  const [codigoDigitado, setCodigoDigitado] = useState('')
  const [erroCodigo, setErroCodigo] = useState('')

  const cadastrar = () => {
    const nomeLimpo = nome.trim()
    const valor = emailOuTelefone.trim()
    if (!nomeLimpo) {
      setErro('Informe seu nome completo.')
      return
    }
    if (!valor) {
      setErro('Informe seu e-mail ou telefone.')
      return
    }
    if (!senha) {
      setErro('Informe uma senha.')
      return
    }
    if (senha.length < 4) {
      setErro('A senha deve ter ao menos 4 caracteres.')
      return
    }
    setErro('')

    const codigo = String(Math.floor(100000 + Math.random() * 900000))
    setCodigoGerado(codigo)
    localStorage.setItem(
      'trajetela_usuario_pendente',
      JSON.stringify({
        nome: nomeLimpo,
        emailOuTelefone: valor,
        senha,
        codigoVerificacao: codigo,
        verificado: false,
      }),
    )
    setCodigoDigitado('')
    setErroCodigo('')
    setModalAberto(true)
  }

  const confirmarCodigo = () => {
    let pendente = null
    try {
      pendente = JSON.parse(localStorage.getItem('trajetela_usuario_pendente') || 'null')
    } catch {
      pendente = null
    }
    if (!pendente || codigoDigitado.trim() !== pendente.codigoVerificacao) {
      setErroCodigo('Código incorreto. Verifique e tente novamente.')
      return
    }

    localStorage.setItem(
      'trajetela_usuario',
      JSON.stringify({
        nome: pendente.nome,
        emailOuTelefone: pendente.emailOuTelefone,
        senha: pendente.senha,
        verificado: true,
        logado: true,
        criadoEm: new Date().toISOString(),
      }),
    )
    localStorage.removeItem('trajetela_usuario_pendente')
    setModalAberto(false)
    navigate('/home')
  }

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
          <label className="mb-1.5 block text-[13px] font-medium text-[#291662]">Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              setErro('')
            }}
            className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#291662]">E-mail ou telefone</label>
          <input
            type="text"
            value={emailOuTelefone}
            onChange={(e) => {
              setEmailOuTelefone(e.target.value)
              setErro('')
            }}
            className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#291662]">Senha</label>
          <div className="flex items-center rounded-xl border border-[#291662]/20 bg-white px-4">
            <input
              type={showPass ? 'text' : 'password'}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                setErro('')
              }}
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

      {erro && <p className="mt-4 text-center text-[14px] font-medium text-[#D6479B]">{erro}</p>}

      <button
        onClick={cadastrar}
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

      {/* Modal de verificação simulada */}
      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Confirme seu cadastro">
        <p className="text-[14px] leading-relaxed text-[#291662]/80">
          Enviamos um código de verificação para seu e-mail ou telefone.
        </p>
        <div className="mt-3 rounded-2xl bg-[#F6F1FE] px-4 py-3 text-center text-[14px] font-bold text-[#291662]">
          Código de teste: {codigoGerado}
        </div>

        <label className="mb-1.5 mt-5 block text-[13px] font-medium text-[#291662]">Digite o código</label>
        <input
          type="text"
          inputMode="numeric"
          value={codigoDigitado}
          onChange={(e) => {
            setCodigoDigitado(e.target.value)
            setErroCodigo('')
          }}
          className="w-full rounded-xl border border-[#291662]/20 bg-white px-4 py-3.5 text-center text-[18px] font-bold tracking-[0.3em] text-[#291662] outline-none focus:border-[#8F55E9]"
        />
        {erroCodigo && <p className="mt-3 text-center text-[14px] font-medium text-[#D6479B]">{erroCodigo}</p>}

        <button
          onClick={confirmarCodigo}
          className="mt-6 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
        >
          Confirmar código
        </button>
      </Modal>
    </div>
  )
}
