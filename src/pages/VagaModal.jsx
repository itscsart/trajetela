import { useState } from 'react'
import Modal from './Modal'
import { PinIcon, ClockIcon, BriefcaseIcon } from './Icons'

/**
 * Modal de detalhes de vaga, reutilizado em Home, Vagas, Renda Rápida e Salvos.
 * Contato por vaga: whatsapp_contato, email_contato, contato_preferido.
 * Props opcionais de salvamento:
 * - onSalvar: () => void   (se definido, mostra o botão de salvar)
 * - salvo: boolean         (estado salvo/não salvo)
 * - salvarLabel: string    (texto do botão, padrão "Salvar para depois")
 */
export default function VagaModal({ open, onClose, vaga, onSalvar, salvo = false, salvarLabel = 'Salvar para depois' }) {
  const [escolhaAberta, setEscolhaAberta] = useState(false)
  const [aviso, setAviso] = useState('')

  if (!vaga) return null

  const titulo = vaga.titulo || ''
  const empresa = vaga.empresa || ''
  const whats = (vaga.whatsapp_contato || '').toString().replace(/\D/g, '')
  const email = vaga.email_contato || ''
  const preferido = (vaga.contato_preferido || '').toString().toLowerCase()

  const mensagem = `Olá! Encontrei a vaga de ${titulo} da empresa ${empresa} no TrajetEla e tenho interesse em participar do processo seletivo.`

  const abrirWhatsApp = () => {
    if (!whats) return
    window.open(`https://wa.me/${whats}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener,noreferrer')
  }

  const abrirEmail = () => {
    if (!email) return
    const assunto = encodeURIComponent(`Interesse na vaga de ${titulo}`)
    const corpo = encodeURIComponent(mensagem)
    window.location.href = `mailto:${email}?subject=${assunto}&body=${corpo}`
  }

  const temInteresse = () => {
    setAviso('')
    const temWhats = !!whats
    const temEmail = !!email

    if (!temWhats && !temEmail) {
      setAviso('O contato desta vaga ainda não está disponível.')
      return
    }

    if (preferido === 'whatsapp' && temWhats) {
      abrirWhatsApp()
      return
    }
    if (preferido === 'email' && temEmail) {
      abrirEmail()
      return
    }
    if (preferido === 'ambos' && temWhats && temEmail) {
      setEscolhaAberta(true)
      return
    }

    if (temWhats && !temEmail) {
      abrirWhatsApp()
      return
    }
    if (temEmail && !temWhats) {
      abrirEmail()
      return
    }

    // fallback: ambos disponíveis sem preferido definido
    setEscolhaAberta(true)
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={vaga.titulo}>
        {vaga.empresa && <p className="-mt-2 text-[14px] text-[#291662]/80">{vaga.empresa}</p>}

        <div className="mt-4 space-y-2 text-[14px] text-[#291662]">
          {vaga.local && (
            <p className="flex items-center gap-2">
              <PinIcon className="h-4 w-4 text-[#E84C8A]" /> {vaga.local}
            </p>
          )}
          {vaga.modalidade && (
            <p className="flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4 text-[#8F55E9]" /> {vaga.modalidade}
            </p>
          )}
          {vaga.horario && (
            <p className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-[#8F55E9]" /> {vaga.horario}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
          {vaga.salario && <span className="text-lg font-bold text-[#291662]">{vaga.salario}</span>}
          {vaga.compat != null && (
            <span className="text-[14px] font-medium text-[#2EA043]">{vaga.compat} % compatível</span>
          )}
        </div>

        {vaga.descricao && (
          <p className="mt-4 text-[14px] leading-relaxed text-[#291662]/80">{vaga.descricao}</p>
        )}

        <button
          type="button"
          onClick={temInteresse}
          className="mt-6 block w-full rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-3.5 text-center text-[15px] font-semibold text-white"
        >
          Tenho interesse
        </button>

        {aviso && (
          <p className="mt-3 text-center text-[14px] font-medium text-[#D6479B]">{aviso}</p>
        )}

        {onSalvar && (
          <button
            type="button"
            onClick={onSalvar}
            disabled={salvo}
            className={`mt-3 w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
              salvo ? 'border-[#2EA043] text-[#2EA043]' : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
            }`}
          >
            {salvo ? '✓ Salvo' : salvarLabel}
          </button>
        )}
      </Modal>

      {/* Escolha de canal quando contato_preferido = "ambos" */}
      <Modal open={escolhaAberta} onClose={() => setEscolhaAberta(false)} title="Como prefere entrar em contato?">
        <button
          type="button"
          onClick={() => {
            setEscolhaAberta(false)
            abrirWhatsApp()
          }}
          className="block w-full rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-3.5 text-center text-[15px] font-semibold text-white"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => {
            setEscolhaAberta(false)
            abrirEmail()
          }}
          className="mt-3 block w-full rounded-full border border-[#8F55E9] py-3.5 text-center text-[15px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
        >
          E-mail
        </button>
        <button
          type="button"
          onClick={() => setEscolhaAberta(false)}
          className="mt-3 block w-full rounded-full py-3.5 text-center text-[15px] font-semibold text-[#291662]/70"
        >
          Cancelar
        </button>
      </Modal>
    </>
  )
}
