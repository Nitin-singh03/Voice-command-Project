import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist, addToCart, showToast } = useCart();

  const handleAddAll = () => {
    wishlist.forEach((item) => addToCart(item, 1));
    showToast(`Added all ${wishlist.length} saved items to your cart!`, "success");
  };

  return (
    <main className="pt-6 md:pt-8 pb-xl px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-on-surface font-medium">Saved Sanctuary</span>
          </nav>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3">
            Wishlist & Favorites
            <span className="text-base font-normal px-3 py-1 rounded-full bg-primary/10 text-primary">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </span>
          </h1>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleAddAll}
            className="bg-primary text-on-primary font-label text-xs font-semibold px-6 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">shopping_cart</span>
            Add All to Bag
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="glass-panel max-w-lg mx-auto p-8 md:p-12 rounded-3xl ambient-shadow border border-white/70 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">favorite_border</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Tap the heart icon on any harvest or wellness product to save it here for later.
          </p>
          <Link
            to="/search?q=all"
            className="bg-primary text-on-primary font-label text-sm font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all shadow-md inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
