import { useVoice } from "../context/VoiceContext";

export default function VoiceFab() {
  const { openVoiceModal, isListening, isWakeListening } = useVoice();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <span className="mr-3 px-3.5 py-1.5 rounded-full glass-modal text-xs font-bold text-primary shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden sm:inline-block border border-white/90">
        Say &ldquo;Hello Lumina&rdquo; or click
      </span>
      <button
        onClick={openVoiceModal}
        aria-label="Activate Voice Assistant (or say Hello Lumina)"
        title="Say 'Hello Lumina' or click to activate Voice AI"
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110 relative ${
          isListening
            ? "bg-gradient-to-tr from-purple-600 via-primary to-pink-500 text-white pulse-glow ring-4 ring-primary/40"
            : "glass-btn-primary text-white shadow-primary/40 ring-2 ring-white/80"
        }`}
      >
        <span className="material-symbols-outlined text-2xl">
          {isListening ? "graphic_eq" : "mic"}
        </span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
}
