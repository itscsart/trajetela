// Inline SVG representation of the TrajetEla logo figure (woman silhouette)
export default function Logo() {
  return (
    <div className="flex items-center gap-3 justify-center">
      {/* Woman silhouette icon */}
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Head with decorative hair / planet ring */}
        <circle cx="26" cy="16" r="10" fill="#291662" />
        {/* Planet ring around head */}
        <ellipse
          cx="26"
          cy="16"
          rx="17"
          ry="5"
          stroke="#8F55E9"
          strokeWidth="2"
          fill="none"
          transform="rotate(-20 26 16)"
        />
        {/* Hair detail */}
        <path
          d="M18 14 Q14 8 20 6 Q26 2 32 6 Q38 10 34 18"
          fill="#291662"
        />
        {/* Neck + shoulders */}
        <path
          d="M22 25 Q20 30 16 35 L36 35 Q32 30 30 25 Z"
          fill="#291662"
        />
      </svg>

      <span
        className="text-3xl font-bold"
        style={{ color: '#291662' }}
      >
        TrajetEla
      </span>
    </div>
  )
}
