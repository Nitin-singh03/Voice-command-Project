import { useState, useRef, useEffect } from "react";
import { useVoice } from "../context/VoiceContext";
import { GeminiVoiceAgent } from "../services/geminiAgent";

const CHIPS_BY_LANG = {
  "en-US": [
    { label: '"Am I running low on bread?"', cmd: "Am I running low on bread?" },
    { label: '"What do I need to reorder?"', cmd: "What do I need to reorder?" },
    { label: '"Add 2 Alphonso Mangoes"', cmd: "Add 2 Royal Alphonso Mangoes" },
    { label: '"Show summer fruits"', cmd: "Show summer fruits" },
    { label: '"Add Sourdough Boule"', cmd: "Add Artisanal Sourdough Boule" },
    { label: '"Add French Truffle Butter"', cmd: "Add French Black Truffle Cultured Butter" },
    { label: '"Find items under $10"', cmd: "Find items under 10 dollars" },
    { label: '"Apply coupon LUMINA20"', cmd: "Apply coupon LUMINA20" },
    { label: '"Go to cart"', cmd: "Go to cart" },
  ],
  "hi-IN": [
    { label: '"2 आम कार्ट में जोड़ो"', cmd: "2 Royal Alphonso Mangoes जोड़ो" },
    { label: '"सोरडो ब्रेड जोड़ो"', cmd: "Artisanal Sourdough Boule जोड़ो" },
    { label: '"क्या ब्रेड खत्म हो रही है?"', cmd: "Am I running low on bread?" },
    { label: '"मसाला चाय जोड़ो"', cmd: "Monsoon Herbal Spiced Chai Blend जोड़ो" },
    { label: '"ताज़ा फल दिखाओ"', cmd: "Show fruits" },
    { label: '"10 डॉलर से कम का सामान खोजो"', cmd: "items under 10 dollars" },
    { label: '"कूपन LUMINA20 लगाओ"', cmd: "Apply coupon LUMINA20" },
    { label: '"कार्ट खोलो"', cmd: "कार्ट खोलो" },
  ],
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
    messages,
    clearHistory,
  } = useVoice();

  const [typedInput, setTypedInput] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(GeminiVoiceAgent.getApiKey());
  const chatScrollRef = useRef(null);
  const hasGeminiKey = GeminiVoiceAgent.hasApiKey();

  // Auto-scroll chat history on new message or transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript, transcript, isProcessing]);

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

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    GeminiVoiceAgent.setApiKey(apiKeyInput);
    setShowKeyModal(false);
  };

  const getActiveChips = () => {
    const data = CHIPS_BY_LANG[currentLang];
    if (Array.isArray(data)) return data;
    return CHIPS_BY_LANG["en-US"];
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-3 sm:p-4 animate-fadeIn"
      onClick={() => {
        stopListening();
        setVoiceOverlayOpen(false);
      }}
    >
      <div
        className="glass-modal p-5 sm:p-7 rounded-3xl flex flex-col items-center ambient-shadow max-w-xl w-full relative border border-white/80 shadow-2xl bg-white/95 max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls: Model Badge, Lang & Actions */}
        <div className="w-full flex justify-between items-center mb-3 pb-2.5 border-b border-stone-200/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-primary border border-purple-200 text-[11px] font-bold transition-all shadow-2xs"
              title="Configure Google Gemini 2.5 Flash API"
            >
              <span className="material-symbols-outlined text-xs text-primary">auto_awesome</span>
              <span>{hasGeminiKey ? "Gemini 2.5 Flash" : "Gemini AI Ready"}</span>
              <span className="material-symbols-outlined text-[10px]">settings</span>
            </button>

            {messages && messages.length > 1 && (
              <button
                onClick={clearHistory}
                className="text-[10px] text-stone-400 hover:text-rose-500 transition-colors flex items-center gap-0.5"
                title="Clear conversation history"
              >
                <span className="material-symbols-outlined text-xs">delete_sweep</span>
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg text-xs font-semibold px-2 py-1 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="en-US">English (US)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
            </select>

            <button
              onClick={() => setVoiceMuted(!voiceMuted)}
              title={voiceMuted ? "Unmute Voice Response" : "Mute Voice Response"}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
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
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Drawer */}
        {showKeyModal && (
          <form onSubmit={handleSaveApiKey} className="w-full bg-purple-50/80 border border-purple-200/80 rounded-2xl p-3 mb-3 text-left animate-fadeIn flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">key</span>
                Google Gemini 2.5 Flash Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary underline font-medium"
              >
                Get Free API Key →
              </a>
            </div>
            <p className="text-[10px] text-stone-600 mb-2">
              Paste your free Google AI Studio key below for real-time conversational reasoning in Hindi and English.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="glass-input text-xs py-1.5 px-3 bg-white"
              />
              <button
                type="submit"
                className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm hover:bg-opacity-90"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* 1. VISIBLE MULTI-TURN CONVERSATION CHAT STREAM */}
        <div
          ref={chatScrollRef}
          className={`w-full flex-grow overflow-y-auto space-y-2.5 pr-1.5 mb-3 text-left transition-all duration-300 ${
            messages && messages.length > 1 || isListening
              ? "max-h-[320px] sm:max-h-[360px]"
              : "max-h-[220px] sm:max-h-[240px]"
          }`}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-[82%] text-xs md:text-sm leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-xs ml-auto shadow-primary/15"
                    : "bg-stone-100/90 text-stone-800 border border-stone-200/60 rounded-tl-xs"
                }`}
              >
                <p className="font-medium">{msg.text}</p>
                {msg.time && (
                  <span
                    className={`text-[9px] block mt-1 ${
                      msg.role === "user" ? "text-white/70 text-right" : "text-stone-400"
                    }`}
                  >
                    {msg.time}
                  </span>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
              )}
            </div>
          ))}

          {/* Live Interim Speech Bubble while speaking */}
          {isListening && (interimTranscript || transcript) && (
            <div className="flex items-start gap-2.5 justify-end animate-fadeIn">
              <div className="p-3 rounded-2xl max-w-[82%] text-xs md:text-sm bg-primary/80 text-white italic rounded-tr-xs border border-white/40 shadow-sm">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block mb-0.5">
                  Listening...
                </span>
                <p>{interimTranscript || transcript}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <span className="material-symbols-outlined text-sm">mic</span>
              </div>
            </div>
          )}

          {/* Premium Animated Thinking State */}
          {isProcessing && (
            <div className="flex items-start gap-2.5 justify-start animate-fadeIn">
              <div className="w-7 h-7 rounded-full bg-purple-500/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-200">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/90 text-stone-700 border border-purple-100 shadow-xs flex items-center gap-2 rounded-tl-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                </div>
                <span className="text-xs font-semibold text-primary">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Dynamic Glowing Mic Button & Audio Equalizer Bars */}
        <div className="flex items-center justify-center gap-4 my-1 flex-shrink-0">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div className="absolute w-20 h-20 rounded-full bg-primary/20 pulse-ring pointer-events-none" />
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isListening
                  ? "bg-gradient-to-tr from-primary to-purple-600 text-white scale-108 shadow-primary/40 ring-4 ring-primary/30"
                  : "glass-btn-primary text-white hover:scale-105"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {isListening ? "mic" : "mic_none"}
              </span>
            </button>
          </div>

          {/* Mini Equalizer */}
          <div className="flex items-end justify-center h-6">
            <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-1.5 animate-none" : ""}`} />
            <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-3.5 animate-none" : ""}`} />
            <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-5 animate-none" : ""}`} />
            <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-3.5 animate-none" : ""}`} />
            <div className={`voice-bar ${!isListening && !isSpeaking ? "opacity-30 !h-1.5 animate-none" : ""}`} />
          </div>
        </div>

        {!supported && (
          <div className="my-1.5 text-[11px] text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
            Microphone speech API not supported. Use quick chips or type below!
          </div>
        )}

        {/* 3. Intelligent Suggestion Chips - Only shown on initial screen before user starts talking */}
        {!isListening && messages && messages.length <= 1 && (
          <div className="w-full text-left mt-2 flex-shrink-0 animate-fadeIn">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 px-0.5">
              Suggested commands:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {getActiveChips().map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(item.cmd)}
                  className="glass-button text-[11px] py-1 px-2.5 rounded-full text-stone-700 hover:text-primary hover:border-primary/50 transition-all text-left bg-white/80"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Manual Fallback Form Input */}
        <form onSubmit={handleManualSubmit} className="w-full mt-2.5 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder='Ask or command in English or हिन्दी...'
            className="glass-input text-xs py-2 px-3.5 rounded-full flex-grow text-on-surface bg-white/90"
          />
          <button
            type="submit"
            className="glass-btn-primary px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
