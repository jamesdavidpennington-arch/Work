// SVG recreation of the LISSA pentafoil logo.
// mix-blend-mode: multiply creates the over/under knot effect on light backgrounds.

export function LissaLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g style={{ mixBlendMode: 'multiply' }}>
        <ellipse cx="28" cy="13" rx="8.5" ry="15.5" fill="#F0728E" transform="rotate(0 28 28)" />
        <ellipse cx="28" cy="13" rx="8.5" ry="15.5" fill="#9060D5" transform="rotate(72 28 28)" />
        <ellipse cx="28" cy="13" rx="8.5" ry="15.5" fill="#5B8FE8" transform="rotate(144 28 28)" />
        <ellipse cx="28" cy="13" rx="8.5" ry="15.5" fill="#F0728E" transform="rotate(216 28 28)" />
        <ellipse cx="28" cy="13" rx="8.5" ry="15.5" fill="#9060D5" transform="rotate(288 28 28)" />
      </g>
      <circle cx="43" cy="13" r="4" fill="#E03535" />
    </svg>
  )
}

// Drop-in replacement for lucide-react icons (accepts size prop)
export function LissaIcon({ size = 16 }) {
  return <LissaLogo size={size} />
}
