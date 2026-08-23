import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useVoice } from "../context/VoiceContext";
import { products, seasons, categories } from "../data/products";
import ProductCard from "../components/ProductCard";
import RecommendationPanel from "../components/RecommendationPanel";

const heroBg = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85";

const offers = [
  { icon: "spa", text: "20% Off With Voice Code: LUMINA20" },
  { icon: "local_shipping", text: "Free Eco-Courier Delivery on Orders Over $75" },
  { icon: "nature", text: "100% Certified Biodynamic & Plastic-Free Packaging" },
  { icon: "bolt", text: "1-Hour Express Voice Checkout Available" },
  { icon: "sunny", text: "Summer Harvest: Royal Alphonso Mangoes Now In Stock" },
  { icon: "eco", text: "Farm-Direct Heirloom Apples & Wild Blueberries" },
];

export default function Home() {
  const { addToCart } = useCart();
  const { openVoiceModal } = useVoice();
  const [selectedSeason, setSelectedSeason] = useState("Summer");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");

  // Curated Seasonal Products
  const seasonalProducts = useMemo(() => {
    if (selectedSeason === "All") {
      return products.filter((p) => p.isSeasonal);
    }
    return products.filter((p) => p.season === selectedSeason);
  }, [selectedSeason]);

  const activeSeasonObj = seasons.find((s) => s.id === selectedSeason) || seasons[2];

  // Curated feature spotlight picks
  const summerPicks = products.filter((p) => p.id === 25 || p.id === 29 || p.id === 4 || p.id === 1);
  const hearthAndDairy = products.filter((p) => p.id === 11 || p.id === 34 || p.id === 36 || p.id === 35);
  const wellnessHighlights = products.filter((p) => p.id === 22 || p.id === 47 || p.id === 48 || p.id === 14);

  // Full Catalog filtering
  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [activeCategory, searchFilter]);

  return (
    <main className="pt-6 md:pt-8 pb-xl max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      {/* 1. Hero Section */}
      <section className="relative min-h-[540px] md:min-h-[600px] flex flex-col items-center justify-center rounded-3xl overflow-hidden mb-12 ambient-shadow border border-white/80">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${heroBg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/45" />

        <div className="relative z-10 w-full max-w-2xl px-4 text-center">
          <div className="bg-white/15 backdrop-blur-2xl px-6 py-8 sm:py-10 md:px-10 rounded-3xl flex flex-col items-center text-center border border-white/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden animate-hero-glow group">
            {/* 1. Animated Holographic Light Sweep Sheen */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shine-sweep -z-0" />

            {/* 2. Stylus Minimalist Badge */}
            <span className="font-label text-[11px] uppercase tracking-[0.25em] text-amber-200 font-semibold mb-3.5 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/25 shadow-xs flex items-center gap-2 relative z-10 animate-float-mini">
              <span className="material-symbols-outlined text-xs text-amber-300 animate-spin-slow">auto_awesome</span>
              <span>Voice-Activated Sanctuary</span>
            </span>

            {/* 3. Stylus Luxury Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white tracking-tight drop-shadow-xl mb-3 relative z-10">
              Lumina <span className="font-editorial italic font-normal text-amber-200 drop-shadow-md">Luxury Grocery</span>
            </h1>

            {/* 4. Minimal, Poetic Subtitle */}
            <p className="font-editorial italic text-sm sm:text-lg text-white/90 max-w-md mx-auto leading-relaxed drop-shadow-sm mb-6 relative z-10">
              Heirloom farm harvests & artisanal delicacies, ordered effortlessly by voice.
            </p>

            {/* 5. Clean Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto relative z-10">
              <button
                onClick={openVoiceModal}
                className="glass-btn-primary text-white font-label text-xs sm:text-sm font-bold px-7 py-3 rounded-full shadow-[0_10px_25px_rgba(132,61,150,0.55)] hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 pulse-glow hover:scale-105 border border-white/40 group/btn"
              >
                {/* Mini equalizer */}
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-0.5 bg-white rounded-full h-1.5 group-hover/btn:h-3.5 animate-pulse transition-all" />
                  <span className="w-0.5 bg-white rounded-full h-3 group-hover/btn:h-1.5 animate-pulse transition-all delay-75" />
                  <span className="w-0.5 bg-white rounded-full h-1 group-hover/btn:h-2.5 animate-pulse transition-all delay-150" />
                </div>
                <span className="material-symbols-outlined text-base">mic</span>
                <span>Shop with Voice AI</span>
              </button>

              <Link
                to="/search?q=all"
                className="bg-white/20 hover:bg-white/35 backdrop-blur-xl text-white font-label text-xs sm:text-sm font-bold px-7 py-3 rounded-full flex items-center justify-center gap-2 border border-white/40 transition-all hover:scale-105 shadow-md group/cat"
              >
                <span className="material-symbols-outlined text-base group-hover/cat:rotate-12 transition-transform">grid_view</span>
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Offers Infinite Scrolling Carousel */}
      <section className="mb-14 overflow-hidden relative w-full rounded-2xl">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-[#fbfcfe] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-[#fbfcfe] to-transparent z-10 pointer-events-none" />
        <div className="flex w-max gap-4 animate-infinite-scroll py-2">
          {[...offers, ...offers].map((o, i) => (
            <div
              key={i}
              className="glass-panel px-6 py-3.5 rounded-full flex items-center gap-3 shadow-sm border border-white/80 cursor-pointer hover:bg-white/90 transition-all hover:scale-102"
              onClick={openVoiceModal}
            >
              <span className="material-symbols-outlined text-primary text-xl">{o.icon}</span>
              <span className="font-headline text-xs md:text-sm text-primary font-bold tracking-tight">{o.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC INTERACTIVE SEASONAL SANCTUARY SECTION */}
      <section className="mb-16 glass-panel p-6 md:p-10 rounded-3xl border border-white/90 ambient-shadow bg-gradient-to-br from-white/80 via-white/60 to-purple-50/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1.5">
              <span className="material-symbols-outlined text-base">spa</span>
              <span>Curated Seasonal Harvests</span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Seasonal Sanctuary & Limited Harvests
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              {activeSeasonObj.subtitle || "Handpicked seasonal harvests at peak flavor, nutrition, and natural aroma."}
            </p>
          </div>

          {/* Season Switcher Tabs */}
          <div className="flex flex-wrap gap-2">
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                  selectedSeason === s.id
                    ? "bg-primary text-white border-primary shadow-md scale-105 ring-2 ring-primary/20"
                    : "glass-button text-stone-700 border-white/80 hover:border-primary hover:text-primary"
                }`}
              >
                {s.icon && <span className="material-symbols-outlined text-sm">{s.icon}</span>}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Voice Suggestion Banner */}
        <div className="mb-6 bg-primary/10 border border-primary/25 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-lg">mic</span>
            </span>
            <div className="text-xs">
              <span className="font-bold text-primary">Voice Shopping Tip for {activeSeasonObj.label}:</span>
              <p className="text-stone-700">
                Try saying <strong className="text-primary font-semibold">"Add {seasonalProducts[0]?.name || "seasonal items"}"</strong> or <strong className="text-primary font-semibold">"Show {selectedSeason.toLowerCase()} fruits"</strong>
              </p>
            </div>
          </div>
          <button
            onClick={openVoiceModal}
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">mic</span>
            Order by Voice
          </button>
        </div>

        {/* Seasonal Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {seasonalProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Curated Harvest Spotlight Banners (Produce / Hearth / Wellness) */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Specialty Collections</span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Artisanal Spotlights</h2>
          </div>
          <div className="flex items-center gap-2 text-primary font-label text-xs font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>Handcrafted & Heirloom</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spotlight 1: Peak Fruit Harvest */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col justify-between bg-white/75">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">wb_sunny</span>
                  <span>Summer Orchard</span>
                </span>
                <span className="text-xs text-primary font-semibold">4 Items</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-3">
                Royal Mangoes & Wild Berries
              </h3>
              <div className="space-y-3">
                {summerPicks.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/80 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-white transition-all border border-white/70 shadow-sm"
                  >
                    <Link to={`/product/${p.id}`} className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-headline font-bold text-xs text-on-surface hover:text-primary truncate">{p.name}</h4>
                        <p className="text-[11px] text-stone-500 font-bold text-primary">${p.price.toFixed(2)} <span className="text-stone-400 font-normal">/{p.unit}</span></p>
                      </div>
                    </Link>
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="p-2 rounded-xl bg-primary text-white hover:bg-opacity-90 transition-transform hover:scale-105 flex-shrink-0 shadow-sm"
                      title="Add to cart"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spotlight 2: Hearth Bakery & Truffle Butter */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col justify-between bg-white/75">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bakery_dining</span>
                  <span>Hearth & Dairy</span>
                </span>
                <span className="text-xs text-primary font-semibold">4 Items</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-3">
                Slow Sourdough & Truffle Butter
              </h3>
              <div className="space-y-3">
                {hearthAndDairy.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/80 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-white transition-all border border-white/70 shadow-sm"
                  >
                    <Link to={`/product/${p.id}`} className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-headline font-bold text-xs text-on-surface hover:text-primary truncate">{p.name}</h4>
                        <p className="text-[11px] text-stone-500 font-bold text-primary">${p.price.toFixed(2)} <span className="text-stone-400 font-normal">/{p.unit}</span></p>
                      </div>
                    </Link>
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="p-2 rounded-xl bg-primary text-white hover:bg-opacity-90 transition-transform hover:scale-105 flex-shrink-0 shadow-sm"
                      title="Add to cart"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spotlight 3: Botanical Wellness & Skincare */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col justify-between bg-white/75">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">spa</span>
                  <span>Radiance & Beauty</span>
                </span>
                <span className="text-xs text-primary font-semibold">4 Items</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-3">
                Kyoto Elixirs & Blue Tansy
              </h3>
              <div className="space-y-3">
                {wellnessHighlights.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/80 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-white transition-all border border-white/70 shadow-sm"
                  >
                    <Link to={`/product/${p.id}`} className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-headline font-bold text-xs text-on-surface hover:text-primary truncate">{p.name}</h4>
                        <p className="text-[11px] text-stone-500 font-bold text-primary">${p.price.toFixed(2)} <span className="text-stone-400 font-normal">/{p.unit}</span></p>
                      </div>
                    </Link>
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="p-2 rounded-xl bg-primary text-white hover:bg-opacity-90 transition-transform hover:scale-105 flex-shrink-0 shadow-sm"
                      title="Add to cart"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real AI Recommendation Engine Panel */}
      <RecommendationPanel />

      {/* 6. Full Sanctuary Catalog Explorer */}
      <section className="mb-14">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Full Collection</span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
              Explore All Luxury Groceries
            </h2>
          </div>

          {/* Search filter input */}
          <div className="relative w-full lg:w-72">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base">
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter products..."
              className="w-full bg-white/70 backdrop-blur-md border border-white/80 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-md scale-105"
                  : "glass-button text-stone-700 border-white/80 hover:border-primary hover:text-primary"
              }`}
            >
              {cat} {cat === "All" && `(${products.length})`}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/80 max-w-md mx-auto my-8">
            <span className="material-symbols-outlined text-4xl text-stone-400 mb-2">search_off</span>
            <h3 className="font-headline text-lg font-bold text-on-surface">No products match your filter</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">Try searching for other keywords or clear filter.</p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchFilter("");
              }}
              className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
