import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useVoice } from "../context/VoiceContext";
import { useState } from "react";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const { cartCount, wishlist } = useCart();
  const { openVoiceModal, isListening } = useVoice();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Main Header: STICKY TOP-0 */}
      <header className="hidden md:block sticky top-0 w-full z-50 bg-white/70 backdrop-blur-2xl text-primary border-b border-white/60 shadow-xs px-gutter py-2.5 transition-all duration-300">
        <div className="flex justify-between items-center">
          {/* Brand Logo with Scrolling Ticker in Same Box */}
          <BrandLogo />

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-grow max-w-md lg:max-w-lg mx-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/65 backdrop-blur-xl border border-white/90 rounded-full py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-stone-400 shadow-xs"
                placeholder="Search Alphonso mangoes, ceremonial matcha, artisanal sourdough..."
              />
              <button
                type="button"
                onClick={openVoiceModal}
                title="Voice Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-primary hover:bg-primary/10 transition-all"
              >
                <span className="material-symbols-outlined text-base">mic</span>
              </button>
            </div>
          </form>

          {/* Right Icon Actions */}
          <div className="flex items-center gap-2.5">
            {/* AI Voice Assistant Trigger */}
            <button
              onClick={openVoiceModal}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isListening
                  ? "bg-primary text-white border-primary pulse-glow"
                  : "glass-button text-primary border-primary/25 hover:bg-primary hover:text-white hover:scale-105"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isListening ? "graphic_eq" : "mic"}
              </span>
              <span>Voice AI</span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-full glass-button text-stone-600 hover:text-pink-500 transition-all relative hover:scale-105"
              title="Saved Wishlist"
            >
              <span className="material-symbols-outlined text-xl">favorite_border</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="p-2.5 rounded-full glass-button text-stone-600 hover:text-primary transition-all relative hover:scale-105"
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Tier 2: Category Navigation Sub-Bar: NOT STICKY (Scrolls with page content) */}
      <div className="hidden md:flex bg-white/55 backdrop-blur-xl border-b border-white/80 shadow-[0_4px_16px_-4px_rgba(132,61,150,0.04)] px-gutter py-1.5 items-center justify-center overflow-x-auto no-scrollbar relative z-20">
        <nav className="flex items-center gap-2 sm:gap-3 lg:gap-5 text-xs font-semibold whitespace-nowrap">
          <Link
            to="/"
            className={`transition-all py-1 px-3 rounded-full flex items-center gap-1.5 ${
              isActive("/")
                ? "text-primary bg-primary/10 font-bold border border-primary/20 shadow-xs"
                : "text-stone-600 hover:text-primary hover:bg-white/60"
            }`}
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span>Shop All</span>
          </Link>
          <Link
            to="/search?q=Produce"
            className="text-stone-600 hover:text-primary hover:bg-white/60 transition-all py-1 px-3 rounded-full flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-emerald-600">nutrition</span>
            <span>Produce</span>
          </Link>
          <Link
            to="/search?q=Dairy"
            className="text-stone-600 hover:text-primary hover:bg-white/60 transition-all py-1 px-3 rounded-full flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-amber-600">egg_alt</span>
            <span>Dairy & Eggs</span>
          </Link>
          <Link
            to="/search?q=Bakery"
            className="text-stone-600 hover:text-primary hover:bg-white/60 transition-all py-1 px-3 rounded-full flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-orange-600">bakery_dining</span>
            <span>Bakery</span>
          </Link>
          <Link
            to="/search?q=Beverages"
            className="text-stone-600 hover:text-primary hover:bg-white/60 transition-all py-1 px-3 rounded-full flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-teal-600">local_cafe</span>
            <span>Beverages & Matcha</span>
          </Link>
          <Link
            to="/search?q=Pantry"
            className="text-stone-600 hover:text-primary hover:bg-white/60 transition-all py-1 px-3 rounded-full flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-amber-700">ramen_dining</span>
            <span>Pantry</span>
          </Link>
          <Link
            to="/search?q=Wellness"
            className="text-stone-600 hover:text-primary hover:bg-white/60 transition-all py-1 px-3 rounded-full flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm text-purple-600">spa</span>
            <span>Wellness & Skincare</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Header: STICKY TOP-0 */}
      <header className="md:hidden bg-white/70 backdrop-blur-2xl sticky top-0 w-full z-50 border-b border-white/80 px-3 py-2.5 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-stone-700 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
          <BrandLogo isCompact={true} />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={openVoiceModal}
            className="p-2 rounded-full glass-button text-primary"
            title="Voice Search"
          >
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
          <Link
            to="/wishlist"
            className="p-2 rounded-full glass-button text-stone-700 relative"
          >
            <span className="material-symbols-outlined text-xl">favorite_border</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="p-2 rounded-full glass-button text-stone-700 relative"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[10px] rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-md pt-16 animate-fadeIn">
          <div className="glass-modal p-6 m-4 rounded-3xl space-y-4 border border-white/80 shadow-2xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search luxury grocery..."
                className="glass-input text-xs py-2.5 pl-10"
              />
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                search
              </span>
            </form>

            <nav className="flex flex-col gap-1.5 font-semibold text-sm pt-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-primary">storefront</span>
                <span>Shop All</span>
              </Link>
              <Link
                to="/search?q=Produce"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-emerald-600">nutrition</span>
                <span>Fresh Produce & Heirloom Fruits</span>
              </Link>
              <Link
                to="/search?q=Dairy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-amber-600">egg_alt</span>
                <span>Artisanal Dairy & Eggs</span>
              </Link>
              <Link
                to="/search?q=Bakery"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-orange-600">bakery_dining</span>
                <span>Hearth Bakery</span>
              </Link>
              <Link
                to="/search?q=Beverages"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-teal-600">local_cafe</span>
                <span>Beverages & Ceremonial Matcha</span>
              </Link>
              <Link
                to="/search?q=Pantry"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-amber-700">ramen_dining</span>
                <span>Gourmet Pantry & Wild Honey</span>
              </Link>
              <Link
                to="/search?q=Wellness"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-purple-600">spa</span>
                <span>Botanical Wellness & Skincare</span>
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-pink-500">favorite</span>
                  <span>Wishlist</span>
                </div>
                <span className="text-xs bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full font-bold">
                  {wishlist.length}
                </span>
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-2xl hover:bg-white/60 text-stone-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">shopping_bag</span>
                  <span>Shopping Bag</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
