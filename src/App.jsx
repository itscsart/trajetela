import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { supabase } from './lib/supabase'

import Splash from './pages/Splash'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Home from './pages/Home'
import Cursos from './pages/Cursos'
import Vagas from './pages/Vagas'
import RendaRapida from './pages/RendaRapida'
import Freelas from './pages/Freelas'
import Ebook from './pages/Ebook'
import Mais from './pages/Mais'
import Salvos from './pages/Salvos'
import Potencia from './pages/Potencia'
import Autoridade40 from './pages/Autoridade40'
import Match from './pages/Match'
import PortasAbertas from './pages/PortasAbertas'
import Perfil from './pages/Perfil'
import Ajuda from './pages/Ajuda'
import AreaInteresse from './pages/AreaInteresse'
import InformacoesPessoais from './pages/InformacoesPessoais'
import ExcluirConta from './pages/ExcluirConta'
import RedefinirSenha from './pages/RedefinirSenha'

function Protegida({ children, session, carregando }) {
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ECE6FA]">
        <p className="text-[15px] font-semibold text-[#291662]">
          Carregando...
        </p>
      </div>
    )
  }

  return session ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [session, setSession] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function carregarSessao() {
      const {
        data: { session: sessaoAtual },
      } = await supabase.auth.getSession()

      if (ativo) {
        setSession(sessaoAtual)
        setCarregando(false)
      }
    }

    carregarSessao()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      if (ativo) {
        setSession(novaSessao)
        setCarregando(false)
      }
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#ECE6FA]">
        <Routes>
          {/* Rotas livres */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          {/* Rotas protegidas */}
          <Route
            path="/home"
            element={
              <Protegida session={session} carregando={carregando}>
                <Home />
              </Protegida>
            }
          />

          <Route
            path="/cursos"
            element={
              <Protegida session={session} carregando={carregando}>
                <Cursos />
              </Protegida>
            }
          />

          <Route
            path="/vagas"
            element={
              <Protegida session={session} carregando={carregando}>
                <Vagas />
              </Protegida>
            }
          />

          <Route
            path="/renda-rapida"
            element={
              <Protegida session={session} carregando={carregando}>
                <RendaRapida />
              </Protegida>
            }
          />

          <Route
            path="/freelas"
            element={
              <Protegida session={session} carregando={carregando}>
                <Freelas />
              </Protegida>
            }
          />

          <Route
            path="/ebook"
            element={
              <Protegida session={session} carregando={carregando}>
                <Ebook />
              </Protegida>
            }
          />

          <Route
            path="/mais"
            element={
              <Protegida session={session} carregando={carregando}>
                <Mais />
              </Protegida>
            }
          />

          <Route
            path="/salvos"
            element={
              <Protegida session={session} carregando={carregando}>
                <Salvos />
              </Protegida>
            }
          />

          <Route
            path="/perfil"
            element={
              <Protegida session={session} carregando={carregando}>
                <Perfil />
              </Protegida>
            }
          />

          <Route
            path="/ajuda"
            element={
              <Protegida session={session} carregando={carregando}>
                <Ajuda />
              </Protegida>
            }
          />

          <Route
            path="/area-interesse"
            element={
              <Protegida session={session} carregando={carregando}>
                <AreaInteresse />
              </Protegida>
            }
          />

          <Route
            path="/informacoes-pessoais"
            element={
              <Protegida session={session} carregando={carregando}>
                <InformacoesPessoais />
              </Protegida>
            }
          />

          <Route
            path="/excluir-conta"
            element={
              <Protegida session={session} carregando={carregando}>
                <ExcluirConta />
              </Protegida>
            }
          />

          <Route
            path="/match"
            element={
              <Protegida session={session} carregando={carregando}>
                <Match />
              </Protegida>
            }
          />

          <Route
            path="/potencia"
            element={
              <Protegida session={session} carregando={carregando}>
                <Potencia />
              </Protegida>
            }
          />

          <Route
            path="/autoridade-40-minutos"
            element={
              <Protegida session={session} carregando={carregando}>
                <Autoridade40 />
              </Protegida>
            }
          />

          <Route
            path="/portas-abertas"
            element={
              <Protegida session={session} carregando={carregando}>
                <PortasAbertas />
              </Protegida>
            }
          />

          {/* Rota inexistente */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}