import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { VoiceProvider } from "./context/VoiceContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VoiceOverlay from "./components/VoiceOverlay";
import VoiceFab from "./components/VoiceFab";
import Toast from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative">
      {/* Dynamic Ambient Glowing Orbs for True Glassmorphism Refraction */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />

      <ScrollToTop />
      <Navbar />
      <div className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <Footer />
      <VoiceOverlay />
      <VoiceFab />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <VoiceProvider>
          <AppContent />
        </VoiceProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
