import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { products } from "../data/products";
import { RecommendationService } from "../services/recommendationEngine";

const VoiceContext = createContext();

// Multi-language intent triggers from NLP engine
const INTENT_TABLE = {
  "en-US": {
    add: ["add", "i need", "i want to buy", "i want", "buy", "get", "put", "need", "order", "purchase"],
    remove: ["remove", "delete", "take off", "cancel", "clear"],
    search: ["find", "search", "look for", "show me", "find me", "show", "explore"],
    cart: ["go to cart", "open cart", "show cart", "view cart", "my cart", "shopping bag"],
    checkout: ["checkout", "place order", "proceed to checkout", "pay now"],
  },
  "es-ES": {
    add: ["añade", "añadir", "agregar", "necesito", "quiero comprar", "compra", "pon"],
    remove: ["quita", "elimina", "borra", "saca"],
    search: ["busca", "encuentra", "muestra", "ver"],
    cart: ["ir al carrito", "ver carrito", "abrir carrito", "mi bolsa"],
    checkout: ["pagar", "comprar", "tramitar pedido"],
  },
  "hi-IN": {
    add: ["जोड़ो", "चाहिए", "खरीदना है", "ऐड करो", "डालो", "ले लो"],
    remove: ["हटाओ", "निकालो", "डिलीट करो", "कम करो"],
    search: ["खोजो", "ढूंढो", "दिखाओ", "सर्च करो"],
    cart: ["कार्ट खोलो", "कार्ट दिखाओ", "मेरी टोकरी"],
    checkout: ["चेकआउट करो", "आर्डर करो", "पेमेंट करो"],
  },
  "ta-IN": {
    add: ["சேர்", "வேண்டும்", "வாங்க", "கூட்டு"],
    remove: ["நீக்கு", "அகற்று", "எடு"],
    search: ["தேடு", "காட்டு"],
    cart: ["கார்ட் திற", "பையை காட்டு"],
    checkout: ["ஆர்டர் செய்", "பணம் செலுத்து"],
  },
};

const NUMBER_WORDS = {
  one: 1, a: 1, an: 1, two: 2, couple: 2, three: 3, four: 4, five: 5,
  six: 6, "half dozen": 6, seven: 7, eight: 8, nine: 9, ten: 10, dozen: 12,
};

