import { useState } from "react";
import { useVoice } from "../context/VoiceContext";

const CHIPS_BY_LANG = {
  "en-US": [
    { label: '🛒 "Add 2 Honeycrisp Apples"', cmd: "Add 2 Honeycrisp Apples to cart" },
    { label: '✨ "Add Aura Essence"', cmd: "Add Aura Revitalizing Essence to cart" },
    { label: '💰 "Find fruits under $10"', cmd: "Find fruits under 10 dollars" },
    { label: '🍞 "Add Sourdough Boule"', cmd: "Add Artisanal Sourdough Boule" },
    { label: '🎁 "Apply coupon LUMINA20"', cmd: "Apply coupon LUMINA20" },
    { label: '🍵 "Search Matcha"', cmd: "Search Matcha" },
    { label: '🛍️ "Go to cart"', cmd: "Go to cart" },
  ],
  "es-ES": [
    { label: '🛒 "Añade 2 manzanas"', cmd: "Añade 2 Honeycrisp Apples" },
    { label: '🍞 "Añade pan artesanal"', cmd: "Añade Artisanal Sourdough Boule" },
    { label: '💰 "Busca frutas bajo $10"', cmd: "Busca frutas under 10 dollars" },
    { label: '🛍️ "Ir al carrito"', cmd: "Ir al carrito" },
  ],
  "hi-IN": {
    chips: [
      { label: '🛒 "2 सेब जोड़ो"', cmd: "2 Honeycrisp Apples जोड़ो" },
      { label: '🍞 "ब्रेड कार्ट में डालो"', cmd: "Artisanal Sourdough Boule जोड़ो" },
      { label: '💰 "10 डॉलर से कम का सामान खोजो"', cmd: "fruits under 10 dollars" },
      { label: '🛍️ "कार्ट खोलो"', cmd: "कार्ट खोलो" },
    ],
  },
  "ta-IN": {
    chips: [
      { label: '🛒 "ஆப்பிள் சேர்"', cmd: "Honeycrisp Apples சேர்" },
      { label: '🍞 "ரொட்டி சேர்"', cmd: "Artisanal Sourdough Boule சேர்" },
      { label: '🛍️ "கார்ட் திற"', cmd: "கார்ட் திற" },
    ],
  },
};

export default function VoiceOverlay() {
  const {
    voiceOverlayOpen,
    setVoiceOverlayOpen,
    isListening,
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    assistantResponse,
    isSpeaking,
    isProcessing,
    supported,
    voiceMuted,
    setVoiceMuted,
    currentLang,
    setCurrentLang,
    processVoiceCommand,
  } = useVoice();

  const [typedInput, setTypedInput] = useState("");

  if (!voiceOverlayOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (typedInput.trim()) {
      processVoiceCommand(typedInput.trim(), currentLang);
      setTypedInput("");
    }
  };

  const handleChipClick = (cmd) => {
    processVoiceCommand(cmd, currentLang);
  };

  const getActiveChips = () => {
    const data = CHIPS_BY_LANG[currentLang];
    if (Array.isArray(data)) return data;
    if (data && data.chips) return data.chips;
    return CHIPS_BY_LANG["en-US"];
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-md p-4 animate-fadeIn"
      onClick={() => {
        stopListening();
        setVoiceOverlayOpen(false);
      }}
    >
      <div
        className="glass-modal p-6 md:p-8 rounded-3xl flex flex-col items-center text-center ambient-shadow max-w-lg w-full relative border border-white/80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls: Lang & Settings */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold tracking-wider uppercase text-primary">Lumina AI Voice Agent</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="bg-white/60 border border-white/80 rounded-lg text-xs font-semibold px-2.5 py-1 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
              <option value="ta-IN">தமிழ் (Tamil)</option>
            </select>

            <button
              onClick={() => setVoiceMuted(!voiceMuted)}
              title={voiceMuted ? "Unmute Voice Response" : "Mute Voice Response"}
              className="p-1.5 rounded-full hover:bg-white/60 text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {voiceMuted ? "volume_off" : "volume_up"}
              </span>
            </button>

            <button
              onClick={() => {
                stopListening();
                setVoiceOverlayOpen(false);
              }}
              className="p-1.5 rounded-full hover:bg-white/60 text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Dynamic Glowing Mic Button */}
        <div className="relative my-3 flex items-center justify-center">
          {isListening && (
            <div className="absolute w-28 h-28 rounded-full bg-primary/20 pulse-ring pointer-events-none" />
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? "bg-gradient-to-tr from-primary to-purple-600 text-white scale-110 shadow-primary/40 ring-4 ring-primary/30"
                : "bg-white/80 text-primary hover:bg-white hover:scale-105 border border-primary/20"
            }`}
          >
            <span className="material-symbols-outlined text-3xl">
              {isListening ? "mic" : "mic_none"}
            </span>
          </button>
        </div>

        {/* Dynamic Voice Bars */}
        <div className="flex items-end justify-center h-7 mb-3">
          <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-2 animate-none" : ""}`} />
          <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-4 animate-none" : ""}`} />
          <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-6 animate-none" : ""}`} />
          <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-4 animate-none" : ""}`} />
          <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-2 animate-none" : ""}`} />
        </div>

        {/* Live Hearing Transcript / Assistant Feedback */}
        <div className="min-h-[64px] w-full flex flex-col items-center justify-center px-3 mb-3">
          {isListening ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] uppercase font-bold tracking-widest text-primary animate-pulse">
                Hearing your voice in {currentLang.split("-")[0].toUpperCase()}...
              </span>
              <p className="text-sm md:text-base font-medium text-on-surface italic">
                {interimTranscript || transcript || 'Speak now: "Add organic apples" or "Search skincare"'}
              </p>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-2 text-primary font-medium text-xs">
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              <span>Thinking & processing your instruction...</span>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 w-full text-left">
              <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_awesome</span> Lumina AI Response
              </p>
              <p className="text-xs md:text-sm font-medium text-on-surface">
                {assistantResponse}
              </p>
            </div>
          )}
        </div>

        {!supported && (
          <div className="mb-3 text-[11px] text-amber-800 bg-amber-50/80 px-3 py-1 rounded-lg border border-amber-200">
            Native Speech API not detected in this browser. Use suggestion chips or text fallback!
          </div>
        )}

        {/* Intelligent Suggestion Chips */}
        <div className="w-full text-left mt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mb-2 px-1">
            Tap a quick command:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {getActiveChips().map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(item.cmd)}
                className="glass-button text-[11px] py-1.5 px-3 rounded-full text-on-surface hover:text-primary hover:border-primary/50 transition-all text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Fallback Input */}
        <form onSubmit={handleManualSubmit} className="w-full mt-3.5 flex gap-2">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder='Or type "add 2 apples" / "find items under $10"...'
            className="glass-input text-xs py-2 px-3.5 rounded-full flex-grow text-on-surface"
          />
          <button
            type="submit"
            className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-opacity-90 transition-all flex items-center gap-1 shadow-md"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
