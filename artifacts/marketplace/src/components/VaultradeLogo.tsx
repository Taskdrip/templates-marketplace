interface Props {
  size?: number;
  className?: string;
}

export function VaultradeLogomark({ size = 32, className = "" }: Props) {
  const id = `pi-grad-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7B35D5" />
          <stop offset="100%" stopColor="#4A1FA8" />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={`url(#${id})`} />
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
      {/* Pi symbol π */}
      <line x1="10" y1="14" x2="30" y2="14" stroke={`url(#${id}-g)`} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M14 14 L14 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.95" />
      <path d="M26 14 C26 14 28 18 27 23 C26 27 23 29 23 29" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.95" fill="none" />
    </svg>
  );
}

export function VaultradeWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-300 to-violet-400 ${className}`}>
      PiMarket
    </span>
  );
}
