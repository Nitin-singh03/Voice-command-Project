import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { products } from "../data/products";
import { RecommendationService } from "../services/recommendationEngine";
import { GeminiVoiceAgent } from "../services/geminiAgent";
import { GroqVoiceAgent } from "../services/groqAgent";

const VoiceContext = createContext();

// Multi-language intent triggers from NLP engine
const INTENT_TABLE = {
  "en-US": {
    add: ["add", "i need", "i want to buy", "i want", "buy", "get", "put", "need", "order", "purchase"],
    remove: ["remove", "delete", "take off", "cancel", "clear"],
    search: ["find", "search", "look for", "show me", "find me", "show", "explore"],
    cart: ["move to cart page", "move to cart", "cart page", "go to cart", "open cart", "show cart", "view cart", "my cart", "shopping bag", "cart", "bag"],
    checkout: ["checkout", "place order", "proceed to checkout", "pay now", "checkout page", "payment"],
  },
  "es-ES": {
    add: ["añade", "añadir", "agregar", "necesito", "quiero comprar", "compra", "pon"],
    remove: ["quita", "elimina", "borra", "saca"],
    search: ["busca", "encuentra", "muestra", "ver"],
    cart: ["ir al carrito", "ver carrito", "abrir carrito", "mi bolsa", "carrito"],
    checkout: ["pagar", "comprar", "tramitar pedido"],
  },
  "hi-IN": {
    add: ["जोड़ो", "चाहिए", "खरीदना है", "ऐड करो", "डालो", "ले लो"],
    remove: ["हटाओ", "निकालो", "डिलीट करो", "कम करो"],
    search: ["खोजो", "ढूंढो", "दिखाओ", "सर्च करो"],
    cart: ["कार्ट खोलो", "कार्ट दिखाओ", "कार्ट पेज", "कार्ट में जाओ", "मेरी टोकरी", "कार्ट", "cart"],
    checkout: ["चेकआउट करो", "आर्डर करो", "पेमेंट करो", "चेकआउट"],
  },
  "ta-IN": {
    add: ["சேர்", "வேண்டும்", "வாங்க", "கூட்டு"],
    remove: ["நீக்கு", "அகற்று", "எடு"],
    search: ["தேடு", "காட்டு"],
    cart: ["கார்ட் திற", "பையை காட்டு", "கார்ட்"],
    checkout: ["ஆர்டர் செய்", "பணம் செலுத்து"],
  },
};

const NUMBER_WORDS = {
  one: 1, a: 1, an: 1, two: 2, couple: 2, three: 3, four: 4, five: 5,
  six: 6, "half dozen": 6, seven: 7, eight: 8, nine: 9, ten: 10, dozen: 12,
};