export function VoiceProvider({ children }) {
  const navigate = useNavigate();
  const { addToCart, removeFromCart, clearCart, applyCoupon, cartCount, showToast } = useCart();

  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [assistantResponse, setAssistantResponse] = useState('Tap the mic or try saying "add 2 apples" or "find items under $10".');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [currentLang, setCurrentLang] = useState("en-US");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Speech Synthesis helper
  const speakText = useCallback((text) => {
    if (voiceMuted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failed", e);
    }
  }, [voiceMuted, currentLang]);

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
      .replace(/\b(to|from|of|my|the|list|bag|cart|bottles?|bottle|tins?|jars?|packs?|loaves|loaf|pints?|boxes?|please|some|items?|products?)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

  // Match closest product
  const findProductMatch = (query) => {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    let match = products.find((p) => p.name.toLowerCase() === q);
    if (match) return match;

    match = products.find((p) => q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q));
    if (match) return match;

    const qWords = q.split(/\s+/).filter((w) => w.length > 2);
    let bestScore = 0;
    let bestProd = null;

    products.forEach((p) => {
      const pNameLower = p.name.toLowerCase();
      let score = 0;
      qWords.forEach((w) => {
        if (pNameLower.includes(w)) score += 2;
        if (p.category.toLowerCase().includes(w)) score += 1;
        if (p.description.toLowerCase().includes(w)) score += 0.5;
      });
      if (score > bestScore) {
        bestScore = score;
        bestProd = p;
      }
    });

    return bestScore > 0 ? bestProd : null;
  };

  // Natural Language Command Processing Engine
  const processVoiceCommand = useCallback((rawCommand, langOverride) => {
    if (!rawCommand || !rawCommand.trim()) return;
    const lang = langOverride || currentLang;
    const lower = rawCommand.toLowerCase().trim();
    setIsProcessing(true);
    setTranscript(rawCommand);

    const activeTable = INTENT_TABLE[lang] || INTENT_TABLE["en-US"];

    // 1. Check for Coupon / Promo Code intent
    if (lower.includes("coupon") || lower.includes("promo") || lower.includes("discount") || lower.includes("lumina20")) {
      applyCoupon("LUMINA20");
      const msg = "Promo code LUMINA20 applied for 20% discount!";
      setAssistantResponse(msg);
      speakText(msg);
      setIsProcessing(false);
      return;
    }

    // 2. Check for Navigation: Cart
    if (activeTable.cart.some((p) => lower.includes(p))) {
      const msg = `Opening your shopping bag with ${cartCount} items.`;
      setAssistantResponse(msg);
      speakText(msg);
      navigate("/cart");
      setTimeout(() => setVoiceOverlayOpen(false), 1400);
      setIsProcessing(false);
      return;
    }

    // 3. Check for Navigation: Checkout
    if (activeTable.checkout.some((p) => lower.includes(p))) {
      const msg = "Proceeding to checkout.";
      setAssistantResponse(msg);
      speakText(msg);
      navigate("/cart?checkout=true");
      setTimeout(() => setVoiceOverlayOpen(false), 1400);
      setIsProcessing(false);
      return;
    }

    // 4. Check for Navigation: Home / Wishlist
    if (lower.includes("go home") || lower.includes("home") || lower.includes("inicio")) {
      const msg = "Returning to Lumina Home.";
      setAssistantResponse(msg);
      speakText(msg);
      navigate("/");
      setTimeout(() => setVoiceOverlayOpen(false), 1200);
      setIsProcessing(false);
      return;
    }

    if (lower.includes("wishlist") || lower.includes("favorites") || lower.includes("favoritos")) {
      const msg = "Opening your saved wishlist.";
      setAssistantResponse(msg);
      speakText(msg);
      navigate("/wishlist");
      setTimeout(() => setVoiceOverlayOpen(false), 1200);
      setIsProcessing(false);
      return;
    }

    // 5. Check for Remove Intent
    const removeMatch = activeTable.remove.find((p) => lower.startsWith(p) || lower.includes(" " + p));
    if (removeMatch) {
      const remainder = lower.replace(removeMatch, "").trim();
      const cleanItem = cleanItemName(remainder);
      const matched = findProductMatch(cleanItem);
      if (matched) {
        removeFromCart(matched.id);
        RecommendationService.logEvent(matched.name, "remove", 1);
        const msg = `Removed "${matched.name}" from your bag.`;
        setAssistantResponse(msg);
        speakText(msg);
      } else {
        const msg = `Could not find "${cleanItem}" in your bag.`;
        setAssistantResponse(msg);
        speakText(msg);
      }
      setIsProcessing(false);
      return;
    }

    // 6. Check for Price Filter (e.g. "find apples under 10 dollars")
    const priceMax = extractPriceMax(lower);
    if (priceMax !== null) {
      let topic = lower.replace(/(?:find|search|show|items|products|under|less than|below|cheaper than|\$|\d+(?:\.\d+)?|dollars|euros|rupees)/gi, "").trim();
      topic = cleanItemName(topic);
      const searchTerm = topic || "all";
      const msg = `Showing products under $${priceMax}.`;
      setAssistantResponse(msg);
      speakText(msg);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&maxPrice=${priceMax}`);
      setTimeout(() => setVoiceOverlayOpen(false), 1500);
      setIsProcessing(false);
      return;
    }

    // 7. Check for Add Intent (or default if item specified)
    const addMatch = activeTable.add.find((p) => lower.startsWith(p) || lower.includes(" " + p));
    let rawItem = lower;
    if (addMatch) {
      rawItem = lower.slice(lower.indexOf(addMatch) + addMatch.length).trim();
    }

    const { qty, rest } = extractQuantity(rawItem);
    const cleaned = cleanItemName(rest);

    // 8. If Search Intent explicitly requested
    const searchMatch = activeTable.search.find((p) => lower.startsWith(p) || lower.includes(" " + p));
    if (searchMatch && !addMatch) {
      const searchTarget = cleanItemName(lower.slice(lower.indexOf(searchMatch) + searchMatch.length));
      const msg = `Searching for "${searchTarget || "catalog"}"...`;
      setAssistantResponse(msg);
      speakText(msg);
      navigate(`/search?q=${encodeURIComponent(searchTarget || "all")}`);
      setTimeout(() => setVoiceOverlayOpen(false), 1500);
      setIsProcessing(false);
      return;
    }

    // Match Product for Add
    const matchedProduct = findProductMatch(cleaned);
    if (matchedProduct) {
      addToCart(matchedProduct, qty);
      RecommendationService.logEvent(matchedProduct.name, "add", qty);
      const msg = `Added ${qty > 1 ? `${qty}× ` : ""}${matchedProduct.name} ($${(matchedProduct.price * qty).toFixed(2)}) to your bag.`;
      setAssistantResponse(msg);
      speakText(msg);

      // Check if there are smart substitutes or complementary items
      const subs = RecommendationService.getSubstitutes(matchedProduct.name);
      if (subs.length > 0) {
        setTimeout(() => {
          showToast(`💡 Also pairs nicely with: ${subs[0].name}`, "info");
        }, 1500);
      }
    } else if (cleaned) {
      const msg = `Searching catalog for "${cleaned}"...`;
      setAssistantResponse(msg);
      speakText(`Searching for ${cleaned}`);
      navigate(`/search?q=${encodeURIComponent(cleaned)}`);
      setTimeout(() => setVoiceOverlayOpen(false), 1500);
    } else {
      const msg = "I didn't catch that item. Try saying 'Add 2 Honeycrisp Apples' or 'Search Skincare'.";
      setAssistantResponse(msg);
      speakText(msg);
    }

    setIsProcessing(false);
  }, [addToCart, removeFromCart, clearCart, applyCoupon, cartCount, currentLang, navigate, speakText, showToast]);

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
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          processVoiceCommand(final, currentLang);
        }
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
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Failed to initialize speech recognition", e);
      setSupported(false);
    }
  }, [currentLang, processVoiceCommand, showToast]);

  const startListening = () => {
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
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
