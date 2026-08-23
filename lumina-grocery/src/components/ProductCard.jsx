import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isFav = isInWishlist(product.id);

  return (
    <article className="glass-panel rounded-2xl overflow-hidden group flex flex-col ambient-shadow hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-white/70">
      {/* Product Image Area */}
      <div className="relative h-60 w-full overflow-hidden bg-white/30">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
            }}
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/75 backdrop-blur-md border border-white/70 rounded-full text-[11px] font-bold tracking-wider uppercase text-primary shadow-sm">
            {product.badge}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={() => toggleWishlist(product)}
          aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
            isFav
              ? "bg-pink-500 text-white border-pink-400 shadow-md scale-105"
              : "bg-white/60 border-white/70 text-on-surface-variant hover:text-pink-500 hover:bg-white"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isFav ? "favorite" : "favorite_border"}
          </span>
        </button>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-semibold text-white/90">
          {product.category}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1 text-xs text-amber-600">
            <span className="material-symbols-outlined text-sm text-amber-500">star</span>
            <span className="font-bold text-on-surface">{product.rating || 4.8}</span>
            <span className="text-on-surface-variant/70 text-[11px]">({product.reviewsCount || 80})</span>
          </div>

          {/* Title & Price */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-headline text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <span className="font-headline text-lg font-extrabold text-primary whitespace-nowrap">
              ${product.price.toFixed(2)}
              <span className="font-body text-xs font-normal text-on-surface-variant">/{product.unit}</span>
            </span>
          </div>

          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Add to Cart Action */}
        <button
          onClick={() => addToCart(product, 1)}
          className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-label text-xs font-bold shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] hover:bg-opacity-90 hover:shadow-md transition-all flex justify-center items-center gap-2 group-hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-base">add_shopping_cart</span>
          Add to Bag
        </button>
      </div>
    </article>
  );
}
