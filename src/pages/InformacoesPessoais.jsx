import { useEffect, useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { ShieldIcon } from '../components/Icons'
import infoImg from '../assets/informacoes-pessoais.png'

const STORAGE_KEY = 'trajetela_info_pessoais'

export default function InformacoesPessoais() {
  const [cpf, setCpf] = useState('123.456.789.10')
  const [email, setEmail] = useState('daniele.dourado@gmail.com')
  const [telefone, setTelefone] = useState('(11) 96084-5689')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const d = JSON.parse(raw)
        if (d.cpf) setCpf(d.cpf)
        if (d.email) setEmail(d.email)
        if (d.telefone) setTelefone(d.telefone)
      } catch {
        /* ignora */
      }
    }
  }, [])

  const salvar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cpf, email, telefone }))
    setSaved(true)
  }

  const onChange = (setter) => (e) => {
    setter(e.target.value)
    setSaved(false)
  }

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Informações pessoais" />

      <div className="flex justify-center pt-5">
        <img src={infoImg} alt="" className="h-40 object-contain" />
      </div>

      <div className="px-6 pt-3">
        <h2 className="text-center text-lg font-bold text-[#291662]">Seus dados estão seguros com a gente!</h2>

        <div className="mt-6 space-y-5">
          <Field label="CPF" value={cpf} onChange={onChange(setCpf)} />
          <Field label="E-mail" value={email} onChange={onChange(setEmail)} type="email" />
          <Field label="Telefone de contato" value={telefone} onChange={onChange(setTelefone)} />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#8F55E9]/40 bg-white/50 p-4">
          <ShieldIcon className="h-8 w-8 flex-none text-[#8F55E9]" />
          <p className="text-[13px] text-[#8F55E9]">
            Utilizamos esses dados apenas para melhorar sua experiência no TrajetEla.
          </p>
        </div>

        <button
          onClick={salvar}
          className="mt-7 w-full rounded-xl bg-[#A98BE0] py-3.5 text-[15px] font-semibold text-white shadow-sm active:bg-[#8F55E9]"
        >
          Salvar preferências
        </button>
        {saved && (
          <p className="mt-3 text-center text-[14px] font-medium text-[#2EA043]">
            Informações salvas com sucesso!
          </p>
        )}
      </div>
    </PageContainer>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-bold text-[#291662]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[#8F55E9]/30 bg-white px-4 py-3.5 text-[15px] text-[#291662] outline-none focus:border-[#8F55E9]"
      />
    </div>
  )
}
