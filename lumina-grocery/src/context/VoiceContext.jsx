import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { products } from "../data/products";
import { RecommendationService } from "../services/recommendationEngine";
import { GeminiVoiceAgent } from "../services/geminiAgent";

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

  // Visible Multi-Turn Conversation History
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      role: "assistant",
      text: "Namaste! I am your Lumina Voice AI Assistant. You can speak in English or हिन्दी (Hindi). Tap the microphone or select a prompt below.",
      time: "Just now",
    },
  ]);

  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const accumulatedFinalRef = useRef("");

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

  // Natural Language Command Processing Engine
  const processVoiceCommand = useCallback(async (rawCommand, langOverride) => {
    if (!rawCommand || !rawCommand.trim() || isProcessingRef.current) return;
    const lang = langOverride || currentLang;
    isProcessingRef.current = true;
    setIsProcessing(true);
    setTranscript(rawCommand);
    setInterimTranscript("");
    addMessage("user", rawCommand);

    const respond = (replyText) => {
      setAssistantResponse(replyText);
      speakText(replyText);
      addMessage("assistant", replyText);
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
      // 1. Direct LLM Call (Gemini 2.5 Flash MCP Tool Calling with Order Summary)
      if (GeminiVoiceAgent.hasApiKey()) {
        try {
          const geminiResult = await GeminiVoiceAgent.processCommand(rawCommand, lang, cart, messages, orderSummary);
          if (geminiResult) {
            const action = geminiResult.tool || geminiResult.intent;
            const { items, productName, quantity, searchQuery, maxPrice, couponCode, route, spokenResponse } = geminiResult;

            // MCP Tool: add_to_cart
            if (action === "add_to_cart") {
              const addedNames = [];

              if (Array.isArray(items) && items.length > 0) {
                items.forEach((it) => {
                  const target = it.name || it;
                  const qty = it.qty || quantity || 1;
                  const matched = findProductMatch(target);
                  if (matched) {
                    addToCart(matched, qty);
                    RecommendationService.logEvent(matched.name, "add", qty);
                    addedNames.push(`${qty > 1 ? `${qty}× ` : ""}${matched.name}`);
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
                    addedNames.push(`${qty > 1 ? `${qty}× ` : ""}${matched.name}`);
                  }
                });
              }

              const reply = spokenResponse || (addedNames.length > 0 ? `Added ${addedNames.join(" and ")} to your bag.` : "Added item to your bag.");
              respond(reply);
              return;
            }

            // MCP Tool: remove_from_cart
            if (action === "remove_from_cart") {
              const removedNames = [];
              const targetList = Array.isArray(items) && items.length > 0 ? items.map((i) => i.name || i) : (productName ? [productName] : []);
              targetList.forEach((t) => {
                const matched = findProductMatch(t);
                if (matched) {
                  removeFromCart(matched.id);
                  RecommendationService.logEvent(matched.name, "remove", 1);
                  removedNames.push(matched.name);
                }
              });
              const reply = spokenResponse || (removedNames.length > 0 ? `Removed ${removedNames.join(" and ")} from your bag.` : "Removed item from your bag.");
              respond(reply);
              return;
            }

            // MCP Tool: search_catalog
            if (action === "search_catalog") {
              const term = searchQuery || productName || "all";
              const priceQuery = maxPrice ? `&maxPrice=${maxPrice}` : "";
              navigate(`/search?q=${encodeURIComponent(term)}${priceQuery}`);
              const reply = spokenResponse || `Showing results for ${term}.`;
              respond(reply);
              setTimeout(() => setVoiceOverlayOpen(false), 1400);
              return;
            }

            // MCP Tool: check_restock
            if (action === "check_restock") {
              const cartItemNames = (cart || []).map((i) => i.name);
              const due = RecommendationService.computeDueForReorder(cartItemNames, 3);
              if (due && due.length > 0) {
                const topItem = due[0].product.name;
                const reply = spokenResponse || `Based on your shopping history, it looks like you're running low on ${topItem}. Would you like me to add it?`;
                respond(reply);
                showToast(`Running low on: ${topItem}`, "info");
              } else {
                const reply = spokenResponse || "You are stocked up on your usual staples!";
                respond(reply);
              }
              return;
            }

            // MCP Tool: apply_coupon
            if (action === "apply_coupon") {
              applyCoupon(couponCode || "LUMINA20");
              const reply = spokenResponse || "Coupon LUMINA20 applied for 20% discount!";
              respond(reply);
              return;
            }

            // MCP Tool: navigate
            if (action === "navigate" && route) {
              navigate(route);
              const reply = spokenResponse || `Navigating to ${route}.`;
              respond(reply);
              setTimeout(() => setVoiceOverlayOpen(false), 1200);
              return;
            }

            // MCP Tool: clear_cart
            if (action === "clear_cart") {
              clearCart();
              const reply = spokenResponse || "Your cart has been cleared.";
              respond(reply);
              return;
            }

            // MCP Tool: general_answer / spokenResponse
            if (spokenResponse) {
              respond(spokenResponse);
              return;
            }
          }
        } catch (err) {
          console.warn("Gemini agent error, falling back to local engine:", err);
        }
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
        messages,
        clearHistory,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
