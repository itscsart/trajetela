import BottomNavigation from './BottomNavigation'

/**
 * Container padrão das telas (mobile-first).
 * - Frame externo: largura total, fundo lilás #EFE7FB e overflow-x travado
 *   para nada ser cortado na lateral.
 * - Coluna interna: centralizada, max-width 430px, min-h-screen.
 * - withNav: mostra o menu inferior fixo e reserva padding-bottom grande
 *   para o conteúdo nunca ficar escondido atrás do menu.
 * - className: classes extras de fundo (gradientes das telas).
 */
export default function PageContainer({ children, withNav = true, className = '' }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#EFE7FB]">
      <div
        className={`relative mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden ${className}`}
      >
        <div className={withNav ? 'pb-36' : ''}>{children}</div>
        {withNav && <BottomNavigation />}
      </div>
    </div>
  )
}
