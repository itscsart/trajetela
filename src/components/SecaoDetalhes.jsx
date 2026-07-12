/**
 * Bloco de seção de detalhes. Não renderiza nada quando o conteúdo está vazio,
 * evitando blocos vazios na página.
 */
export default function SecaoDetalhes({ titulo, children }) {
  const vazio =
    children == null ||
    children === '' ||
    (Array.isArray(children) && children.filter(Boolean).length === 0)

  if (vazio) return null

  return (
    <div className="mt-5">
      {titulo && <h3 className="mb-1.5 text-[15px] font-bold text-[#291662]">{titulo}</h3>}
      <div className="text-[14px] leading-relaxed text-[#291662]/80">{children}</div>
    </div>
  )
}
