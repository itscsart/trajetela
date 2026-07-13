/**
 * Área "Tenho interesse" reutilizável para vagas e freelas.
 * Usa whatsapp_contato, email_contato e contato_preferido.
 * - Ambos disponíveis: mostra os dois botões.
 * - Apenas um: mostra só o botão correspondente.
 * - Nenhum: mostra aviso.
 *
 * Props:
 * - whatsapp, email, preferido (string 'whatsapp' | 'email' | 'ambos')
 * - mensagem: texto pronto do WhatsApp e do corpo do e-mail
 * - assuntoEmail: assunto do e-mail
 * - rotuloWhatsapp / rotuloEmail: textos dos botões
 */

function normalizarWhatsappBrasil(valor) {
  let numero = String(valor || '').replace(/\D/g, '')

  if (!numero) return ''

  if (numero.startsWith('00')) {
    numero = numero.slice(2)
  }

  if (numero.startsWith('55') && numero.length >= 12) {
    return numero
  }

  if (numero.length === 10 || numero.length === 11) {
    return `55${numero}`
  }

  return numero
}

export default function ContatoOportunidade({
  whatsapp,
  email,
  preferido,
  mensagem,
  assuntoEmail,
  rotuloWhatsapp = 'Enviar pelo WhatsApp',
  rotuloEmail = 'Enviar por e-mail',
}) {
  const whats = normalizarWhatsappBrasil(whatsapp)
  const mail = String(email || '').trim()
  const pref = String(preferido || '').toLowerCase()

  const temWhats = Boolean(whats)
  const temEmail = Boolean(mail)

  const abrirWhatsApp = () => {
    if (!temWhats) return

    const texto = encodeURIComponent(mensagem || '')

    window.open(
      `https://wa.me/${whats}?text=${texto}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const abrirEmail = () => {
    if (!temEmail) return

    const assunto = encodeURIComponent(assuntoEmail || '')
    const corpo = encodeURIComponent(mensagem || '')

    window.location.href =
      `mailto:${mail}?subject=${assunto}&body=${corpo}`
  }

  if (!temWhats && !temEmail) {
    return (
      <div className="mt-8">
        <h3 className="mb-2 text-[16px] font-bold text-[#291662]">
          Candidatar-se
        </h3>

        <p className="rounded-2xl border border-dashed border-[#8F55E9]/40 bg-[#F6F1FE] px-4 py-4 text-center text-[14px] text-[#291662]/70">
          Os canais para candidatura ainda não foram disponibilizados pela empresa.
        </p>
      </div>
    )
  }

  const mostrarWhats =
    temWhats &&
    (
      pref === 'whatsapp' ||
      pref === 'ambos' ||
      !pref ||
      !temEmail
    )

  const mostrarEmail =
    temEmail &&
    (
      pref === 'email' ||
      pref === 'ambos' ||
      !pref ||
      !temWhats
    )

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-[16px] font-bold text-[#291662]">
        Candidatar-se
      </h3>

      <div className="space-y-3">
        {mostrarWhats && (
          <button
            type="button"
            onClick={abrirWhatsApp}
            className="block w-full rounded-full bg-gradient-to-r from-[#E060A6] to-[#B14AD6] py-3.5 text-center text-[15px] font-semibold text-white"
          >
            {rotuloWhatsapp}
          </button>
        )}

        {mostrarEmail && (
          <button
            type="button"
            onClick={abrirEmail}
            className="block w-full rounded-full border border-[#8F55E9] py-3.5 text-center text-[15px] font-semibold text-[#291662] active:bg-[#F1EAFD]"
          >
            {rotuloEmail}
          </button>
        )}
      </div>
    </div>
  )
}