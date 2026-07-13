import { supabase } from '../lib/supabase'
import { contarVagasPorStatus } from './adminVagasService'
import { contarFreelasPorStatus } from './adminFreelasService'

// Reutiliza as contagens de status já existentes.
export {
  contarVagasPorStatus,
  contarFreelasPorStatus,
}

// Conta o total real de perfis por meio da função segura do banco.
// A função public.contar_usuarios_admin() só pode ser executada
// por uma usuária autenticada com role = 'admin'.
export async function contarUsuarias() {
  const { data, error } = await supabase.rpc(
    'contar_usuarios_admin',
  )

  if (error) {
    return {
      total: 0,
      error,
    }
  }

  return {
    total: Number(data) || 0,
    error: null,
  }
}

// Conta serviços concluídos em public.freelas_realizados.
export async function contarServicosConcluidos() {
  const { count, error } = await supabase
    .from('freelas_realizados')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('status', 'concluido')

  if (error) {
    return {
      total: 0,
      error,
    }
  }

  return {
    total: count || 0,
    error: null,
  }
}

// Conta avaliações registradas.
export async function contarAvaliacoes() {
  const { count, error } = await supabase
    .from('avaliacoes_freelas')
    .select('id', {
      count: 'exact',
      head: true,
    })

  if (error) {
    return {
      total: 0,
      error,
    }
  }

  return {
    total: count || 0,
    error: null,
  }
}

/**
 * Assina em tempo real as tabelas que afetam o dashboard.
 * Retorna uma função que remove todos os canais ao desmontar a página.
 */
export function assinarDashboardRealtime(
  callback,
) {
  if (typeof callback !== 'function') {
    return () => {}
  }

  const tabelas = [
    'vagas',
    'freelas',
    'freelas_realizados',
    'avaliacoes_freelas',
    'profiles',
  ]

  const canais = tabelas.map((tabela) =>
    supabase
      .channel(
        `admin-dashboard-${tabela}`,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tabela,
        },
        () => callback(tabela),
      )
      .subscribe(),
  )

  return () => {
    canais.forEach((canal) => {
      supabase.removeChannel(canal)
    })
  }
}