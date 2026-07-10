import { supabase } from '../lib/supabase'

export async function getPerfil() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}

export async function criarPerfilSeNaoExistir() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (perfil) return perfil

  const novoPerfil = {
    id: user.id,
    nome:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      '',
    email: user.email || '',
  }

  await supabase
    .from('profiles')
    .insert(novoPerfil)

  return novoPerfil
}

export async function salvarPerfil(dados) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...dados,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error(error)
    return false
  }

  return true
}