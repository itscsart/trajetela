/**
 * Exibe "bairro · zona · X km de você".
 * A distância só aparece quando distanciaKm é um número válido (regras de precisão
 * ficam na página que calcula). Sem distância, mostra apenas bairro e zona.
 */
export default function LocalizacaoOportunidade({ bairro, zona, distanciaKm, className = '' }) {
  const partes = [bairro, zona].filter(Boolean)

  if (distanciaKm != null && Number.isFinite(distanciaKm)) {
    const km = distanciaKm < 10 ? distanciaKm.toFixed(1).replace('.', ',') : String(Math.round(distanciaKm))
    partes.push(`${km} km de você`)
  }

  if (partes.length === 0) return null

  return <span className={className}>{partes.join(' · ')}</span>
}
