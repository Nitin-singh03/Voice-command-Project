import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TICKER_MESSAGES = [
  { icon: "mic", text: "Voice-Activated Shopping", highlight: "AI Concierge" },
  { icon: "eco", text: "100% Organic & Heirloom Harvests", highlight: "Farm Direct" },
  { icon: "sunny", text: "Summer Mangoes & Golden Cherries", highlight: "In Season" },
  { icon: "bakery_dining", text: "Fresh Sourdough & Truffle Butter", highlight: "Daily Bake" },
  { icon: "local_shipping", text: "1-Hour Eco-Courier Delivery", highlight: "Express" },
  { icon: "loyalty", text: "Use Code LUMINA20 for 20% Off", highlight: "Special" },
];

export default function BrandLogo({ isCompact = false }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
        setIsFading(false);
      }, 350);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const current = TICKER_MESSAGES[tickerIndex];

  return (
    <Link
      to="/"
      className="group/logo flex items-center gap-3 p-1.5 pr-3.5 rounded-2xl glass-panel border border-white/90 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 relative overflow-hidden bg-white/70"
    >
      {/* 1. Simple Minimalist Luxury Brand Icon */}
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-xs border border-primary/25 bg-gradient-to-br from-primary to-[#381347] flex items-center justify-center group-hover/logo:scale-105 transition-transform duration-300">
        <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Minimalist Serif L */}
          <path d="M12 9 H15.5 V27 H28 V30 H12 Z" fill="#fdf4dc" />
          {/* Subtle minimal diamond mark */}
          <polygon points="26,10.5 28.5,13 26,15.5 23.5,13" fill="#fdf4dc" opacity="0.9" />
        </svg>
      </div>

      {/* 2. Brand Name & Scrolling Text in the Same Box */}
      <div className="flex flex-col justify-center min-w-0">
        {/* Top: LUMINA Title with Gradient Shimmer & Subtitle Badge */}
        <div className="flex items-center gap-2">
          <span className="font-headline text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-text-shimmer leading-none">
            LUMINA
          </span>
          <span className="text-[9px] uppercase font-extrabold tracking-widest bg-gradient-to-r from-primary/15 to-pink-500/15 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 leading-none">
            LUXURY
          </span>
        </div>

        {/* Bottom: Animated Scrolling Text Ticker */}
        {!isCompact && (
          <div className="h-4.5 overflow-hidden relative w-36 sm:w-44 lg:w-52 mt-0.5">
            <div
              className={`flex items-center gap-1 text-[11px] font-medium text-stone-600 transition-all duration-300 transform ${
                isFading ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <span className="material-symbols-outlined text-xs text-primary flex-shrink-0 animate-float-mini">
                {current.icon}
              </span>
              <span className="truncate">
                {current.text}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover/logo:border-primary/30 transition-colors pointer-events-none" />
    </Link>
  );
}
