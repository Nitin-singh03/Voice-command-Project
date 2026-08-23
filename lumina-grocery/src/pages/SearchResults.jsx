import { useSearchParams, Link } from "react-router-dom";
import { products, categories, seasons } from "../data/products";
import ProductCard from "../components/ProductCard";
import { useVoice } from "../context/VoiceContext";
import RecommendationPanel from "../components/RecommendationPanel";
import { useState, useMemo } from "react";

const substitutesMap = {
  apples: ["Granny Smith Apples", "Golden Spiced Apple & Pear Cider", "Cold-Pressed Raw Honey", "Wild Organic Blueberries"],
  mango: ["Royal Alphonso Mangoes", "Rainier Sweet Golden Cherries", "Wild Organic Blueberries"],
  fruits: ["Royal Alphonso Mangoes", "Honeycrisp Apples", "Rainier Sweet Golden Cherries", "Wild Organic Blueberries"],
  bread: ["Artisanal Sourdough Boule", "French Pure Butter Croissants", "Rosemary Sea Salt Focaccia"],
  dairy: ["French Black Truffle Cultured Butter", "Authentic Greek Sheep Milk Yogurt", "Pasture-Raised Heirloom Eggs"],
  cheese: ["Artisanal Aged Farmhouse Cheese", "French Black Truffle Cultured Butter"],
  tea: ["Organic Matcha Ceremony Grade", "Monsoon Herbal Spiced Chai Blend", "Wild Lavender Herbal Sparkling Tonic"],
  coffee: ["Cold Brew Single-Origin Coffee", "Oat Milk Barista Edition"],
  wellness: ["Lumina Essential Oils Set", "Spring Botanical Collection", "Organic Wild Lion's Mane Extract"],
  skincare: ["Aura Revitalizing Essence", "Botanical Restorative Night Balm", "Damask Rose Hydrating Face Mist"],
  summer: ["Royal Alphonso Mangoes", "Rainier Sweet Golden Cherries", "Cold Brew Single-Origin Coffee", "Damask Rose Hydrating Face Mist"],
  winter: ["French Black Truffle Cultured Butter", "Winter Alpine Dark Hot Cocoa Blend", "Wildcrafted Elderberry & Zinc Tonic", "Meyer Lemons"],
  monsoon: ["Monsoon Herbal Spiced Chai Blend", "Japanese Shiitake Mushrooms", "Organic Wild Lion's Mane Extract"],
  default: ["Honeycrisp Apples", "Royal Alphonso Mangoes", "French Black Truffle Cultured Butter", "Organic Matcha Ceremony Grade", "Aura Revitalizing Essence"],
};

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get("q") || "";
  const maxPriceParam = searchParams.get("maxPrice");

  const { openVoiceModal } = useVoice();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [maxPrice, setMaxPrice] = useState(maxPriceParam ? parseFloat(maxPriceParam) : 150);

  const displayQuery = rawQuery && rawQuery !== "all" ? rawQuery : "All Products";

  const substitutes = useMemo(() => {
    const q = rawQuery.toLowerCase();
    for (const key in substitutesMap) {
      if (q.includes(key)) return substitutesMap[key];
    }
    return substitutesMap.default;
  }, [rawQuery]);

  const filtered = useMemo(() => {
    let list = products;

    if (rawQuery && rawQuery.toLowerCase() !== "all") {
      const q = rawQuery.toLowerCase();
      if (q === "seasonal") {
        list = list.filter((p) => p.isSeasonal);
      } else {
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.season && p.season.toLowerCase().includes(q)) ||
            (p.badge && p.badge.toLowerCase().includes(q)) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
    }

    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedSeason !== "All") {
      list = list.filter((p) => p.season === selectedSeason);
    }

    list = list.filter((p) => p.price <= maxPrice);

    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [rawQuery, selectedCategory, selectedSeason, maxPrice, sortBy]);

  const handleSubstituteClick = (sub) => {
    setSearchParams({ q: sub });
  };

  return (
    <main className="pt-[100px] md:pt-[110px] pb-xl px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      {/* Search Header Banner */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 mb-8 border border-white/85 ambient-shadow bg-white/75">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-on-surface font-medium">Search Catalog</span>
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-3">
              Results for <span className="text-primary">"{displayQuery}"</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                {filtered.length} {filtered.length === 1 ? "match" : "matches"}
              </span>
            </h1>
          </div>

          {/* Voice Search CTA & Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={openVoiceModal}
              className="glass-button text-primary font-label text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-base">mic</span>
              Voice Search
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input text-xs py-2 px-3 rounded-full cursor-pointer w-auto bg-white/70"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Filter Controls: Seasons, Categories, Price Range */}
        <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-stone-200/70">
          {/* Season Filter Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-primary whitespace-nowrap mr-2">Season:</span>
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                  selectedSeason === s.id
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "glass-button text-stone-600 border-white/70 hover:border-primary hover:text-primary"
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          {/* Category Chips & Price Slider */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-bold text-primary whitespace-nowrap mr-2">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "glass-button text-stone-600 border-white/70 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price Range Slider */}
            <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-full border border-white/80 w-fit">
              <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">
                Max Price: <strong className="text-primary">${maxPrice}</strong>
              </span>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-28 sm:w-36 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Smart AI Substitutes Recommendation Chips */}
        <div className="mt-4 pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            <span>Recommended Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {substitutes.map((s) => (
              <button
                key={s}
                onClick={() => handleSubstituteClick(s)}
                className="glass-button text-[11px] font-medium py-1 px-3 rounded-full text-stone-700 hover:text-primary hover:border-primary/40 transition-all bg-white/50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto border border-white/70 bg-white/80">
          <span className="material-symbols-outlined text-5xl text-stone-400 mb-3">search_off</span>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-2">No Items Found</h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            We couldn't find items matching "{displayQuery}" under ${maxPrice}. Try speaking another voice query, resetting season, or clearing filters.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchParams({ q: "all" });
                setSelectedCategory("All");
                setSelectedSeason("All");
                setMaxPrice(150);
              }}
              className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full"
            >
              Reset Filters
            </button>
            <button
              onClick={openVoiceModal}
              className="glass-button text-primary text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">mic</span> Try Voice
            </button>
          </div>
        </div>
      )}

      {/* AI Recommendation Engine */}
      <div className="mt-12">
        <RecommendationPanel compact={true} />
      </div>
    </main>
  );
}
