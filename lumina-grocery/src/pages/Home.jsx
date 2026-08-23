import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useVoice } from "../context/VoiceContext";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import RecommendationPanel from "../components/RecommendationPanel";
import { useState } from "react";

const heroBg = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85";

const offers = [
  { icon: "spa", text: "20% Off With Voice Code: LUMINA20" },
  { icon: "local_shipping", text: "Free Eco-Courier Delivery on Orders Over $75" },
  { icon: "nature", text: "100% Certified Biodynamic & Plastic-Free Packaging" },
  { icon: "bolt", text: "1-Hour Express Voice Checkout Available" },
];

export default function Home() {
  const { addToCart } = useCart();
  const { openVoiceModal } = useVoice();
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  const seasonalPicks = products.slice(0, 3);
  const wellnessHighlights = products.filter((p) => p.category === "Wellness" || p.category === "Skincare").slice(0, 3);
  const filteredProducts = activeTab === "All" ? products : products.filter((p) => p.category === activeTab);

  return (
    <main className="pt-[80px] md:pt-[100px] pb-xl max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      {/* Hero Section */}
      <section className="relative min-h-[540px] md:min-h-[620px] flex flex-col items-center justify-center rounded-3xl overflow-hidden mb-12 ambient-shadow border border-white/80">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${heroBg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />

        <div className="relative z-10 w-full max-w-3xl px-4 text-center">
          <div className="glass-modal p-8 md:p-12 rounded-3xl flex flex-col items-center text-center border border-white/90 shadow-2xl">
            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-3 bg-white/70 px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
              ✨ Next-Gen Voice Shopping
            </span>

            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-3 tracking-tight">
              Lumina Luxury Grocery
            </h1>

            <p className="text-sm md:text-base text-on-surface-variant mb-6 max-w-xl leading-relaxed">
              Order fresh heirloom harvests, artisanal bakery, and rare botanicals with natural voice commands.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
              <button
                onClick={openVoiceModal}
                className="bg-primary text-on-primary font-label text-sm font-semibold px-8 py-3.5 rounded-full shadow-[0_8px_20px_rgba(131,70,145,0.35)] hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 pulse-glow"
              >
                <span className="material-symbols-outlined text-lg">mic</span>
                Shop with Voice AI
              </button>

              <Link
                to="/search?q=all"
                className="glass-btn-secondary text-primary font-label text-sm font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-white/80"
              >
                <span className="material-symbols-outlined text-lg">grid_view</span>
                Explore Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Infinite Carousel */}
      <section className="mb-14 overflow-hidden relative w-full rounded-2xl">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-[#f7f9fb] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-[#f7f9fb] to-transparent z-10 pointer-events-none" />
        <div className="flex w-max gap-4 animate-infinite-scroll py-2">
          {[...offers, ...offers].map((o, i) => (
            <div
              key={i}
              className="glass-panel px-6 py-3.5 rounded-full flex items-center gap-3 shadow-sm border border-white/80 cursor-pointer hover:bg-white/80 transition-all"
              onClick={openVoiceModal}
            >
              <span className="material-symbols-outlined text-primary text-xl">{o.icon}</span>
              <span className="font-headline text-xs md:text-sm text-primary font-bold tracking-tight">{o.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Voice Spotlight Banners */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Voice-Assisted</span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Curated Harvests</h2>
          </div>
          <div className="flex items-center gap-2 text-primary font-label text-xs font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>AI Voice Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seasonal Picks Feature Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-lg font-bold text-on-surface">Farm-Fresh Organic Apples & Berries</h3>
              <span className="text-xs text-primary font-semibold">Morning Harvest</span>
            </div>
            <div className="space-y-3">
              {seasonalPicks.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/50 backdrop-blur-md p-3.5 rounded-2xl flex items-center justify-between gap-4 hover:bg-white/80 transition-all border border-white/60"
                >
                  <Link to={`/product/${p.id}`} className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-headline font-bold text-sm text-on-surface hover:text-primary">{p.name}</h4>
                      <p className="text-xs text-on-surface-variant">${p.price.toFixed(2)} / {p.unit}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="p-2.5 rounded-full bg-primary text-white hover:bg-opacity-90 transition-transform hover:scale-105"
                    title="Add to cart"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Wellness & Skincare Feature Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-lg font-bold text-on-surface">Botanical Skincare & Radiance</h3>
              <span className="text-xs text-primary font-semibold">Luxury Elixirs</span>
            </div>
            <div className="space-y-3">
              {wellnessHighlights.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/50 backdrop-blur-md p-3.5 rounded-2xl flex items-center justify-between gap-4 hover:bg-white/80 transition-all border border-white/60"
                >
                  <Link to={`/product/${p.id}`} className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-headline font-bold text-sm text-on-surface hover:text-primary">{p.name}</h4>
                      <p className="text-xs text-on-surface-variant">${p.price.toFixed(2)} / {p.unit}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="p-2.5 rounded-full bg-primary text-white hover:bg-opacity-90 transition-transform hover:scale-105"
                    title="Add to cart"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real AI Recommendation Engine */}
      <RecommendationPanel />

      {/* Category Pills Filter */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Discover</span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Explore Full Sanctuary</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Fruits", "Bakery", "Pantry", "Wellness", "Skincare", "Eco"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  activeTab === cat
                    ? "bg-primary text-white border-primary shadow-md"
                    : "glass-button text-on-surface-variant border-white/80 hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
