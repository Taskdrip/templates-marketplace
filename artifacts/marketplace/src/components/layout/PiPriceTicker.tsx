import { usePiPrice } from "@/hooks/usePiPrice";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function PiIcon({ className }: { className?: string }) {
  return (
    <span className={`font-black ${className ?? ""}`} style={{ fontFamily: "serif" }}>
      π
    </span>
  );
}

interface TickerItemData {
  label: string;
  value: string;
  highlight?: boolean;
  colorClass?: string;
}

function TickerItem({ label, value, highlight, colorClass }: TickerItemData) {
  return (
    <span className="inline-flex items-center gap-1.5 px-5">
      {label && <span className="text-muted-foreground/50 text-[10px] uppercase tracking-wider">{label}</span>}
      <span className={`text-[11px] font-semibold ${colorClass ?? (highlight ? "text-yellow-400" : "text-foreground/80")}`}>
        {value}
      </span>
    </span>
  );
}

function Dot() {
  return <span className="text-muted-foreground/20 text-[10px] select-none">·····</span>;
}

export default function PiPriceTicker() {
  const { price, change24h, volume24h, isLoading } = usePiPrice();

  if (isLoading || !price) {
    return (
      <div className="h-7 bg-black/40 border-b border-white/5 flex items-center px-4 overflow-hidden">
        <div className="flex gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 bg-muted/40 rounded w-20" />
          ))}
        </div>
      </div>
    );
  }

  const isPositive = change24h > 0;
  const isNeutral = Math.abs(change24h) < 0.01;
  const ChangeIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const changeColor = isNeutral ? "text-muted-foreground" : isPositive ? "text-emerald-400" : "text-red-400";

  const volFormatted = volume24h >= 1_000_000
    ? `$${(volume24h / 1_000_000).toFixed(1)}M`
    : volume24h >= 1_000
      ? `$${(volume24h / 1_000).toFixed(0)}K`
      : `$${volume24h.toFixed(0)}`;

  const segmentData: Array<{ id: string; label: string; value: string; colorClass?: string; highlight?: boolean; isDot?: boolean }> = [
    { id: "brand", label: "", value: "🔴 Pi Network", highlight: true, colorClass: "text-yellow-400 font-bold" },
    { id: "price", label: "Price", value: `$${price.toFixed(4)}`, colorClass: "text-white font-bold" },
    { id: "change", label: "24h", value: `${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%`, colorClass: changeColor },
    { id: "vol", label: "Volume 24h", value: volFormatted },
    { id: "rate", label: "1π =", value: `$${price.toFixed(4)} USD`, colorClass: "text-primary" },
    { id: "mkt", label: "Market", value: "Pi Mainnet · Live" },
    { id: "dot", label: "", value: "·····", isDot: true },
  ];

  const repeatedSegments = [
    ...segmentData.map((s, i) => ({ ...s, uid: `a-${i}` })),
    ...segmentData.map((s, i) => ({ ...s, uid: `b-${i}` })),
    ...segmentData.map((s, i) => ({ ...s, uid: `c-${i}` })),
  ];

  return (
    <div className="h-7 bg-black/50 border-b border-white/5 backdrop-blur-md overflow-hidden flex items-center relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/70 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/70 to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center whitespace-nowrap"
        style={{ animation: "pi-ticker-scroll 55s linear infinite", willChange: "transform" }}
      >
        {repeatedSegments.map((seg) =>
          seg.isDot ? (
            <span key={seg.uid} className="text-muted-foreground/20 text-[10px] px-3">·····</span>
          ) : (
            <TickerItem
              key={seg.uid}
              label={seg.label}
              value={seg.value}
              highlight={seg.highlight}
              colorClass={seg.colorClass}
            />
          )
        )}
      </div>

      <style>{`
        @keyframes pi-ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
