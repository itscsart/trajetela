import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import { ChevronRight } from '../components/Icons'
import { getSalvos, removeSalvo } from '../utils/salvos'

const abas = [
  { label: 'Freelas', tipo: 'freela' },
  { label: 'Vagas CLT', tipo: 'vaga_clt' },
  { label: 'Cursos', tipo: 'curso' },
  { label: 'Eventos', tipo: 'evento' },
]

export default function Salvos() {
  const [aba, setAba] = useState('freela')
  const [salvos, setSalvos] = useState(() => getSalvos())
  const [itemSel, setItemSel] = useState(null)

  const remover = (id) => (e) => {
    e.stopPropagation()
    setSalvos(removeSalvo(id))
  }

  const itens = salvos.filter((s) => s.tipo === aba)

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Salvos" />

      <p className="px-6 pt-3 text-center text-[14px] text-[#291662]/80">
        Tudo que você guardou para ver depois
      </p>

      <div className="px-5 pt-5">
        {/* Filtros */}
        <div className="-mx-5 flex flex-nowrap gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {abas.map((a) => (
            <button
              key={a.tipo}
              type="button"
              onClick={() => setAba(a.tipo)}
              className={`flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                aba === a.tipo
                  ? 'border-[#8F55E9] bg-[#8F55E9] text-white'
                  : 'border-[#8F55E9]/40 bg-white/50 text-[#291662]'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="mt-4 space-y-3">
          {itens.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-white/50 px-4 py-8 text-center text-[14px] text-[#291662]/70">
              Nenhum item salvo nesta categoria.
            </p>
          ) : (
            itens.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setItemSel(item)}
                onKeyDown={(e) => e.key === 'Enter' && setItemSel(item)}
                className="cursor-pointer rounded-2xl border border-[#8F55E9]/25 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-bold text-[#291662]">{item.titulo}</h3>
                    {item.subtitulo && <p className="mt-0.5 text-[13px] text-[#291662]/75">{item.subtitulo}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {item.valor && <span className="text-[15px] font-bold text-[#291662]">{item.valor}</span>}
                      {item.origem && <span className="text-[11px] text-[#291662]/55">• {item.origem}</span>}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 flex-none text-[#291662]/35" />
                </div>
                <button
                  type="button"
                  onClick={remover(item.id)}
                  className="mt-3 w-full rounded-full border border-[#E89BB0] py-2.5 text-[13px] font-semibold text-[#D6479B] transition-colors active:bg-[#FBE7EC]"
                >
                  Remover dos salvos
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalhes do item salvo */}
      <Modal open={!!itemSel} onClose={() => setItemSel(null)} title={itemSel?.titulo}>
        {itemSel && (
          <>
            {itemSel.subtitulo && <p className="-mt-2 text-[14px] text-[#291662]/80">{itemSel.subtitulo}</p>}

            <div className="mt-4 space-y-2 text-[14px] text-[#291662]">
              {itemSel.valor && (
                <div className="flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
                  <span className="font-semibold">Valor</span>
                  <span className="font-bold">{itemSel.valor}</span>
                </div>
              )}
              {itemSel.origem && (
                <p className="text-[13px] text-[#291662]/70">Origem: {itemSel.origem}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSalvos(removeSalvo(itemSel.id))
                setItemSel(null)
              }}
              className="mt-6 w-full rounded-full border border-[#E89BB0] py-3.5 text-[15px] font-semibold text-[#D6479B] active:bg-[#FBE7EC]"
            >
              Remover dos salvos
            </button>
            <button
              type="button"
              onClick={() => setItemSel(null)}
              className="mt-3 w-full rounded-full bg-[#8F55E9] py-3.5 text-[15px] font-semibold text-white"
            >
              Fechar
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
