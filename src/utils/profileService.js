import { supabase } from '../lib/supabase'

function obterNomeDoUsuario(user) {
  return (
    user?.user_metadata?.nome ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    ''
  )
}

export async function getPerfil() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Erro ao buscar usuária autenticada:', userError)
    return null
  }

  if (!user) return null

  const { data: perfil, error: perfilError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (perfilError) {
    console.error('Erro ao buscar perfil:', perfilError)
    return null
  }

  if (perfil) {
    if (!perfil.nome) {
      const nome = obterNomeDoUsuario(user)

      if (nome) {
        const { data: atualizado, error: updateError } = await supabase
          .from('profiles')
          .update({
            nome,
            email: perfil.email || user.email || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Erro ao atualizar nome do perfil:', updateError)
          return { ...perfil, nome }
        }

        return atualizado
      }
    }

    return perfil
  }

  const novoPerfil = {
    id: user.id,
    nome: obterNomeDoUsuario(user),
    email: user.email || '',
    updated_at: new Date().toISOString(),
  }

  const { data: criado, error: insertError } = await supabase
    .from('profiles')
    .insert(novoPerfil)
    .select()
    .single()

  if (insertError) {
    console.error('Erro ao criar perfil:', insertError)
    return novoPerfil
  }

  return criado
}

export async function criarPerfilSeNaoExistir() {
  return getPerfil()
}

export async function salvarPerfil(dados) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Erro ao buscar usuária autenticada:', userError)
    return false
  }

  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...dados,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Erro ao salvar perfil:', error)
    return false
  }

  return true
}