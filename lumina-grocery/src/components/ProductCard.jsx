import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const SEASON_COLOR_MAP = {
  Spring: "from-emerald-500/20 to-teal-500/10 text-emerald-800 border-emerald-300/60",
  Summer: "from-amber-500/20 to-orange-500/10 text-amber-900 border-amber-300/60",
  Autumn: "from-orange-500/20 to-amber-700/10 text-orange-900 border-orange-300/60",
  Winter: "from-blue-500/20 to-cyan-500/10 text-cyan-900 border-cyan-300/60",
  Monsoon: "from-teal-500/20 to-sky-600/10 text-teal-900 border-teal-300/60",
  Festive: "from-purple-500/20 to-pink-500/10 text-purple-900 border-purple-300/60",
};

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQty, toggleWishlist, isInWishlist } = useCart();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isFav = isInWishlist(product.id);
  const cartItem = cart.find((i) => i.id === product.id);
  const inCartQty = cartItem ? cartItem.qty : 0;

  // Discount percentage computation
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const currentImage =
    isHovered && product.images && product.images.length > 1
      ? product.images[activeImgIndex] || product.image
      : product.image;

  const seasonStyle = product.season && SEASON_COLOR_MAP[product.season]
    ? SEASON_COLOR_MAP[product.season]
    : "from-purple-500/10 to-pink-500/10 text-primary border-primary/20";

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImgIndex(0);
      }}
      className="glass-card rounded-3xl overflow-hidden group flex flex-col justify-between ambient-shadow hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/80 relative bg-white/70"
    >
      {/* 1. Large High-Impact Image Area */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50">
        <Link to={`/product/${product.id}`} className="block w-full h-full cursor-pointer">
          <img
            src={currentImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
            }}
          />
        </Link>

        {/* Top-Left Floating Badges Stack */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {/* Main Quality Badge */}
          {product.badge && (
            <span className="px-3 py-1 bg-white/85 backdrop-blur-md border border-white/80 rounded-full text-[10px] font-bold tracking-wider uppercase text-primary shadow-sm">
              {product.badge}
            </span>
          )}

          {/* Seasonal Tag */}
          {product.season && product.season !== "All-Season" && (
            <span className={`px-2.5 py-0.5 bg-white/90 backdrop-blur-md border rounded-full text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1 ${seasonStyle}`}>
              <span>{product.seasonName || `✨ ${product.season}`}</span>
            </span>
          )}

          {/* Discount Pill */}
          {discountPercent && (
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-full text-[10px] font-extrabold tracking-tight shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3.5 right-3.5 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all z-10 shadow-sm ${
            isFav
              ? "bg-pink-500 text-white border-pink-400 shadow-md scale-105"
              : "bg-white/70 border-white/80 text-on-surface-variant hover:text-pink-500 hover:bg-white hover:scale-105"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {isFav ? "favorite" : "favorite_border"}
          </span>
        </button>

        {/* Bottom Origin Marker */}
        {product.origin && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/45 backdrop-blur-md rounded-full text-[10px] font-medium text-white/95 flex items-center gap-1 shadow-sm max-w-[80%] truncate">
            <span className="material-symbols-outlined text-xs text-amber-300">location_on</span>
            <span className="truncate">{product.origin}</span>
          </div>
        )}

        {/* Multi-Image Hover Preview Dots */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full z-10">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImgIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImgIndex === idx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                }`}
                title={`Image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Details & Content */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          {/* Rating and Category Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
              {product.category}
            </span>

            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200/50">
              <span className="material-symbols-outlined text-xs text-amber-500 fill-current">star</span>
              <span className="font-bold">{product.rating || 4.9}</span>
              <span className="text-on-surface-variant/70 text-[10px]">({product.reviewsCount || 100})</span>
            </div>
          </div>

          {/* Title with Link */}
          <Link to={`/product/${product.id}`} className="block group/title">
            <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface group-hover/title:text-primary transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Highlight Dietary Pills */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
              {product.highlights.slice(0, 2).map((h, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-emerald-500/10 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/40"
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          )}

          {/* Description snippet */}
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-1 text-stone-600">
            {product.description}
          </p>
        </div>

        {/* 3. Pricing & In-Card Quantity Action */}
        <div className="pt-3 border-t border-stone-200/60 flex flex-col gap-3">
          {/* Pricing Row */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-xl font-extrabold text-primary tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through font-medium">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
              per {product.unit}
            </span>
          </div>

          {/* Action: In-Card Direct Quantity Stepper or Add to Bag */}
          {inCartQty > 0 ? (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-2xl p-1 shadow-sm animate-fadeIn">
              <button
                onClick={() => updateQty(product.id, inCartQty - 1)}
                className="w-8 h-8 rounded-xl bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 font-bold"
                title="Decrease quantity"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>

              <div className="flex flex-col items-center">
                <span className="font-headline text-xs font-bold text-primary">
                  {inCartQty} in Bag
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  ${(product.price * inCartQty).toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => updateQty(product.id, inCartQty + 1)}
                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-sm active:scale-95 font-bold"
                title="Increase quantity"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full bg-primary text-on-primary py-2.5 px-4 rounded-2xl font-label text-xs font-bold shadow-[0_4px_12px_rgba(131,70,145,0.25)] hover:bg-opacity-95 hover:shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex justify-center items-center gap-2 group/btn"
            >
              <span className="material-symbols-outlined text-base group-hover/btn:rotate-12 transition-transform">
                add_shopping_cart
              </span>
              <span>Add to Bag</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
