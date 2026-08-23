import { useParams, Link } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useVoice } from "../context/VoiceContext";
import { useState } from "react";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { isListening, startListening, stopListening, openVoiceModal } = useVoice();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const related = products.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 3);
  const isFav = product ? isInWishlist(product.id) : false;

  if (!product) {
    return (
      <main className="pt-[120px] pb-xl max-w-container-max mx-auto px-gutter text-center">
        <div className="glass-panel max-w-md mx-auto p-8 rounded-3xl">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">search_off</span>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Product Not Found</h1>
          <p className="text-sm text-on-surface-variant mt-2 mb-6">The requested luxury grocery item could not be found.</p>
          <Link to="/" className="bg-primary text-white text-xs font-semibold px-6 py-3 rounded-full">
            ← Return to Sanctuary
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-[100px] md:pt-[110px] pb-xl max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/search?q=${encodeURIComponent(product.category)}`} className="hover:text-primary transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-on-surface font-medium">{product.name}</span>
      </nav>

      {/* Main Detail Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Images Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full aspect-[4/3] md:aspect-[16/11] rounded-3xl overflow-hidden glass-panel relative group border border-white/80">
            <img
              src={product.images?.[activeImg] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 px-3.5 py-1 bg-white/80 backdrop-blur-md border border-white/80 rounded-full text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                {product.badge}
              </div>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                isFav
                  ? "bg-pink-500 text-white border-pink-400 shadow-md scale-105"
                  : "bg-white/60 border-white/80 text-on-surface-variant hover:text-pink-500 hover:bg-white"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {isFav ? "favorite" : "favorite_border"}
              </span>
            </button>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden glass-panel border-2 transition-all ${
                    activeImg === i ? "border-primary scale-105 ring-2 ring-primary/20" : "border-white/60 hover:opacity-90"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Nutritional / Origin Specs Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/70 space-y-3">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">eco</span>
              Origin & Specifications
            </h3>
            <p className="text-xs text-on-surface-variant">
              <strong>Source:</strong> {product.origin || "Lumina Certified Artisan"}
            </p>
            {product.nutrition && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {Object.entries(product.nutrition).map(([key, val]) => (
                  <div key={key} className="bg-white/40 p-2.5 rounded-xl border border-white/60 text-center">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant">{key}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6 border border-white/80 ambient-shadow">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                <span className="material-symbols-outlined text-base text-amber-500">star</span>
                <span className="font-bold text-on-surface">{product.rating || 4.9}</span>
                <span className="text-on-surface-variant">({product.reviewsCount || 100} certified reviews)</span>
                <span className="ml-auto text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  In Stock
                </span>
              </div>

              <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-2">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-headline text-3xl font-extrabold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-on-surface-variant">/ {product.unit}</span>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="pt-4 border-t border-white/40 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Quantity</span>
              <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/60">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="text-sm font-bold text-on-surface w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface hover:bg-white/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => addToCart(product, qty)}
                className="w-full bg-primary text-on-primary font-label text-sm font-bold py-4 rounded-full shadow-[0_8px_20px_rgba(131,70,145,0.3)] hover:bg-opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                Add {qty > 1 ? `${qty} items` : ""} to Bag — ${(product.price * qty).toFixed(2)}
              </button>

              {/* Voice Add to Cart Button */}
              <button
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                onClick={() => openVoiceModal()}
                className={`w-full py-3.5 rounded-full font-label text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  isListening
                    ? "bg-primary text-white border-primary pulse-glow"
                    : "glass-button text-primary border-primary/30 hover:bg-white"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isListening ? "graphic_eq" : "mic"}
                </span>
                <span>{isListening ? "Listening... Speak your command" : "Hold or Click to Order by Voice"}</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">local_shipping</span>
                <span>Express Climate-Neutral Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">verified_user</span>
                <span>100% Organic & Non-GMO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl font-bold text-on-surface">Complementary Products</h2>
            <Link to={`/search?q=${encodeURIComponent(product.category)}`} className="text-primary text-xs font-semibold hover:underline">
              View Category →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
