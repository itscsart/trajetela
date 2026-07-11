// Distância entre dois pontos usando a fórmula de Haversine (em km).
export function calcularDistanciaKm(latitudeUsuario, longitudeUsuario, latitudeVaga, longitudeVaga) {
  if (
    latitudeUsuario == null ||
    longitudeUsuario == null ||
    latitudeVaga == null ||
    longitudeVaga == null
  ) {
    return null
  }

  const R = 6371 // raio da Terra em km
  const rad = (x) => (Number(x) * Math.PI) / 180

  const dLat = rad(latitudeVaga - latitudeUsuario)
  const dLon = rad(longitudeVaga - longitudeUsuario)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(latitudeUsuario)) * Math.cos(rad(latitudeVaga)) * Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
