import { Link } from "react-router-dom";
import { useVoice } from "../context/VoiceContext";

export default function Footer() {
  const { openVoiceModal } = useVoice();

  return (
    <footer className="bg-white/40 backdrop-blur-xl text-primary font-body text-body-md w-full pt-16 pb-12 mt-24 border-t border-white/60">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                L
              </span>
              <span className="font-headline text-2xl font-bold tracking-tighter text-on-surface">
                LUMINA
              </span>
            </Link>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pioneering voice-assisted luxury shopping for biodynamic produce, artisanal bakeries, and botanical wellness.
            </p>
            <button
              onClick={openVoiceModal}
              className="glass-button text-xs font-semibold text-primary px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-base">mic</span>
              Voice Concierge
            </button>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider mb-4">
              Aisles
            </h4>
            <ul className="space-y-2.5 text-xs text-on-surface-variant">
              <li><Link to="/search?q=Fruits" className="hover:text-primary transition-colors">Organic Fruits & Produce</Link></li>
              <li><Link to="/search?q=Bakery" className="hover:text-primary transition-colors">Artisanal Hearth Bakery</Link></li>
              <li><Link to="/search?q=Pantry" className="hover:text-primary transition-colors">Wild Honey & Matcha</Link></li>
              <li><Link to="/search?q=Wellness" className="hover:text-primary transition-colors">Botanical Essential Oils</Link></li>
              <li><Link to="/search?q=Skincare" className="hover:text-primary transition-colors">Luxury Bio-Skincare</Link></li>
            </ul>
          </div>

          {/* Col 3: Voice Commands Help */}
          <div>
            <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider mb-4">
              Voice Shortcuts
            </h4>
            <ul className="space-y-2 text-[11px] text-on-surface-variant">
              <li className="bg-white/40 p-2 rounded-lg border border-white/60">"Add 2 Honeycrisp Apples"</li>
              <li className="bg-white/40 p-2 rounded-lg border border-white/60">"Find items under $15"</li>
              <li className="bg-white/40 p-2 rounded-lg border border-white/60">"Apply coupon LUMINA20"</li>
              <li className="bg-white/40 p-2 rounded-lg border border-white/60">"Take me to checkout"</li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
              Sanctuary Newsletter
            </h4>
            <p className="text-xs text-on-surface-variant">
              Receive seasonal farm harvest updates and private collection drops.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to Lumina updates!"); }} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                required
                className="glass-input text-xs py-2 px-3 flex-grow"
              />
              <button
                type="submit"
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-opacity-90 transition-all"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/60 flex flex-col sm:flex-row justify-between items-center text-xs text-on-surface-variant gap-4">
          <p>© {new Date().getFullYear()} LUMINA Luxury Grocery & Wellness. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#shipping" className="hover:text-primary transition-colors">Eco Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
