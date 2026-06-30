import { BrowserRouter, Routes, Route } from 'react-router-dom'

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
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#ECE6FA]">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/renda-rapida" element={<RendaRapida />} />
          <Route path="/freelas" element={<Freelas />} />
          <Route path="/ebook" element={<Ebook />} />
          <Route path="/mais" element={<Mais />} />
          <Route path="/salvos" element={<Salvos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/ajuda" element={<Ajuda />} />
          <Route path="/area-interesse" element={<AreaInteresse />} />
          <Route path="/informacoes-pessoais" element={<InformacoesPessoais />} />
          <Route path="/excluir-conta" element={<ExcluirConta />} />

          {/* Placeholders */}
          <Route path="/match" element={<Match />} />
          <Route path="/potencia" element={<Potencia />} />
          <Route path="/autoridade-40-minutos" element={<Autoridade40 />} />
          <Route path="/portas-abertas" element={<PortasAbertas />} />

          {/* Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
