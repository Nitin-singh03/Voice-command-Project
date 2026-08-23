import { Link } from "react-router-dom";
import { useVoice } from "../context/VoiceContext";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const { openVoiceModal } = useVoice();

  return (
    <footer className="glass-panel text-primary font-body w-full pt-16 pb-12 mt-24 border-t border-white/80 relative z-10 bg-white/50">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-xs text-stone-600 leading-relaxed">
              Pioneering voice-assisted luxury shopping for biodynamic produce, seasonal harvests, artisanal bakeries, and rare botanical wellness.
            </p>
            <button
              onClick={openVoiceModal}
              className="glass-button text-xs font-bold text-primary px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">mic</span>
              Voice AI Concierge
            </button>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider mb-4">
              Artisanal Aisles
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li><Link to="/search?q=Produce" className="hover:text-primary transition-colors">Heirloom Fruits & Greens</Link></li>
              <li><Link to="/search?q=Dairy" className="hover:text-primary transition-colors">Truffle Butter & Sheep Yogurt</Link></li>
              <li><Link to="/search?q=Bakery" className="hover:text-primary transition-colors">Artisanal Sourdough & Croissants</Link></li>
              <li><Link to="/search?q=Beverages" className="hover:text-primary transition-colors">Ceremonial Matcha & Spiced Chai</Link></li>
              <li><Link to="/search?q=Pantry" className="hover:text-primary transition-colors">25-Yr Balsamic & Koroneiki EVOO</Link></li>
              <li><Link to="/search?q=Wellness" className="hover:text-primary transition-colors">Botanical Radiance & Skincare</Link></li>
            </ul>
          </div>

          {/* Col 3: Voice Commands Help */}
          <div>
            <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider mb-4">
              Voice Shortcuts
            </h4>
            <ul className="space-y-2 text-[11px] text-stone-700">
              <li className="bg-white/70 p-2.5 rounded-xl border border-white/80 shadow-xs">"Add 2 Alphonso Mangoes"</li>
              <li className="bg-white/70 p-2.5 rounded-xl border border-white/80 shadow-xs">"Show summer fruits"</li>
              <li className="bg-white/70 p-2.5 rounded-xl border border-white/80 shadow-xs">"Apply coupon LUMINA20"</li>
              <li className="bg-white/70 p-2.5 rounded-xl border border-white/80 shadow-xs">"Take me to checkout"</li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
              Harvest Newsletter
            </h4>
            <p className="text-xs text-stone-600">
              Receive seasonal farm harvest updates, exclusive voice secret codes, and limited drops.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to Lumina seasonal harvest updates!"); }} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email..."
                required
                className="glass-input text-xs py-2 px-3.5 flex-grow"
              />
              <button
                type="submit"
                className="glass-btn-primary text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-200/60 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} LUMINA Luxury Grocery & Wellness. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#shipping" className="hover:text-primary transition-colors">Climate-Neutral Delivery</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