export function VoiceProvider({ children }) {
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    applyCoupon,
    cartCount,
    showToast,
    cartSubtotal,
    cartTotal,
    discountAmount,
    appliedCoupon,
    shippingFee,
    estimatedTax,
  } = useCart();

  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState('Tap the mic or try saying "add 2 Alphonso Mangoes" or "show summer fruits".');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [currentLang, setCurrentLang] = useState("en-US");
  const [supported, setSupported] = useState(true);

  // Wake Word ("Hello Lumina") Detection State
  const [wakeWordEnabled, setWakeWordEnabled] = useState(() => {
    return localStorage.getItem("lumina_wake_word") !== "false";
  });
  const [isWakeListening, setIsWakeListening] = useState(false);
  const wakeRecognitionRef = useRef(null);

  // Visible Multi-Turn Conversation History
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      role: "assistant",
      text: "Namaste! I am your Lumina Voice AI Assistant. You can speak in English or हिन्दी (Hindi). Say 'Hello Lumina' or tap the microphone.",
      time: "Just now",
    },
  ]);

  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const accumulatedFinalRef = useRef("");
  const isNavigatingRef = useRef(false);
  const voiceOverlayOpenRef = useRef(voiceOverlayOpen);
  const activeUtteranceRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  useEffect(() => {
    voiceOverlayOpenRef.current = voiceOverlayOpen;
  }, [voiceOverlayOpen]);

  // Luxury Harmonic Chime for Alexa-like Wake Activation (Web Audio API)
  const playWakeChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Ascending luxury chime: C5 -> E5 -> G5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.08);
      gain2.gain.setValueAtTime(0.14, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(783.99, now + 0.16);
      gain3.gain.setValueAtTime(0.18, now + 0.16);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.16);
      osc3.stop(now + 0.4);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }, []);

  const addMessage = useCallback((role, text) => {
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + "-" + Math.random().toString(36).substr(2, 4), role, text, time: timeStr },
    ]);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        text: "Conversation history cleared. Ready for your next shopping command!",
        time: "Just now",
      },
    ]);
  }, []);

  // Cache and load natural neural voices
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Pick the most natural, human-like neural voice available on the device/browser
  const getBestNaturalVoice = (lang, voices) => {
    if (!voices || voices.length === 0) return null;
    const isHindi = lang.startsWith("hi");

    if (isHindi) {
      const hiPriorities = [
        "Google हिन्दी",
        "Microsoft Swara Online (Natural) - Hindi (India)",
        "Microsoft Madhur Online (Natural) - Hindi (India)",
        "Lekha",
        "Hindi India",
      ];
      for (const name of hiPriorities) {
        const found = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      return voices.find((v) => v.lang.startsWith("hi")) || null;
    }

    // Top Natural English Neural Voices (Edge Natural / Chrome Google / Apple Enhanced)
    const enPriorities = [
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Google US English",
      "Google UK English Female",
      "Google UK English Male",
      "Samantha (Enhanced)",
      "Samantha",
      "Karen (Enhanced)",
      "Karen",
      "Serena",
      "Daniel (Enhanced)",
      "Daniel",
      "Microsoft Zira",
    ];

    for (const name of enPriorities) {
      const found = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
      if (found) return found;
    }

    // Fallback: any voice tagged as "natural" or "online"
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("online"))
    );
    if (naturalVoice) return naturalVoice;

    return voices.find((v) => v.lang === "en-US") || voices.find((v) => v.lang.startsWith("en")) || null;
  };

  // Detect language automatically from user text/speech (Hindi / Hinglish / English)
  const detectLanguage = (text) => {
    if (!text) return "en-US";
    // 1. Devanagari Unicode characters
    if (/[\u0900-\u097F]/.test(text)) return "hi-IN";

    // 2. Common Hindi / Hinglish phonetic keywords
    const hindiKeywords = /\b(kya|khaye|khana|banaye|jodo|daal|daalo|karo|batao|kitna|rupaye|namaste|aam|roti|sabji|chahiye|dikhao|khojo|mera|meri|mere|hai|hain|kaun|kaise|theek|dhanyawad|shukriya|bolo|le lo|kam karo|hatao|nikalo)\b/i;
    if (hindiKeywords.test(text)) return "hi-IN";

    return "en-US";
  };

  // Natural Speech Synthesis helper with dynamic language adaptation & guaranteed completion callback
  const speakText = useCallback((text, targetLang, onFinishedCallback) => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (voiceMuted || !("speechSynthesis" in window) || !text) {
      if (onFinishedCallback) onFinishedCallback();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const lang = targetLang || currentLang;

      // Clean speech text (strip markdown symbols like **, *, _, #, backticks)
      const cleanSpokenText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/#{1,6}\s?/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
      utterance.lang = lang;
      activeUtteranceRef.current = utterance; // Prevent garbage collection in Chrome

      const voiceList = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const bestVoice = getBestNaturalVoice(lang, voiceList);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Natural, warm conversational cadence
      utterance.rate = lang.startsWith("hi") ? 1.0 : 0.98;
      utterance.pitch = 1.02; // Warm, friendly tone
      utterance.volume = 1.0;

      let hasFinished = false;
      const handleFinish = () => {
        if (hasFinished) return;
        hasFinished = true;
        activeUtteranceRef.current = null;
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        setIsSpeaking(false);
        if (onFinishedCallback) onFinishedCallback();
      };

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = handleFinish;
      utterance.onerror = handleFinish;

      // Safety fallback timer in case speech synthesis engine misses onend (Chromium bug)
      const estimatedDurationMs = Math.max(2500, cleanSpokenText.split(/\s+/).length * 450 + 1000);
      speechTimeoutRef.current = setTimeout(handleFinish, estimatedDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failed", e);
      setIsSpeaking(false);
      if (onFinishedCallback) onFinishedCallback();
    }
  }, [voiceMuted, currentLang, availableVoices]);

  // Extract quantity & clean remainder
  const extractQuantity = (text) => {
    const numMatch = text.match(/\b(\d+)\b/);
    if (numMatch) return { qty: parseInt(numMatch[1], 10), rest: text.replace(numMatch[0], "").trim() };
    for (const word of Object.keys(NUMBER_WORDS)) {
      const re = new RegExp("\\b" + word + "\\b", "i");
      if (re.test(text)) return { qty: NUMBER_WORDS[word], rest: text.replace(re, "").trim() };
    }
    return { qty: 1, rest: text };
  };

  // Extract max price from natural query (e.g. "under $15", "less than 20")
  const extractPriceMax = (text) => {
    const m = text.match(/(?:under|less than|below|cheaper than|underneath)\s*\$?(\d+(?:\.\d+)?)/i);
    return m ? parseFloat(m[1]) : null;
  };

  // Clean noise words
  const cleanItemName = (text) => {
    return text
      .replace(/\b(what|are|the|products?|items?|in|my|cards?|cart|bag|basket|right|now|today|why|did|you|had|have|how|much|can|will|to|from|of|list|bottles?|bottle|tins?|jars?|packs?|loaves|loaf|pints?|boxes?|please|some|show|me|find)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

  // Match closest product
  const findProductMatch = (query) => {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    if (q.length < 3) return null;

    // 1. Exact match
    let match = products.find((p) => p.name.toLowerCase() === q);
    if (match) return match;

    // 2. Substring in name
    match = products.find((p) => q.includes(p.name.toLowerCase()) || (q.length > 4 && p.name.toLowerCase().includes(q)));
    if (match) return match;

    // 3. Exact Tag match
    match = products.find((p) => p.tags && p.tags.some((t) => t.toLowerCase() === q));
    if (match) return match;

    // 4. Multi-token score
    const stopWords = new Set(["what", "are", "the", "product", "products", "item", "items", "right", "now", "today", "with", "from", "that", "this", "your", "have"]);
    const qWords = q.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
    if (qWords.length === 0) return null;

    let bestScore = 0;
    let bestProd = null;

    products.forEach((p) => {
      const pNameLower = p.name.toLowerCase();
      let score = 0;
      qWords.forEach((w) => {
        if (pNameLower.includes(w)) score += 3.5;
        if (p.tags && p.tags.some((t) => t.toLowerCase() === w)) score += 2.5;
      });
      if (score > bestScore) {
        bestScore = score;
        bestProd = p;
      }
    });

    return bestScore >= 3.5 ? bestProd : null;
  };

  // Natural Language Command Processing Engine with Automatic Language Switching
  const processVoiceCommand = useCallback(async (rawCommand, langOverride) => {
    if (!rawCommand || !rawCommand.trim() || isProcessingRef.current) return;

    // Auto-detect language dynamically from the speech input
    let detectedLang = langOverride || detectLanguage(rawCommand);
    if (detectedLang !== currentLang) {
      setCurrentLang(detectedLang);
      if (recognitionRef.current) {
        recognitionRef.current.lang = detectedLang;
      }
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    setTranscript(rawCommand);
    setInterimTranscript("");
    addMessage("user", rawCommand);

    const respond = (replyText, targetLang, willNavigate = false) => {
      const finalLang = targetLang || detectedLang;
      setAssistantResponse(replyText);
      addMessage("assistant", replyText);

      // Speak text and auto-listen when speaking finishes (if not navigating away)
      speakText(replyText, finalLang, () => {
        if (!willNavigate && voiceOverlayOpenRef.current && !isNavigatingRef.current) {
          setTimeout(() => {
            if (voiceOverlayOpenRef.current && !isNavigatingRef.current) {
              startListening();
            }
          }, 250);
        }
      });
    };

    const orderSummary = {
      cartCount,
      subtotal: `$${(cartSubtotal || 0).toFixed(2)}`,
      appliedCoupon: appliedCoupon ? `${appliedCoupon.code} (${appliedCoupon.label})` : "None",
      discountAmount: `$${(discountAmount || 0).toFixed(2)}`,
      shippingFee: shippingFee === 0 ? "FREE ($0.00)" : `$${(shippingFee || 7.99).toFixed(2)}`,
      estimatedTax: `$${(estimatedTax || 0).toFixed(2)} (8.25%)`,
      totalAmount: `$${(cartTotal || 0).toFixed(2)}`,
    };

    try {
      // 1. Direct LLM Agent (Groq LPUs / Gemini 2.5 Flash with Real-Time Order Summary)
      let llmResult = null;

      // Try Groq First (Ultra-fast LPU inference)
      if (GroqVoiceAgent.hasApiKey()) {
        try {
          llmResult = await GroqVoiceAgent.processCommand(rawCommand, detectedLang, cart, messages, orderSummary);
        } catch (groqErr) {
          console.warn("Groq agent error, trying Gemini fallback:", groqErr);
        }
      }

      // If Groq didn't run or failed, try Gemini
      if (!llmResult && GeminiVoiceAgent.hasApiKey()) {
        try {
          llmResult = await GeminiVoiceAgent.processCommand(rawCommand, detectedLang, cart, messages, orderSummary);
        } catch (geminiErr) {
          console.warn("Gemini agent error, falling back to local engine:", geminiErr);
        }
      }

      if (llmResult) {
        const { detectedLang: modelDetectedLang, spokenResponse } = llmResult;

        if (modelDetectedLang && modelDetectedLang !== detectedLang) {
          detectedLang = modelDetectedLang;
          setCurrentLang(modelDetectedLang);
          if (recognitionRef.current) {
            recognitionRef.current.lang = modelDetectedLang;
          }
        }

        // Action queue for multi-task chaining in series
        const actionQueue = Array.isArray(llmResult.actions) && llmResult.actions.length > 0
          ? llmResult.actions
          : (llmResult.tool || llmResult.intent ? [llmResult] : []);

        let willNavigate = false;
        let navRoute = null;
        const addedItemSummaries = [];
        const removedItemSummaries = [];

        // Execute actions sequentially in series
        for (const actionObj of actionQueue) {
          const action = actionObj.tool || actionObj.intent;
          const { items, productName, quantity, searchQuery, maxPrice, couponCode, route } = actionObj;

          // MCP Tool: add_to_cart
          if (action === "add_to_cart") {
            if (Array.isArray(items) && items.length > 0) {
              items.forEach((it) => {
                const target = it.name || it;
                const qty = it.qty || quantity || 1;
                const matched = findProductMatch(target);
                if (matched) {
                  addToCart(matched, qty);
                  RecommendationService.logEvent(matched.name, "add", qty);
                  addedItemSummaries.push(`${qty > 1 ? `${qty}× ` : ""}${matched.name}`);
                }
              });
            } else if (productName) {
              const targetItems = productName.split(/,| and |\+/i).map((s) => s.trim()).filter(Boolean);
              targetItems.forEach((t) => {
                const matched = findProductMatch(t);
                if (matched) {
                  const qty = quantity || 1;
                  addToCart(matched, qty);
                  RecommendationService.logEvent(matched.name, "add", qty);
                  addedItemSummaries.push(`${qty > 1 ? `${qty}× ` : ""}${matched.name}`);
                }
              });
            }
          }

          // MCP Tool: remove_from_cart
          else if (action === "remove_from_cart") {
            const targetList = Array.isArray(items) && items.length > 0 ? items.map((i) => i.name || i) : (productName ? [productName] : []);
            targetList.forEach((t) => {
              const matched = findProductMatch(t);
              if (matched) {
                removeFromCart(matched.id);
                RecommendationService.logEvent(matched.name, "remove", 1);
                removedItemSummaries.push(matched.name);
              }
            });
          }

          // MCP Tool: apply_coupon
          else if (action === "apply_coupon") {
            applyCoupon(couponCode || "LUMINA20");
          }

          // MCP Tool: clear_cart
          else if (action === "clear_cart") {
            clearCart();
          }

          // MCP Tool: check_restock
          else if (action === "check_restock") {
            const cartItemNames = (cart || []).map((i) => i.name);
            const due = RecommendationService.computeDueForReorder(cartItemNames, 3);
            if (due && due.length > 0) {
              showToast(`Running low on: ${due[0].product.name}`, "info");
            }
          }

          // MCP Tool: search_catalog (deferred navigation)
          else if (action === "search_catalog") {
            willNavigate = true;
            const term = searchQuery || productName || "all";
            const priceQuery = maxPrice ? `&maxPrice=${maxPrice}` : "";
            navRoute = `/search?q=${encodeURIComponent(term)}${priceQuery}`;
          }

          // MCP Tool: navigate (deferred navigation)
          else if (action === "navigate" && route) {
            willNavigate = true;
            navRoute = route;
          }
        }

        // Execute deferred navigation if any step in the queue requested it
        if (willNavigate && navRoute) {
          isNavigatingRef.current = true;
          navigate(navRoute);
          setTimeout(() => setVoiceOverlayOpen(false), 1400);
        } else {
          isNavigatingRef.current = false;
        }

        const fallbackMsg = addedItemSummaries.length > 0
          ? `Added ${addedItemSummaries.join(" and ")} to your bag.`
          : (removedItemSummaries.length > 0 ? `Removed ${removedItemSummaries.join(" and ")} from your bag.` : "Processed your request.");

        const finalReply = spokenResponse || fallbackMsg;
        respond(finalReply, detectedLang, willNavigate);
        return;
      }

      // 2. Local Fallback Engine (when no API key or offline)
      const lower = rawCommand.toLowerCase().trim();
      const activeTable = INTENT_TABLE[lang] || INTENT_TABLE["en-US"];

      // 0a. Check for Greetings & Chitchat (NEVER search on greetings)
      const greetings = [
        "hello",
        "hi",
        "hey",
        "namaste",
        "नमस्ते",
        "good morning",
        "good evening",
        "good afternoon",
        "how are you",
        "who are you",
        "what can you do",
        "help",
        "thanks",
        "thank you",
        "shukriya",
        "dhanyawad",
        "धन्यवाद",
        "ok",
        "okay",
      ];
      if (greetings.some((g) => lower === g || lower.startsWith(g + " ") || lower.endsWith(" " + g))) {
        const isHindi = lang.startsWith("hi") || lower.includes("नमस्ते") || lower.includes("shukriya") || lower.includes("dhanyawad");
        const reply = isHindi
          ? "नमस्ते! लुमिना ग्रॉसरी में आपका स्वागत है। आप आम जोड़ने, सोरडो ब्रेड खोजने या पेंट्री स्टेटस पूछने के लिए कह सकते हैं।"
          : "Hello! Welcome to Lumina Organic Grocery. You can ask me to add items, search seasonal produce, or check your pantry restock.";
        respond(reply);
        setIsProcessing(false);
        return;
      }

      // 0b. Check for Order Financial Summary / Total Inquiries
      if (
        lower.includes("total amount") ||
        lower.includes("order summary") ||
        lower.includes("how much is total") ||
        lower.includes("what is my total") ||
        lower.includes("how much is delivery") ||
        lower.includes("delivery charge") ||
        lower.includes("kitna hua") ||
        lower.includes("kul rashi") ||
        lower.includes("total kitna")
      ) {
        const isHindi = lang.startsWith("hi") || lower.includes("kitna") || lower.includes("rashi");
        const msg = isHindi
          ? `आपका सबटोटल $${(cartSubtotal || 0).toFixed(2)} है, डिलीवरी शुल्क ${shippingFee === 0 ? "मुफ्त" : `$${(shippingFee || 7.99).toFixed(2)}`} है और टैक्स $${(estimatedTax || 0).toFixed(2)} है। कुल राशि $${(cartTotal || 0).toFixed(2)} है।`
          : `Your bag subtotal is $${(cartSubtotal || 0).toFixed(2)}, eco delivery is ${shippingFee === 0 ? "FREE" : `$${(shippingFee || 7.99).toFixed(2)}`}, and estimated tax is $${(estimatedTax || 0).toFixed(2)}, making your total amount $${(cartTotal || 0).toFixed(2)}.`;
        respond(msg);
        setIsProcessing(false);
        return;
      }

      // 0c. Check for Cart Contents Inquiries ("what are the products in my cart?", "what is in my bag?", "what is in my cards")
      if (
        lower.includes("in my cart") ||
        lower.includes("in my cards") ||
        lower.includes("in my bag") ||
        lower.includes("what is in my cart") ||
        lower.includes("products in my cart") ||
        lower.includes("products in my cards") ||
        lower.includes("what are the products in") ||
        lower.includes("what do i have in my cart") ||
        lower.includes("cart me kya hai") ||
        lower.includes("mere cart me")
      ) {
        if (cart && cart.length > 0) {
          const summary = cart.map((c) => `${c.qty}× ${c.name}`).join(", ");
          const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
          const reply = `You currently have ${summary} in your shopping bag, totaling $${total}.`;
          respond(reply);
        } else {
          respond("Your shopping bag is currently empty. Would you like to explore our fresh seasonal harvest?");
        }
        setIsProcessing(false);
        return;
      }

      // 0c. Check for General Questions / Inquiries ("why did you...", "how...", "what is...")
      if (
        lower.startsWith("why ") ||
        lower.startsWith("how ") ||
        lower.startsWith("what is ") ||
        lower.startsWith("tell me about ") ||
        lower.includes("why you")
      ) {
        respond("I suggested those items based on our fresh organic recipe pairings. Would you like me to add or remove anything?");
        setIsProcessing(false);
        return;
      }

      // 0d. Check for Meal / Recipe Suggestions ("what should I eat today?", "dinner ideas", "aaj kya khaye?")
      if (
        lower.includes("what should i eat") ||
        lower.includes("what to eat") ||
        lower.includes("dinner idea") ||
        lower.includes("meal idea") ||
        lower.includes("kya khaye") ||
        lower.includes("kya banaye") ||
        lower.includes("what to cook")
      ) {
        const isHindi = lang.startsWith("hi") || lower.includes("kya khaye") || lower.includes("kya banaye");
        const msg = isHindi
          ? "आज आप ताज़ा सोरडो ब्रेड (Artisanal Sourdough Boule) और फ्रेंच ट्रफल बटर ट्राई कर सकते हैं! क्या मैं इन्हें कार्ट में जोड़ दूँ?"
          : "How about freshly toasted Artisanal Sourdough Boule with French Black Truffle Cultured Butter? Would you like me to add them to your bag?";
        respond(msg);
        setIsProcessing(false);
        return;
      }

      // 0e. Check for Multi-Turn Affirmation ("yes", "add it", "sure", "add them", "yes please", "ha jodo")
      const affirmations = ["yes", "add it", "add them", "sure", "yes please", "yeah", "yep", "ha", "haan", "ha jodo", "daal do", "add karo", "theek hai"];
      if (affirmations.some((a) => lower === a || lower.startsWith(a + " "))) {
        // Find the last assistant message to extract offered items
        const lastAsstMsg = [...(messages || [])].reverse().find((m) => m.role === "assistant" && m.text);
        if (lastAsstMsg) {
          // ONLY match exact products mentioned in the assistant's previous message
          const matched = products.filter((p) => lastAsstMsg.text.toLowerCase().includes(p.name.toLowerCase()));

          if (matched.length === 0) {
            if (lastAsstMsg.text.includes("Sourdough")) {
              const p = products.find((x) => x.name.includes("Sourdough"));
              if (p) matched.push(p);
            }
            if (lastAsstMsg.text.includes("Truffle Butter") || lastAsstMsg.text.includes("Butter")) {
              const p = products.find((x) => x.name.includes("Truffle") || x.name.includes("Butter"));
              if (p) matched.push(p);
            }
            if (lastAsstMsg.text.includes("Mango")) {
              const p = products.find((x) => x.name.includes("Mango"));
              if (p) matched.push(p);
            }
          }

          if (matched.length > 0) {
            matched.forEach((p) => {
              addToCart(p, 1);
              RecommendationService.logEvent(p.name, "add", 1);
            });
            const names = matched.map((p) => p.name).join(" and ");
            const msg = `Added ${names} to your bag!`;
            respond(msg);
            setIsProcessing(false);
            return;
          }
        }
      }

      // 0f. Check for "running low" / reorder / shopping history recommendations
      if (
        lower.includes("running low") ||
        lower.includes("reorder") ||
        lower.includes("what do i need") ||
        lower.includes("recommend") ||
        lower.includes("suggestion") ||
        lower.includes("suggest") ||
        lower.includes("what to buy")
      ) {
        const cartItemNames = (cart || []).map((i) => i.name);
        const due = RecommendationService.computeDueForReorder(cartItemNames, 3);
        if (due && due.length > 0) {
          const topItem = due[0].product.name;
          const secondItem = due[1] ? ` and ${due[1].product.name}` : "";
          const msg = `Based on your shopping history, it looks like you're running low on ${topItem}${secondItem}. Would you like me to add them?`;
          respond(msg);
          showToast(`Running low on: ${topItem}${secondItem}`, "info");
        } else {
          const msg = "You are stocked up on your usual staples! For this season, I recommend our Royal Alphonso Mangoes and Artisanal Sourdough Boule.";
          respond(msg);
        }
        setIsProcessing(false);
        return;
      }

      // 1. Check for Coupon / Promo Code intent
      if (lower.includes("coupon") || lower.includes("promo") || lower.includes("discount") || lower.includes("lumina20")) {
        applyCoupon("LUMINA20");
        const msg = "Promo code LUMINA20 applied for 20% discount!";
        respond(msg);
        setIsProcessing(false);
        return;
      }

      // 2. Check for Navigation: Cart
      if (
        activeTable.cart.some((p) => lower.includes(p)) ||
        lower.includes("to cart") ||
        lower.includes("cart page") ||
        lower.includes("move to cart") ||
        lower.includes("go to cart") ||
        lower.includes("open cart") ||
        lower.includes("show cart")
      ) {
        const msg = `Opening your shopping bag with ${cartCount} items.`;
        respond(msg);
        navigate("/cart");
        setTimeout(() => setVoiceOverlayOpen(false), 1400);
        setIsProcessing(false);
        return;
      }

      // 3. Check for Navigation: Checkout
      if (activeTable.checkout.some((p) => lower.includes(p))) {
        const msg = "Proceeding to checkout.";
        respond(msg);
        navigate("/cart?checkout=true");
        setTimeout(() => setVoiceOverlayOpen(false), 1400);
        setIsProcessing(false);
        return;
      }

      // 4. Check for Navigation: Home / Wishlist
      if (lower.includes("go home") || lower.includes("home") || lower.includes("inicio")) {
        const msg = "Returning to Lumina Home.";
        respond(msg);
        navigate("/");
        setTimeout(() => setVoiceOverlayOpen(false), 1200);
        setIsProcessing(false);
        return;
      }

      if (lower.includes("wishlist") || lower.includes("favorites") || lower.includes("favoritos")) {
        const msg = "Opening your saved wishlist.";
        respond(msg);
        navigate("/wishlist");
        setTimeout(() => setVoiceOverlayOpen(false), 1200);
        setIsProcessing(false);
        return;
      }

      // 5. Check for Seasonal Search Intent (e.g. "summer fruits", "monsoon specials", "winter items", "spring harvest")
      const seasonalWords = ["summer", "winter", "monsoon", "spring", "autumn", "festive", "seasonal"];
      const foundSeason = seasonalWords.find((s) => lower.includes(s));
      if (foundSeason && (lower.includes("show") || lower.includes("find") || lower.includes("explore") || lower.includes("special") || lower.includes("harvest") || lower.includes("dikhao") || lower.includes("khojo"))) {
        const msg = `Showing curated ${foundSeason} collection.`;
        respond(msg);
        navigate(`/search?q=${encodeURIComponent(foundSeason)}`);
        setTimeout(() => setVoiceOverlayOpen(false), 1400);
        setIsProcessing(false);
        return;
      }

      // 6. Check for Remove Intent
      const removeMatch = activeTable.remove.find((p) => lower.startsWith(p) || lower.includes(" " + p));
      if (removeMatch) {
        const remainder = lower.replace(removeMatch, "").trim();
        const cleanItem = cleanItemName(remainder);
        const matched = findProductMatch(cleanItem);
        if (matched) {
          removeFromCart(matched.id);
          RecommendationService.logEvent(matched.name, "remove", 1);
          const msg = `Removed "${matched.name}" from your bag.`;
          respond(msg);
        } else {
          const msg = `Could not find "${cleanItem}" in your bag.`;
          respond(msg);
        }
        setIsProcessing(false);
        return;
      }

      // 7. Check for Price Filter (e.g. "find apples under 10 dollars")
      const priceMax = extractPriceMax(lower);
      if (priceMax !== null) {
        let topic = lower.replace(/(?:find|search|show|items|products|under|less than|below|cheaper than|\$|\d+(?:\.\d+)?|dollars|euros|rupees)/gi, "").trim();
        topic = cleanItemName(topic);
        const searchTerm = topic || "all";
        const msg = `Showing products under $${priceMax}.`;
        respond(msg);
        navigate(`/search?q=${encodeURIComponent(searchTerm)}&maxPrice=${priceMax}`);
        setTimeout(() => setVoiceOverlayOpen(false), 1500);
        setIsProcessing(false);
        return;
      }

      // 8. Check for Explicit Search Intent
      const searchMatch = activeTable.search.find((p) => lower.startsWith(p) || lower.includes(" " + p));
      if (searchMatch) {
        const searchTarget = cleanItemName(lower.slice(lower.indexOf(searchMatch) + searchMatch.length));
        const msg = `Searching for "${searchTarget || "products"}"...`;
        respond(msg);
        navigate(`/search?q=${encodeURIComponent(searchTarget || "all")}`);
        setTimeout(() => setVoiceOverlayOpen(false), 1500);
        setIsProcessing(false);
        return;
      }

      // 9. Check for Explicit Add Intent (ONLY add if user explicitly asked to add or named an exact product)
      const addMatch = activeTable.add.find((p) => lower.startsWith(p) || lower.includes(" " + p));
      let rawItem = lower;
      if (addMatch) {
        rawItem = lower.slice(lower.indexOf(addMatch) + addMatch.length).trim();
        const { qty, rest } = extractQuantity(rawItem);
        const cleaned = cleanItemName(rest);

        const matchedProduct = findProductMatch(cleaned || rest);
        if (matchedProduct) {
          addToCart(matchedProduct, qty);
          RecommendationService.logEvent(matchedProduct.name, "add", qty);
          const msg = `Added ${qty > 1 ? `${qty}× ` : ""}${matchedProduct.name} ($${(matchedProduct.price * qty).toFixed(2)}) to your bag.`;
          respond(msg);

          const subs = RecommendationService.getSubstitutes(matchedProduct.name);
          if (subs.length > 0) {
            setTimeout(() => {
              showToast(`💡 Also pairs nicely with: ${subs[0].name}`, "info");
            }, 1500);
          }
          setIsProcessing(false);
          return;
        }
      }

      // Fallback: If user just said an exact product name alone (e.g. "Royal Alphonso Mangoes")
      const directExactMatch = products.find((p) => p.name.toLowerCase() === lower.trim());
      if (directExactMatch) {
        addToCart(directExactMatch, 1);
        RecommendationService.logEvent(directExactMatch.name, "add", 1);
        const msg = `Added ${directExactMatch.name} to your bag.`;
        respond(msg);
        setIsProcessing(false);
        return;
      }

      // Unrecognized phrase response (do NOT add anything)
      const msg = `I didn't recognize a shopping command. Try saying "Add 2 Alphonso Mangoes", "What is in my cart?", or "Show summer fruits".`;
      respond(msg);
    } catch (err) {
      console.error("Command processing error:", err);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [addToCart, removeFromCart, clearCart, applyCoupon, cartCount, currentLang, navigate, speakText, showToast, addMessage, messages, cart, cartSubtotal, cartTotal, discountAmount, appliedCoupon, shippingFee, estimatedTax]);

  // Speech Recognition listener
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
        accumulatedFinalRef.current = "";
      };

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulatedFinalRef.current += " " + event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim.trim());
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          showToast("Microphone permission denied. Use suggestion chips or text fallback!", "info");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalPhrase = accumulatedFinalRef.current.trim();
        accumulatedFinalRef.current = "";
        if (finalPhrase) {
          processVoiceCommand(finalPhrase, currentLang);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Failed to initialize speech recognition", e);
      setSupported(false);
    }
  }, [currentLang, processVoiceCommand, showToast]);

  // Background Alexa-like Wake Word ("Hello Lumina" / "Hey Lumina" / "हे लुमिना") Detection
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !wakeWordEnabled || voiceOverlayOpen) {
      if (wakeRecognitionRef.current) {
        try {
          wakeRecognitionRef.current.stop();
        } catch {
          // ignore
        }
        wakeRecognitionRef.current = null;
      }
      setIsWakeListening(false);
      return;
    }

    let isSubscribed = true;
    let wakeRecognition = null;

    try {
      wakeRecognition = new SpeechRecognition();
      wakeRecognition.continuous = true;
      wakeRecognition.interimResults = true;
      wakeRecognition.lang = currentLang;

      wakeRecognition.onstart = () => {
        if (isSubscribed) setIsWakeListening(true);
      };

      wakeRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript.toLowerCase().trim();

          const wakeRegex = /(?:hello|hey|hi|ok|okay|namaste)?\s*lumina\b|हे\s*लुमिना|हेलो\s*लुमिना|\bलुमिना\b/i;
          const match = text.match(wakeRegex);

          if (match) {
            playWakeChime();

            // Extract any phrase spoken immediately following the wake word
            const remainder = text.slice(match.index + match[0].length).replace(/^[,.\s-]+/, "").trim();

            try {
              wakeRecognition.stop();
            } catch {
              // ignore
            }

            setVoiceOverlayOpen(true);

            if (remainder.length > 2) {
              setTimeout(() => {
                processVoiceCommand(remainder, currentLang);
              }, 300);
            } else {
              setTimeout(() => {
                startListening();
              }, 250);
            }
            return;
          }
        }
      };

      wakeRecognition.onerror = (e) => {
        if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("Wake word listener notice:", e.error);
        }
      };

      wakeRecognition.onend = () => {
        if (isSubscribed && wakeWordEnabled && !voiceOverlayOpenRef.current) {
          setTimeout(() => {
            if (isSubscribed && wakeWordEnabled && !voiceOverlayOpenRef.current) {
              try {
                wakeRecognition?.start();
              } catch {
                // ignore
              }
            }
          }, 600);
        } else {
          setIsWakeListening(false);
        }
      };

      wakeRecognition.start();
      wakeRecognitionRef.current = wakeRecognition;
    } catch (e) {
      console.warn("Wake word recognition init failed:", e);
    }

    return () => {
      isSubscribed = false;
      if (wakeRecognition) {
        try {
          wakeRecognition.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [wakeWordEnabled, voiceOverlayOpen, currentLang, playWakeChime, processVoiceCommand]);

  const startListening = () => {
    isNavigatingRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    setAssistantResponse("Listening... speak your shopping command.");
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLang;
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const openVoiceModal = () => {
    setVoiceOverlayOpen(true);
    setTimeout(() => startListening(), 250);
  };

  const toggleWakeWord = () => {
    setWakeWordEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("lumina_wake_word", next.toString());
      return next;
    });
  };

  return (
    <VoiceContext.Provider
      value={{
        voiceOverlayOpen,
        setVoiceOverlayOpen,
        openVoiceModal,
        isListening,
        startListening,
        stopListening,
        toggleListening,
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
        speakText,
        messages,
        clearHistory,
        wakeWordEnabled,
        setWakeWordEnabled,
        toggleWakeWord,
        isWakeListening,
        playWakeChime,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
