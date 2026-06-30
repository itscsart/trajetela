import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import { SearchIcon } from '../components/Icons'
import { getSalvos, addSalvo } from '../utils/salvos'

import capaCnpj from '../assets/ebook-cnpj.png'
import capaCurriculo from '../assets/ebook-curriculo.png'
import capaPrimeiraProfissao from '../assets/ebook-primeira-profissao.png'
import capaRendaRapida from '../assets/ebook-renda-rapida.png'
import capaFinancas from '../assets/ebook-financas.png'
import capaInstagram from '../assets/ebook-instagram.png'

const filtros = ['Todos', 'Finanças', 'Tecnologia', 'Concurso', 'Primeiro Emprego']

const ebooks = [
  { id: 'cnpj', titulo: 'Seu Primeiro CNPJ Sem Complicação', img: capaCnpj },
  { id: 'curriculo', titulo: 'Currículo que Chama Atenção', img: capaCurriculo },
  { id: 'primeira-profissao', titulo: 'Por Onde Começar? Guia para Escolher sua Primeira Profissão', img: capaPrimeiraProfissao },
  { id: 'renda-rapida', titulo: 'Renda Rápida: 15 Formas de Ganhar Dinheiro', img: capaRendaRapida },
  { id: 'financas', titulo: 'Finanças Sem Complicação', img: capaFinancas },
  { id: 'instagram', titulo: 'Instagram para Negócios', img: capaInstagram },
]

export default function Ebook() {
  const [active, setActive] = useState('Todos')
  const [ebookSel, setEbookSel] = useState(null)
  const [salvos, setSalvos] = useState(() => getSalvos().map((s) => s.id))

  const salvarDepois = (e) => {
    const sid = `ebook-${e.id}`
    addSalvo({
      id: sid,
      tipo: 'ebook',
      titulo: e.titulo,
      subtitulo: '',
      valor: '',
      origem: 'E-book',
    })
    setSalvos((prev) => (prev.includes(sid) ? prev : [...prev, sid]))
  }

  return (
    <PageContainer className="bg-[#EFE7FB]">
      <div className="bg-gradient-to-b from-[#D7CAF6] to-[#C9B6F1] pb-8">
        <HeaderBack title="E-book" />
      </div>

      <div className="-mt-4 mb-6 rounded-t-[28px] rounded-b-[32px] border-t border-[#8F55E9]/30 bg-white px-5 pb-8 pt-6">
        {/* Busca */}
        <div className="flex items-center gap-2 rounded-full border border-[#291662]/15 bg-white px-4 py-3 shadow-sm">
          <SearchIcon className="h-5 w-5 text-[#291662]/60" />
          <input
            placeholder="Buscar cargo, empresa ou área..."
            className="w-full bg-transparent text-[14px] text-[#291662] outline-none placeholder:text-[#291662]/45"
          />
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                active === f
                  ? 'border-[#8F55E9] bg-[#F1EAFD] text-[#8F55E9]'
                  : 'border-[#291662]/20 text-[#291662]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid de e-books (cards mais baixos, com respiro entre capa e título) */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          {ebooks.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEbookSel(e)}
              className="flex flex-col rounded-2xl bg-[#E7D9F8] p-2.5 text-left shadow-sm transition-transform active:scale-95"
            >
              <div className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl">
                <img src={e.img} alt={e.titulo} className="h-full w-full object-contain" />
              </div>
              <p className="mt-3 text-center text-[12px] font-semibold leading-tight text-[#291662]">{e.titulo}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Modal do e-book */}
      <Modal open={!!ebookSel} onClose={() => setEbookSel(null)} title={ebookSel?.titulo}>
        {ebookSel && (
          <>
            <div className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl">
              <img src={ebookSel.img} alt={ebookSel.titulo} className="h-full w-full object-contain" />
            </div>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => console.log('Abrir e-book:', ebookSel.id)}
                className="w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
              >
                Abrir e-book
              </button>
              <button
                type="button"
                onClick={() => salvarDepois(ebookSel)}
                disabled={salvos.includes(`ebook-${ebookSel.id}`)}
                className={`w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
                  salvos.includes(`ebook-${ebookSel.id}`)
                    ? 'border-[#2EA043] text-[#2EA043]'
                    : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
                }`}
              >
                {salvos.includes(`ebook-${ebookSel.id}`) ? '✓ Salvo para depois' : 'Salvar para depois'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
