import PageContainer from './PageContainer'
import HeaderBack from './HeaderBack'
import SecaoDetalhes from './SecaoDetalhes'
import LocalizacaoOportunidade from './LocalizacaoOportunidade'
import ContatoOportunidade from './ContatoOportunidade'
import { PinIcon } from './Icons'

/**
 * Layout reutilizável de detalhes de oportunidade (vagas e freelas).
 * Recebe os dados já normalizados por props, então não conhece regras de negócio
 * específicas de cada tipo — apenas exibe o que vier preenchido.
 *
 * Props principais:
 * - titulo, subtitulo (empresa/contratante)
 * - meta: [{ label, valor }]  (chips/linhas de metadados: área, modalidade, etc.)
 * - bairro, zona, distanciaKm
 * - compatLabel, compatValor
 * - salario / valor (texto)
 * - secoes: [{ titulo, conteudo }] (descrição, atividades, requisitos, etc.)
 * - contato: props repassadas para ContatoOportunidade
 * - voltarPara: rota do botão voltar
 */
export default function OportunidadeDetalhes({
  titulo,
  subtitulo,
  local,
  bairro,
  zona,
  distanciaKm,
  compatValor,
  compatLabel,
  valorPrincipal,
  meta = [],
  secoes = [],
  contato,
  voltarPara,
}) {
  const metaPreenchida = meta.filter((m) => m && m.valor)

  return (
    <PageContainer className="bg-gradient-to-b from-[#E4DBF6] to-[#ECE6FA]">
      <HeaderBack title="Detalhes" to={voltarPara} />

      <div className="mx-4 mb-6 mt-4 rounded-[28px] border border-[#8F55E9]/25 bg-white px-5 pb-8 pt-6 shadow-sm">
        <h1 className="text-[20px] font-extrabold leading-tight text-[#291662]">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-[15px] text-[#291662]/80">{subtitulo}</p>}

        {(bairro || zona || (distanciaKm != null) || local) && (
          <p className="mt-2 flex items-center gap-1 text-[14px] text-[#291662]">
            <PinIcon className="h-4 w-4 flex-none text-[#E84C8A]" />
            <LocalizacaoOportunidade bairro={bairro} zona={zona} distanciaKm={distanciaKm} />
            {!bairro && !zona && distanciaKm == null && local ? <span>{local}</span> : null}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F6F1FE] px-4 py-3">
          {valorPrincipal ? (
            <span className="text-lg font-bold text-[#291662]">{valorPrincipal}</span>
          ) : (
            <span />
          )}
          {compatValor != null && (
            <span className="text-right text-[13px] font-medium text-[#2EA043]">
              {compatValor} % {compatLabel ? `· ${compatLabel}` : ''}
            </span>
          )}
        </div>

        {metaPreenchida.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {metaPreenchida.map((m) => (
              <div key={m.label}>
                <p className="text-[12px] font-medium text-[#291662]/55">{m.label}</p>
                <p className="text-[14px] font-semibold text-[#291662]">{m.valor}</p>
              </div>
            ))}
          </div>
        )}

        {secoes.map((s) => (
          <SecaoDetalhes key={s.titulo} titulo={s.titulo}>
            {s.conteudo}
          </SecaoDetalhes>
        ))}

        {contato && <ContatoOportunidade {...contato} />}
      </div>
    </PageContainer>
  )
}
