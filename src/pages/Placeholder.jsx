import PageContainer from '../components/PageContainer'
import HeaderBack from '../components/HeaderBack'

export default function Placeholder({ title = 'Em breve' }) {
  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title={title} />

      <div className="flex min-h-[55vh] flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 text-5xl">🚧</div>
        <p className="text-lg font-bold text-[#291662]">Em desenvolvimento</p>
        <p className="mt-1 text-[14px] text-[#291662]/70">
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </PageContainer>
  )
}
