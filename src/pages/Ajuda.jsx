import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'
import { ChevronRight, TrashIcon } from '../components/Icons'
import ajudaImg from '../assets/ajuda.png'

const faq = [
  {
    q: 'Como funciona o TrajetEla?',
    a: 'O TrajetEla conecta você a vagas, cursos e oportunidades de renda rápida, montando uma jornada personalizada para o seu objetivo.',
  },
  {
    q: 'Como encontro oportunidades?',
    a: 'Na aba Vagas e em Renda Rápida você encontra oportunidades recomendadas de acordo com a sua área de interesse e localização.',
  },
  {
    q: 'Como funciona o  TrajetEla Match?',
    a: 'O Match cruza o seu perfil com as vagas disponíveis e mostra a porcentagem de compatibilidade de cada oportunidade.',
  },
  {
    q: 'Como faço para participar das mentorias?',
    a: 'As mentorias ficam disponíveis na aba Mais. Basta escolher uma trilha e reservar o horário desejado.',
  },
  {
    q: 'É seguro usar meus dados no app?',
    a: 'Sim. Seus dados são usados apenas para melhorar a sua experiência no TrajetEla e não são compartilhados sem o seu consentimento.',
  },
]

export default function Ajuda() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Ajuda" />

      <div className="flex justify-center pt-6">
        <img src={ajudaImg} alt="" className="h-44 object-contain" />
      </div>

      <div className="px-6 pt-6">
        <h2 className="text-lg font-bold text-[#291662]">Perguntas frequentes</h2>

        <div className="mt-4 space-y-3">
          {faq.map((item, i) => (
            <div key={item.q} className="rounded-xl border border-[#8F55E9]/30 bg-white/70">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-[14px] font-medium text-[#291662]">{item.q}</span>
                <ChevronRight
                  className={`h-5 w-5 flex-none text-[#291662] transition-transform ${open === i ? 'rotate-90' : ''}`}
                />
              </button>
              {open === i && (
                <p className="px-4 pb-4 text-[13px] leading-relaxed text-[#291662]/80">{item.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* Excluir conta */}
        <button
          onClick={() => navigate('/excluir-conta')}
          className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-[#E89BB0] bg-[#FBE7EC] p-4 text-left"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white text-[#D6479B]">
            <TrashIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-bold text-[#291662]">Excluir conta</span>
            <span className="block text-[13px] text-[#291662]/75">
              Deseja excluir sua conta? Essa ação não pode ser desfeita.
            </span>
          </span>
        </button>
      </div>
    </PageContainer>
  )
}
