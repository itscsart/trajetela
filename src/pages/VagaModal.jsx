import Modal from './Modal'
import { PinIcon, ClockIcon, BriefcaseIcon } from './Icons'

/**
 * Modal de detalhes de vaga, reutilizado em Home, Vagas, Renda Rápida e Salvos.
 * vaga: { titulo, empresa, local, modalidade, horario, salario, compat, descricao }
 * Props opcionais de salvamento:
 * - onSalvar: () => void   (se definido, mostra o botão de salvar)
 * - salvo: boolean         (estado salvo/não salvo)
 * - salvarLabel: string    (texto do botão, padrão "Salvar para depois")
 */
export default function VagaModal({ open, onClose, vaga, onSalvar, salvo = false, salvarLabel = 'Salvar para depois' }) {
  if (!vaga) return null

  const texto = encodeURIComponent(
    `Olá! Tenho interesse na oportunidade ${vaga.titulo} pelo TrajetEla.`,
  )
  const whatsapp = `https://wa.me/5511999999999?text=${texto}`

  return (
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

      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block w-full rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-3.5 text-center text-[15px] font-semibold text-white"
      >
        Tenho interesse
      </a>

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
  )
}
