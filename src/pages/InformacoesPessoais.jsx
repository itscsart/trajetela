import { useEffect, useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { ShieldIcon } from '../components/Icons'
import infoImg from '../assets/informacoes-pessoais.png'
import { getPerfil, salvarPerfil } from '../utils/profileService'

const escolaridades = [
  'Ensino fundamental incompleto',
  'Ensino fundamental completo',
  'Ensino médio incompleto',
  'Ensino médio completo',
  'Ensino técnico',
  'Ensino superior incompleto',
  'Ensino superior completo',
  'Pós-graduação',
]

function formatarCpf(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function InformacoesPessoais() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [escolaridade, setEscolaridade] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregarDados() {
      setCarregando(true)
      setErro('')

      const perfil = await getPerfil()

      if (!ativo) return

      if (!perfil) {
        setErro('Não foi possível carregar suas informações.')
        setCarregando(false)
        return
      }

      setNome(perfil.nome || '')
      setEmail(perfil.email || '')
      setCpf(perfil.cpf || '')
      setTelefone(perfil.telefone || '')
      setDataNascimento(perfil.data_nascimento || '')
      setCidade(perfil.cidade || '')
      setEstado(perfil.estado || '')
      setEscolaridade(perfil.escolaridade || '')
      setCarregando(false)
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [])

  const limparFeedback = () => {
    setMensagem('')
    setErro('')
  }

  const salvar = async () => {
    limparFeedback()

    if (cpf && cpf.replace(/\D/g, '').length !== 11) {
      setErro('Digite um CPF com 11 números.')
      return
    }

    if (telefone && telefone.replace(/\D/g, '').length < 10) {
      setErro('Digite um telefone válido com DDD.')
      return
    }

    setSalvando(true)

    const sucesso = await salvarPerfil({
      cpf: cpf || null,
      telefone: telefone || null,
      data_nascimento: dataNascimento || null,
      cidade: cidade.trim() || null,
      estado: estado.trim().toUpperCase() || null,
      escolaridade: escolaridade || null,
    })

    setSalvando(false)

    if (!sucesso) {
      setErro('Não foi possível salvar suas informações. Tente novamente.')
      return
    }

    setMensagem('Informações salvas com sucesso!')
  }

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Informações pessoais" />

      <div className="flex justify-center pt-5">
        <img src={infoImg} alt="" className="h-40 object-contain" />
      </div>

      <div className="px-6 pt-3">
        <h2 className="text-center text-lg font-bold text-[#291662]">
          Seus dados estão seguros com a gente!
        </h2>

        {carregando ? (
          <p className="mt-8 text-center text-[14px] font-medium text-[#291662]/70">
            Carregando informações...
          </p>
        ) : (
          <>
            <div className="mt-6 space-y-5">
              <Field
                label="Nome completo"
                value={nome}
                readOnly
              />

              <Field
                label="E-mail"
                value={email}
                type="email"
                readOnly
              />

              <Field
                label="CPF"
                value={cpf}
                onChange={(e) => {
                  setCpf(formatarCpf(e.target.value))
                  limparFeedback()
                }}
                inputMode="numeric"
                placeholder="000.000.000-00"
              />

              <Field
                label="Telefone de contato"
                value={telefone}
                onChange={(e) => {
                  setTelefone(formatarTelefone(e.target.value))
                  limparFeedback()
                }}
                inputMode="tel"
                placeholder="(11) 99999-9999"
              />

              <Field
                label="Data de nascimento"
                value={dataNascimento}
                onChange={(e) => {
                  setDataNascimento(e.target.value)
                  limparFeedback()
                }}
                type="date"
              />

              <Field
                label="Cidade"
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value)
                  limparFeedback()
                }}
                placeholder="Ex.: São Paulo"
              />

              <Field
                label="Estado"
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value.slice(0, 2).toUpperCase())
                  limparFeedback()
                }}
                placeholder="UF"
                maxLength={2}
              />

              <SelectField
                label="Escolaridade"
                value={escolaridade}
                onChange={(e) => {
                  setEscolaridade(e.target.value)
                  limparFeedback()
                }}
                options={escolaridades}
              />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#8F55E9]/40 bg-white/50 p-4">
              <ShieldIcon className="h-8 w-8 flex-none text-[#8F55E9]" />
              <p className="text-[13px] text-[#8F55E9]">
                Utilizamos esses dados apenas para melhorar sua experiência no TrajetEla.
              </p>
            </div>

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
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="mt-7 w-full rounded-xl bg-[#A98BE0] py-3.5 text-[15px] font-semibold text-white shadow-sm active:bg-[#8F55E9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar informações'}
            </button>
          </>
        )}
      </div>
    </PageContainer>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  inputMode,
  placeholder,
  maxLength,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-bold text-[#291662]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        inputMode={inputMode}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none ${
          readOnly
            ? 'cursor-not-allowed border-[#291662]/10 bg-[#F4F0FA] text-[#291662]/60'
            : 'border-[#8F55E9]/30 bg-white text-[#291662] focus:border-[#8F55E9]'
        }`}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-bold text-[#291662]">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[#8F55E9]/30 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}