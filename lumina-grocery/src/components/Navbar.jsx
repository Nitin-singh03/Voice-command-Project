import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useVoice } from "../context/VoiceContext";
import { useState } from "react";

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
      {/* Desktop Header */}
      <header className="hidden md:flex bg-white/70 backdrop-blur-2xl text-primary fixed top-0 w-full z-50 border-b border-white/80 shadow-lg shadow-black/5 justify-between items-center px-gutter py-3.5 transition-all duration-300">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-sm font-black shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
            L
          </span>
          <span className="font-headline text-2xl font-bold tracking-tighter text-on-surface">
            LUMINA
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5 text-xs lg:text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors py-1 ${
              isActive("/") ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Shop
          </Link>
          <Link
            to="/search?q=Produce"
            className="text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Produce
          </Link>
          <Link
            to="/search?q=Dairy"
            className="text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Dairy
          </Link>
          <Link
            to="/search?q=Bakery"
            className="text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Bakery
          </Link>
          <Link
            to="/search?q=Pantry"
            className="text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Pantry
          </Link>
          <Link
            to="/search?q=Household"
            className="text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Household
          </Link>
          <Link
            to="/search?q=Wellness"
            className="text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Wellness
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-grow max-w-sm mx-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/40 backdrop-blur-md border border-white/80 rounded-full py-2 pl-10 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/70 transition-all placeholder:text-on-surface-variant/60"
              placeholder="Search organic honey, apples, matcha..."
            />
            <button
              type="button"
              onClick={openVoiceModal}
              title="Voice Search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">mic</span>
            </button>
          </div>
        </form>

        {/* Right Icon Actions */}
        <div className="flex items-center gap-2">
          {/* AI Voice Assistant Trigger */}
          <button
            onClick={openVoiceModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isListening
                ? "bg-primary text-white border-primary pulse-glow"
                : "glass-button text-primary border-primary/30 hover:bg-primary hover:text-white"
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
            className="p-2.5 rounded-full hover:bg-white/60 text-on-surface-variant hover:text-primary transition-colors relative"
            title="Wishlist"
          >
            <span className="material-symbols-outlined text-xl">favorite_border</span>
            {wishlist.length > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="p-2.5 rounded-full hover:bg-white/60 text-on-surface-variant hover:text-primary transition-colors relative"
            title="Shopping Cart"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary text-[10px] rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/70 backdrop-blur-2xl fixed top-0 w-full z-50 border-b border-white/80 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
          <Link to="/" className="font-headline text-xl font-bold tracking-tighter text-on-surface">
            LUMINA
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={openVoiceModal}
            className="p-2 rounded-full text-primary hover:bg-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
          <Link
            to="/wishlist"
            className="p-2 rounded-full text-on-surface hover:text-primary transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">favorite_border</span>
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="p-2 rounded-full text-on-surface hover:text-primary transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary text-[10px] rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pt-16">
          <div className="glass-modal p-6 m-4 rounded-3xl space-y-4 border border-white/80 shadow-2xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="glass-input text-xs py-2.5 pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                search
              </span>
            </form>

            <nav className="flex flex-col gap-2 font-medium text-sm pt-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Shop All
              </Link>
              <Link
                to="/search?q=Produce"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Fresh Produce & Fruits
              </Link>
              <Link
                to="/search?q=Dairy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Farm Dairy & Eggs
              </Link>
              <Link
                to="/search?q=Bakery"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Artisanal Bakery
              </Link>
              <Link
                to="/search?q=Beverages"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Beverages & Matcha
              </Link>
              <Link
                to="/search?q=Pantry"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Pantry & Wild Honey
              </Link>
              <Link
                to="/search?q=Household"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Eco Household
              </Link>
              <Link
                to="/search?q=Wellness"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface"
              >
                Wellness & Skincare
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface flex justify-between items-center"
              >
                <span>Wishlist</span>
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">{wishlist.length}</span>
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 text-on-surface flex justify-between items-center"
              >
                <span>Shopping Bag</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{cartCount}</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
