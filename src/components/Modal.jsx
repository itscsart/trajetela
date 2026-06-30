import { useEffect } from 'react'

/** Modal estilo bottom-sheet, centralizado na largura do app e acima do menu. */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[430px] animate-[modalUp_0.22s_ease-out] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
      >
        <style>{`@keyframes modalUp { from { transform: translateY(24px); opacity: .6 } to { transform: translateY(0); opacity: 1 } }`}</style>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#291662]/15" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-[#291662]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#F1EAFD] text-[#291662]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
