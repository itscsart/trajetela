import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import Modal from '../components/Modal'
import { ChevronRight } from '../components/Icons'

const programas = [
  {
    id: 'trajetrans',
    nome: 'TrajeTrans na Luta',
    descCurta: 'Programa de apoio, capacitação e conexão profissional para mulheres trans.',
    descCompleta:
      'Programa de apoio, capacitação e conexão profissional para mulheres trans, com acolhimento, desenvolvimento de carreira e ligação com empresas inclusivas.',
    beneficios: [
      'Mentorias profissionais',
      'Capacitação para renda',
      'Apoio na construção de currículo',
      'Conexão com empresas inclusivas',
      'Rede de apoio',
    ],
    cardClass: 'bg-gradient-to-br from-[#BFE6F7] via-[#F7D6E2] to-white',
    cores: ['#5BCEFA', '#F5A9B8', '#FFFFFF'],
  },
  {
    id: 'trajepretas',
    nome: 'TrajePretas na Luta',
    descCurta:
      'Programa de fortalecimento profissional para mulheres negras, com foco em oportunidades afirmativas, liderança e autonomia financeira.',
    descCompleta:
      'Programa de fortalecimento profissional para mulheres negras, com foco em oportunidades afirmativas, liderança e autonomia financeira, conectando talentos a espaços de decisão.',
    beneficios: [
      'Mentorias com lideranças negras',
      'Oportunidades afirmativas',
      'Capacitação profissional',
      'Networking',
      'Fortalecimento de carreira',
    ],
    cardClass: 'bg-gradient-to-br from-[#FBEDED] to-[#EAF6EC]',
    cores: ['#E23B3B', '#1A1A1A', '#1E8A4C'],
  },
  {
    id: 'trajeperiferia',
    nome: 'TrajePeriferia',
    descCurta:
      'Programa de apoio para mulheres periféricas acessarem capacitação, renda, networking e oportunidades de crescimento profissional.',
    descCompleta:
      'Programa de apoio para mulheres periféricas acessarem capacitação, renda, networking e oportunidades de crescimento profissional, valorizando o território e a mobilidade.',
    beneficios: [
      'Cursos acessíveis',
      'Renda rápida',
      'Apoio para primeiro emprego',
      'Conexões locais',
      'Desenvolvimento profissional',
    ],
    cardClass: 'bg-gradient-to-br from-[#F6D2B3] via-[#CFEBC6] to-[#DDCBF4]',
    cores: ['#C8642B', '#3FA34D', '#8F55E9'],
  },
]

export default function Potencia() {
  const [programaSel, setProgramaSel] = useState(null)
  const [participou, setParticipou] = useState(false)
  const [salvos, setSalvos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trajetela_potencia_salvos') || '[]')
    } catch {
      return []
    }
  })

  const abrir = (p) => {
    setParticipou(false)
    setProgramaSel(p)
  }

  const salvarDepois = (id) => {
    setSalvos((prev) => {
      const novo = prev.includes(id) ? prev : [...prev, id]
      localStorage.setItem('trajetela_potencia_salvos', JSON.stringify(novo))
      return novo
    })
  }

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="TrajetEla Potência" />

      <div className="mx-4 mb-6 mt-9 rounded-[28px] border border-[#8F55E9]/25 bg-white px-5 pb-8 pt-6 shadow-sm">
        <p className="text-[14px] leading-relaxed text-[#291662]/85">
          Programa voltado ao fortalecimento profissional de mulheres negras, periféricas e trans.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#291662]/85">
          A iniciativa oferecerá mentorias, capacitações, networking, oportunidades afirmativas e
          conexões estratégicas com empresas e lideranças, ampliando o acesso a espaços
          historicamente menos acessíveis a esses grupos.
        </p>

        <div className="mt-6 space-y-4">
          {programas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => abrir(p)}
              className={`w-full rounded-2xl border border-[#8F55E9]/30 p-4 text-left shadow-sm transition-transform active:scale-[0.99] ${p.cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex gap-1">
                    {p.cores.map((cor, i) => (
                      <span
                        key={i}
                        className="h-2 w-6 rounded-full ring-1 ring-black/5"
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                  <h3 className="text-[17px] font-extrabold text-[#291662]">{p.nome}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-[#291662]/80">{p.descCurta}</p>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 flex-none text-[#291662]/40" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal do programa */}
      <Modal open={!!programaSel} onClose={() => setProgramaSel(null)} title={programaSel?.nome}>
        {programaSel && (
          <>
            <div className="mb-3 flex gap-1.5">
              {programaSel.cores.map((cor, i) => (
                <span key={i} className="h-2 w-8 rounded-full ring-1 ring-black/5" style={{ backgroundColor: cor }} />
              ))}
            </div>

            <p className="text-[14px] leading-relaxed text-[#291662]/80">{programaSel.descCompleta}</p>

            <p className="mt-5 text-[14px] font-bold text-[#291662]">Benefícios</p>
            <ul className="mt-2 space-y-2">
              {programaSel.beneficios.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[14px] text-[#291662]/85">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-[#8F55E9]" />
                  {b}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setParticipou(true)}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-3.5 text-[15px] font-semibold text-white"
            >
              Quero participar
            </button>
            {participou && (
              <p className="mt-2 text-center text-[14px] font-medium text-[#2EA043]">
                Interesse registrado com sucesso.
              </p>
            )}

            <button
              type="button"
              onClick={() => salvarDepois(programaSel.id)}
              disabled={salvos.includes(programaSel.id)}
              className={`mt-3 w-full rounded-full border py-3.5 text-[15px] font-semibold transition-colors ${
                salvos.includes(programaSel.id)
                  ? 'border-[#2EA043] text-[#2EA043]'
                  : 'border-[#8F55E9] text-[#291662] active:bg-[#F1EAFD]'
              }`}
            >
              {salvos.includes(programaSel.id) ? '✓ Salvo para depois' : 'Salvar para depois'}
            </button>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
