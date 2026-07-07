import { useQuery } from "@tanstack/react-query";

interface PiPriceData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume24h: number;
}

async function fetchPiPrice(): Promise<PiPriceData> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true",
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error("CoinGecko error");
  const data = await res.json();
  const pi = data["pi-network"] ?? {};
  return {
    price: pi.usd ?? 0,
    change24h: pi.usd_24h_change ?? 0,
    high24h: 0,
    low24h: 0,
    marketCap: pi.usd_market_cap ?? 0,
    volume24h: pi.usd_24h_vol ?? 0,
  };
}

export function usePiPrice() {
  const { data, isLoading } = useQuery<PiPriceData>({
    queryKey: ["pi-price"],
    queryFn: fetchPiPrice,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    retry: 2,
    retryDelay: 3000,
  });

  const price = data?.price ?? null;

  return {
    price,
    change24h: data?.change24h ?? 0,
    marketCap: data?.marketCap ?? 0,
    volume24h: data?.volume24h ?? 0,
    isLoading,
    /** Convert π amount to USD string, e.g. "~$12.34" */
    toUsd: (piAmount: number): string | null => {
      if (!price) return null;
      const usd = piAmount * price;
      if (usd >= 1000) return `~$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
      return `~$${usd.toFixed(2)}`;
    },
    /** Raw USD number */
    toUsdNum: (piAmount: number): number | null => {
      if (!price) return null;
      return piAmount * price;
    },
  };
}
