interface Props {
  size?: number;
  className?: string;
}

export function VaultradeLogomark({ size = 32, className = "" }: Props) {
  const id = `vt-grad-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="40" height="40" rx="10" fill={`url(#${id})`} />
      {/* Subtle hex outline */}
      <polygon
        points="20,4 34,12 34,28 20,36 6,28 6,12"
        fill="none"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />
      {/* Bold V shape */}
      <path
        d="M10 11L17.5 27L20 22L22.5 27L30 11"
        stroke={`url(#${id}-s)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center diamond node */}
      <rect
        x="18"
        y="20"
        width="4"
        height="4"
        rx="1"
        transform="rotate(45 20 22)"
        fill="white"
        fillOpacity="0.9"
      />
      {/* Top endpoint dots */}
      <circle cx="10" cy="11" r="2" fill="white" fillOpacity="0.5" />
      <circle cx="30" cy="11" r="2" fill="white" fillOpacity="0.5" />
    </svg>
  );
}

export function VaultradeWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 ${className}`}>
      Vaultrade
    </span>
  );
}
