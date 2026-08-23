import { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { RecommendationService, SEASONAL_ITEMS } from "../services/recommendationEngine";
import { products } from "../data/products";

export default function RecommendationPanel({ compact = false }) {
  const { cart, addToCart, showToast } = useCart();
  const [refreshKey, setRefreshKey] = useState(0);

  const cartItemNames = useMemo(() => cart.map((i) => i.name), [cart]);

  const frequentlyTogether = useMemo(() => {
    return RecommendationService.computeFrequentlyBoughtTogether(cartItemNames, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItemNames, refreshKey]);

  const dueForReorder = useMemo(() => {
    return RecommendationService.computeDueForReorder(cartItemNames, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItemNames, refreshKey]);

  const seasonalProducts = useMemo(() => {
    return SEASONAL_ITEMS.map((name) => products.find((p) => p.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean)
      .filter((p) => !cartItemNames.includes(p.name));
  }, [cartItemNames]);

  const handleAdd = (product) => {
    addToCart(product, 1);
    RecommendationService.logEvent(product.name, "add", 1);
    setRefreshKey((k) => k + 1);
  };

  const handleResetHistory = () => {
    RecommendationService.clearEvents();
    setRefreshKey((k) => k + 1);
    showToast("Learning history reset. Fresh insights will form as you shop!", "info");
  };

  return (
    <section className="space-y-4 my-8">
      {/* 1. Frequently Added Together */}
      {cart.length > 0 && (
        <div className="glass-panel p-5 md:p-6 rounded-3xl border border-white/80 ambient-shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
              Frequently Added Together
            </h3>
            <button
              onClick={handleResetHistory}
              className="text-[11px] text-on-surface-variant/70 hover:text-red-500 transition-colors"
            >
              Reset Learning
            </button>
          </div>

          {frequentlyTogether.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {frequentlyTogether.map(({ product, score }) => (
                <button
                  key={product.id}
                  onClick={() => handleAdd(product)}
                  className="glass-button text-xs py-2 px-3.5 rounded-full flex items-center gap-2 hover:border-primary/60 hover:text-primary transition-all group"
                >
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:bg-primary group-hover:text-white">
                    +
                  </span>
                  <span className="font-semibold text-on-surface">{product.name}</span>
                  <span className="text-[11px] text-primary font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-[10px] text-on-surface-variant/70 bg-white/60 px-1.5 py-0.5 rounded-full">
                    ×{score}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant">
              No strong co-occurrence patterns yet for your current basket. As you shop, Lumina AI learns what you pair together.
            </p>
          )}
          <p className="text-[11px] text-on-surface-variant/70 mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-emerald-600">psychology</span>
            Learned live from your personal purchase sessions.
          </p>
        </div>
      )}

      {/* 2. Due for a Reorder */}
      {dueForReorder.length > 0 && (
        <div className="glass-panel p-5 md:p-6 rounded-3xl border border-white/80 ambient-shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-base">update</span>
              Due for a Restock
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              Cycle Prediction
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {dueForReorder.map(({ product, avgCycleDays, daysSinceLast }) => (
              <button
                key={product.id}
                onClick={() => handleAdd(product)}
                className="glass-button text-xs py-2 px-3.5 rounded-full flex items-center gap-2 hover:border-amber-500/60 hover:text-amber-900 transition-all group"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white">
                  +
                </span>
                <span className="font-semibold text-on-surface">{product.name}</span>
                <span className="text-[10px] text-on-surface-variant bg-white/60 px-1.5 py-0.5 rounded-full">
                  Usually every {avgCycleDays}d (last added {daysSinceLast}d ago)
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-on-surface-variant/70 mt-3">
            Computed from interval timings between past additions.
          </p>
        </div>
      )}

      {/* 3. In Season This Month */}
      {!compact && seasonalProducts.length > 0 && (
        <div className="glass-panel p-5 md:p-6 rounded-3xl border border-white/80 ambient-shadow">
          <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-emerald-600 text-base">eco</span>
            In Season & Peak Harvest
          </h3>
          <div className="flex flex-wrap gap-2">
            {seasonalProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAdd(product)}
                className="glass-button text-xs py-2 px-3.5 rounded-full flex items-center gap-2 hover:border-emerald-500/60 transition-all group"
              >
                <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white">
                  +
                </span>
                <span className="font-semibold text-on-surface">{product.name}</span>
                <span className="text-[11px] text-emerald-700 font-bold">${product.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
