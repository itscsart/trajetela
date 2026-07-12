import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Splash from './pages/Splash'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Home from './pages/Home'
import Cursos from './pages/Cursos'
import Vagas from './pages/Vagas'
import VagaDetalhe from './pages/VagaDetalhe'
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
import { isAutenticada } from './utils/auth'

// Protege páginas internas: exige usuária logada e verificada.
function Protegida({ children }) {
  return isAutenticada() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#ECE6FA]">
        <Routes>
          {/* Rotas livres */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas protegidas */}
          <Route path="/home" element={<Protegida><Home /></Protegida>} />
          <Route path="/cursos" element={<Protegida><Cursos /></Protegida>} />
          <Route path="/vagas" element={<Protegida><Vagas /></Protegida>} />
          <Route path="/vagas/:id" element={<Protegida><VagaDetalhe /></Protegida>} />
          <Route path="/renda-rapida" element={<Protegida><RendaRapida /></Protegida>} />
          <Route path="/freelas" element={<Protegida><Freelas /></Protegida>} />
          <Route path="/ebook" element={<Protegida><Ebook /></Protegida>} />
          <Route path="/mais" element={<Protegida><Mais /></Protegida>} />
          <Route path="/salvos" element={<Protegida><Salvos /></Protegida>} />
          <Route path="/perfil" element={<Protegida><Perfil /></Protegida>} />
          <Route path="/ajuda" element={<Protegida><Ajuda /></Protegida>} />
          <Route path="/area-interesse" element={<Protegida><AreaInteresse /></Protegida>} />
          <Route path="/informacoes-pessoais" element={<Protegida><InformacoesPessoais /></Protegida>} />
          <Route path="/excluir-conta" element={<Protegida><ExcluirConta /></Protegida>} />
          <Route path="/match" element={<Protegida><Match /></Protegida>} />
          <Route path="/potencia" element={<Protegida><Potencia /></Protegida>} />
          <Route path="/autoridade-40-minutos" element={<Protegida><Autoridade40 /></Protegida>} />
          <Route path="/portas-abertas" element={<Protegida><PortasAbertas /></Protegida>} />

          {/* Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
