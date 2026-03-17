import { useEffect, useState } from "react";

export interface Offer {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
}

const COLOR_STYLES: Record<string, { card: string; badge: string }> = {
  saffron: {
    card: "bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200 shadow-orange-100",
    badge: "bg-orange-500 text-white",
  },
  green: {
    card: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100",
    badge: "bg-green-600 text-white",
  },
  red: {
    card: "bg-gradient-to-br from-rose-50 to-red-50 border-red-200 shadow-red-100",
    badge: "bg-red-500 text-white",
  },
  blue: {
    card: "bg-gradient-to-br from-sky-50 to-blue-50 border-blue-200 shadow-blue-100",
    badge: "bg-blue-600 text-white",
  },
};

export function OffersBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tg_offers");
      if (raw) {
        const parsed = JSON.parse(raw) as Offer[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOffers(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  if (offers.length === 0) return null;

  // Duplicate for seamless loop
  const displayOffers = [...offers, ...offers];

  return (
    <div className="offers-banner-wrap relative overflow-hidden border-y border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-3">
      {/* Decorative sparkle dots */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-1 left-[10%] text-amber-300 text-xs select-none">
          ✦
        </span>
        <span className="absolute bottom-1 left-[30%] text-orange-300 text-xs select-none">
          ✦
        </span>
        <span className="absolute top-1 left-[60%] text-amber-300 text-xs select-none">
          ✦
        </span>
        <span className="absolute bottom-1 left-[80%] text-orange-300 text-xs select-none">
          ✦
        </span>
      </div>

      <div
        className="offers-marquee flex gap-4"
        style={{
          animation: `offerScroll ${Math.max(12, offers.length * 8)}s linear infinite`,
        }}
      >
        {displayOffers.map((offer, i) => {
          const styles = COLOR_STYLES[offer.color] ?? COLOR_STYLES.saffron;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: duplicate items for marquee loop
              key={`${offer.id}-${i}`}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm ${styles.card}`}
              style={{ minWidth: "220px" }}
            >
              <span
                className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full shrink-0 ${styles.badge}`}
              >
                {offer.badge || "OFFER"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800 leading-tight truncate">
                  {offer.title}
                </p>
                {offer.description && (
                  <p className="text-xs text-stone-500 leading-tight truncate mt-0.5">
                    {offer.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes offerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .offers-marquee {
          will-change: transform;
        }
        .offers-banner-wrap:hover .offers-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
