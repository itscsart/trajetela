import { useEffect, useState } from 'react'
import { calcularDistanciaKm } from './distancia'

// Precisão mínima aceitável (metros). Acima disso, não exibimos distância.
export const LIMITE_PRECISAO_METROS = 1000

/**
 * Solicita a localização atual do navegador com alta precisão.
 * As coordenadas ficam SOMENTE em memória — nunca são salvas no banco/localStorage.
 * Retorna uma Promise que resolve com { lat, lon, accuracy } ou rejeita.
 */
export function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocalização não suportada.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    )
  })
}

// Reexporta o cálculo de distância (fonte única em distancia.js).
export { calcularDistanciaKm }

/**
 * Distância válida somente quando a precisão é aceitável e há coordenadas.
 * Retorna número (km) ou null.
 */
export function distanciaValida(coords, latitude, longitude) {
  if (!coords || coords.accuracy > LIMITE_PRECISAO_METROS) return null
  if (latitude == null || longitude == null) return null
  return calcularDistanciaKm(coords.lat, coords.lon, Number(latitude), Number(longitude))
}

/** Formata "2,7 km" / "12 km". Retorna '' quando não houver distância. */
export function formatarDistancia(km) {
  if (km == null || !Number.isFinite(km)) return ''
  const valor = km < 10 ? km.toFixed(1).replace('.', ',') : String(Math.round(km))
  return `${valor} km`
}

/**
 * Hook de localização reutilizável.
 * coords: { lat, lon, accuracy } | null  (apenas em memória)
 * preciso: boolean — se a precisão é aceitável
 * obtendo: boolean — enquanto solicita
 * aviso: string — mensagem amigável quando falha/imprecisa
 * solicitar(): dispara nova leitura (maximumAge: 0)
 */
export function useLocalizacao({ automatico = true } = {}) {
  const [coords, setCoords] = useState(null)
  const [obtendo, setObtendo] = useState(false)
  const [aviso, setAviso] = useState('')

  const solicitar = () => {
    setObtendo(true)
    setAviso('')
    obterLocalizacao()
      .then((c) => {
        if (c.accuracy > LIMITE_PRECISAO_METROS) {
          setCoords(null)
          setAviso(
            'Não foi possível identificar sua localização com precisão. Você ainda pode buscar oportunidades por cidade e bairro.',
          )
        } else {
          setCoords(c)
          setAviso('')
        }
      })
      .catch(() => {
        setCoords(null)
        setAviso(
          'Não foi possível identificar sua localização com precisão. Você ainda pode buscar oportunidades por cidade e bairro.',
        )
      })
      .finally(() => setObtendo(false))
  }

  useEffect(() => {
    if (automatico) solicitar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const preciso = !!coords && coords.accuracy <= LIMITE_PRECISAO_METROS

  return { coords, preciso, obtendo, aviso, solicitar }
}
