interface Props {
  size?: number;
  className?: string;
}

export function VaultradeLogomark({ size = 32, className = "" }: Props) {
  const id = `bsk-grad-${size}`;
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C1FD5" />
          <stop offset="100%" stopColor="#3A0E9E" />
        </linearGradient>
        <linearGradient id={`${id}-pi`} x1="4" y1="10" x2="40" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="6" y1="10" x2="26" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0C8FF" />
          <stop offset="100%" stopColor="#B98EFF" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Hexagonal shield base */}
      <path
        d="M22 2L40 11.5V28C40 35.5 22 42 22 42C22 42 4 35.5 4 28V11.5L22 2Z"
        fill={`url(#${id}-bg)`}
      />
      {/* Subtle inner glow ring */}
      <path
        d="M22 5L37.5 13.2V27.5C37.5 33.8 22 39.5 22 39.5C22 39.5 6.5 33.8 6.5 27.5V13.2L22 5Z"
        fill="none"
        stroke="white"
        strokeWidth="0.4"
        strokeOpacity="0.12"
      />

      {/* Letter B */}
      <text
        x="9"
        y="30"
        fontFamily="'Arial Black', sans-serif"
        fontSize="20"
        fontWeight="900"
        fill={`url(#${id}-b)`}
        letterSpacing="-1"
        opacity="0.85"
      >B</text>

      {/* Pi symbol overlay — top-right */}
      <g filter={`url(#${id}-glow)`}>
        <line x1="24" y1="14" x2="38" y2="14" stroke={`url(#${id}-pi)`} strokeWidth="2.4" strokeLinecap="round"/>
        <line x1="27" y1="14" x2="27" y2="30" stroke={`url(#${id}-pi)`} strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M35 14 C35 14 37 19 36 24 C35 28 33 30 33 30"
          stroke={`url(#${id}-pi)`} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

export function VaultradeWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-300 to-violet-400">
        Breedskoolpi
      </span>
    </span>
  );
}
