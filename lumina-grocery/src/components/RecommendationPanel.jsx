import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
      .filter((p) => !cartItemNames.includes(p.name))
      .slice(0, 6);
  }, [cartItemNames]);

  const handleAdd = (product) => {
    addToCart(product, 1);
    RecommendationService.logEvent(product.name, "add", 1);
    setRefreshKey((k) => k + 1);
  };

  const handleAddBundle = () => {
    if (frequentlyTogether.length === 0) return;
    frequentlyTogether.forEach(({ product }) => {
      addToCart(product, 1);
      RecommendationService.logEvent(product.name, "add", 1);
    });
    showToast(`Added ${frequentlyTogether.length} bundle items to your bag!`, "success");
    setRefreshKey((k) => k + 1);
  };

  const handleResetHistory = () => {
    RecommendationService.clearEvents();
    setRefreshKey((k) => k + 1);
    showToast("Learning history reset. Fresh insights will form as you shop!", "info");
  };

  return (
    <section className="space-y-6 my-10">
      {/* 1. Frequently Added Together Section */}
      {cart.length > 0 && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/85 ambient-shadow bg-white/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>Lumina Neural Basket Pairing</span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                Frequently Paired with Your Basket
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {frequentlyTogether.length > 1 && (
                <button
                  onClick={handleAddBundle}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-opacity-90 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">all_inclusive</span>
                  Add All {frequentlyTogether.length} Items
                </button>
              )}
              <button
                onClick={handleResetHistory}
                className="text-xs text-stone-400 hover:text-rose-500 transition-colors"
                title="Reset recommendation learning model"
              >
                Reset Learning
              </button>
            </div>
          </div>

          {frequentlyTogether.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {frequentlyTogether.map(({ product, score, reason }) => (
                <div
                  key={product.id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Link to={`/product/${product.id}`} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {reason || `Bought together ${score}×`}
                      </span>
                      <Link to={`/product/${product.id}`}>
                        <h4 className="font-headline font-bold text-xs text-on-surface hover:text-primary transition-colors line-clamp-1 mt-1">
                          {product.name}
                        </h4>
                      </Link>
                      <span className="font-headline text-sm font-extrabold text-primary">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-label text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add to Bag
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 bg-white/50 p-4 rounded-2xl border border-white/60">
              No strong pairing patterns yet for your current items. As you add more artisanal items, Lumina AI discovers customized recipes and co-occurrence habits!
            </p>
          )}

          <p className="text-[11px] text-stone-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-emerald-600">psychology</span>
            <span>Synthesized locally in real-time from your authenticated shopping history.</span>
          </p>
        </div>
      )}

      {/* 2. Reorder Cycle Prediction Section */}
      {dueForReorder.length > 0 && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/85 ambient-shadow bg-white/70">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest mb-1">
                <span className="material-symbols-outlined text-base">update</span>
                <span>Restock Intelligence</span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                Due for a Fresh Restock
              </h3>
            </div>
            <span className="text-xs bg-amber-500/15 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
              Cycle Predictive AI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dueForReorder.map(({ product, avgCycleDays, daysSinceLast }) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Link to={`/product/${product.id}`} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full block w-fit truncate">
                      Every {avgCycleDays}d (last {daysSinceLast}d ago)
                    </span>
                    <Link to={`/product/${product.id}`}>
                      <h4 className="font-headline font-bold text-xs text-on-surface hover:text-primary transition-colors line-clamp-1 mt-1">
                        {product.name}
                      </h4>
                    </Link>
                    <span className="font-headline text-sm font-extrabold text-primary">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(product)}
                  className="w-full bg-amber-500/10 hover:bg-amber-600 text-amber-900 hover:text-white font-label text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">replay</span>
                  Restock Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. In Season Peak Harvest Section */}
      {!compact && seasonalProducts.length > 0 && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/85 ambient-shadow bg-white/70">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-1">
                <span className="material-symbols-outlined text-base">eco</span>
                <span>Peak Orchard & Farm Direct</span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                Recommended Seasonal Specialties
              </h3>
            </div>
            <Link
              to="/search?q=seasonal"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All Seasonal →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {seasonalProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/85 rounded-2xl p-3 border border-white/80 shadow-sm flex flex-col justify-between group hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <Link to={`/product/${product.id}`} className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-2 relative block">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {product.season && (
                    <span className="absolute top-1 left-1 text-[9px] bg-black/50 backdrop-blur-md text-white font-bold px-1.5 py-0.5 rounded-md">
                      {product.season}
                    </span>
                  )}
                </Link>

                <div className="mb-2">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-headline font-bold text-xs text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="font-headline text-xs font-bold text-primary mt-0.5">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  onClick={() => handleAdd(product)}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-600 text-emerald-800 hover:text-white font-label text-[11px] font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
