import { useVoice } from "../context/VoiceContext";

export default function VoiceFab() {
  const { openVoiceModal, isListening } = useVoice();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <span className="mr-3 px-3 py-1.5 rounded-full glass-card text-xs font-semibold text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden sm:inline-block border border-white/70">
        ✨ Talk to Lumina AI
      </span>
      <button
        onClick={openVoiceModal}
        aria-label="Activate Voice Assistant"
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110 relative ${
          isListening
            ? "bg-gradient-to-tr from-purple-600 to-pink-500 text-white pulse-glow ring-4 ring-primary/40"
            : "bg-primary text-white hover:bg-primary/90 shadow-primary/30 ring-2 ring-white/60"
        }`}
      >
        <span className="material-symbols-outlined text-2xl">
          {isListening ? "graphic_eq" : "mic"}
        </span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
        </span>
      </button>
    </div>
  );
}
