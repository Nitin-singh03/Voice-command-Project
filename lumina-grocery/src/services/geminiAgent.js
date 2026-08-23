import { products } from "../data/products";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Gemini 2.0 Flash Agent Service for Lumina Grocery
 * Translates English, Hindi, and Hinglish voice queries into structured actions.
 */
export const GeminiVoiceAgent = {
  getApiKey() {
    return (
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_GEMINI_KEY ||
      import.meta.env.VITE_GOOGLE_API_KEY ||
      localStorage.getItem("lumina_gemini_api_key") ||
      ""
    );
  },

  setApiKey(key) {
    if (key) {
      localStorage.setItem("lumina_gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("lumina_gemini_api_key");
    }
  },

  hasApiKey() {
    return Boolean(this.getApiKey());
  },

  /**
   * Process a voice or text command directly using Gemini 2.5 Flash LLM as an MCP Tool Caller
   * Raw user speech is passed untouched to the model.
   * @param {string} userQuery - The raw, untouched user speech or text
   * @param {string} currentLang - 'en-US' or 'hi-IN'
   * @param {Array} currentCart - Current items in user's cart
   * @param {Array} conversationHistory - Array of previous messages [{ role: 'user'|'assistant', text: string }]
   * @param {Object} orderSummary - Real-time financial summary { subtotal, appliedCoupon, discountAmount, shippingFee, estimatedTax, totalAmount }
   */
  async processCommand(userQuery, currentLang = "en-US", currentCart = [], conversationHistory = [], orderSummary = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("NO_API_KEY");
    }

    const catalogSummary = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      category: p.category,
      season: p.season,
      tags: p.tags,
      description: p.description,
    }));

    const cartSummary = currentCart.map((c) => `${c.qty}x ${c.name} ($${(c.price * c.qty).toFixed(2)})`).join(", ");

    const systemPrompt = `You are Lumina's Voice AI Agent & Shopping Orchestrator for a luxury organic grocery store.
You understand English, Hindi (हिन्दी in Devanagari), and conversational Hinglish.
You maintain full context across conversation turns.

Available Product Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Current User Cart: [${cartSummary || "Empty"}]

Real-time Order Financial Summary:
- Bag Subtotal: ${orderSummary.subtotal || "$0.00"}
- Applied Promo Code: ${orderSummary.appliedCoupon || "None"}
- Promo Discount: ${orderSummary.discountAmount || "$0.00"}
- Eco Delivery Shipping: ${orderSummary.shippingFee || "$0.00"}
- Estimated Sales Tax (8.25%): ${orderSummary.estimatedTax || "$0.00"}
- Total Amount: ${orderSummary.totalAmount || "$0.00"}

You must analyze the user's raw speech and invoke the appropriate MCP tool action:

MCP TOOL ACTIONS:
1. "add_to_cart":
   - Use when user wants to add, buy, or put items in their cart, OR when confirming a recommended meal/recipe (e.g. "yes add it", "sure", "ha jodo").
   - "items": Array of objects: [{ "name": "Exact Catalog Product Name", "qty": 1 }]
2. "remove_from_cart":
   - Use when user wants to remove, delete, or cancel items from their cart.
   - "items": Array of objects: [{ "name": "Exact Catalog Product Name", "qty": 1 }]
3. "search_catalog":
   - ONLY when user explicitly asks to search, find, show, or browse catalog items/seasons (e.g. "show summer fruits", "find matcha", "items under $10").
   - "searchQuery": search query string
   - "maxPrice": number or null
4. "check_restock":
   - When user asks about running low on groceries, reorder status, or pantry staples.
5. "apply_coupon":
   - When user mentions promo code or discount (e.g. "LUMINA20").
   - "couponCode": string
6. "navigate":
   - When user wants to go to cart, wishlist, home, or checkout.
   - "route": "/cart" | "/wishlist" | "/" | "/cart?checkout=true"
7. "clear_cart":
   - When user asks to clear or empty their cart.
8. "general_answer":
   - For all greetings ("hello", "namaste", "hi"), questions about cart contents ("what is in my cart?"), questions about order totals / checkout breakdown ("what is my total?", "how much is delivery?", "what is the tax?", "total kitna hua?"), culinary recommendations ("what should I eat today?"), explanations ("why did you suggest..."), and chitchat. DO NOT ADD TO CART OR SEARCH.

Return a JSON object matching this schema:
{
  "tool": "add_to_cart" | "remove_from_cart" | "search_catalog" | "check_restock" | "apply_coupon" | "navigate" | "clear_cart" | "general_answer",
  "items": [{ "name": "Exact Product Name", "qty": 1 }],
  "searchQuery": "string or null",
  "maxPrice": null,
  "couponCode": "string or null",
  "route": "string or null",
  "spokenResponse": "Short, natural, friendly reply in the user's language (Hindi in Devanagari if Hindi/Hinglish, English if English)"
}

Examples:
User: "What is my total amount?" or "Show order summary"
Response:
{
  "tool": "general_answer",
  "spokenResponse": "Your subtotal is ${orderSummary.subtotal || "$0.00"}, delivery is ${orderSummary.shippingFee || "$0.00"}, and tax is ${orderSummary.estimatedTax || "$0.00"}, making your total amount ${orderSummary.totalAmount || "$0.00"}."
}

User (Hindi): "कुल कितना पैसा हुआ?" / "टोटल कितना है?"
Response:
{
  "tool": "general_answer",
  "spokenResponse": "आपका सबटोटल ${orderSummary.subtotal || "$0.00"} है, डिलीवरी शुल्क ${orderSummary.shippingFee || "$0.00"} है और टैक्स ${orderSummary.estimatedTax || "$0.00"} है। कुल राशि ${orderSummary.totalAmount || "$0.00"} है।"
}

User: "What should I eat today?"
Response:
{
  "tool": "general_answer",
  "spokenResponse": "How about our freshly baked Artisanal Sourdough Boule toasted with French Black Truffle Cultured Butter? Would you like me to add them to your bag?"
}

User (next turn): "Yes, add it"
Response:
{
  "tool": "add_to_cart",
  "items": [
    { "name": "Artisanal Sourdough Boule", "qty": 1 },
    { "name": "French Black Truffle Cultured Butter", "qty": 1 }
  ],
  "spokenResponse": "Added Artisanal Sourdough Boule and French Black Truffle Butter to your bag."
}

User: "What are the products in my cart right now?"
Response:
{
  "tool": "general_answer",
  "spokenResponse": "You currently have [items from Current User Cart] in your bag."
}

User: "Move to cart page"
Response:
{
  "tool": "navigate",
  "route": "/cart",
  "spokenResponse": "Opening your shopping bag."
}

User: "Add 2 Alphonso Mangoes"
Response:
{
  "tool": "add_to_cart",
  "items": [{ "name": "Royal Alphonso Mangoes", "qty": 2 }],
  "spokenResponse": "Added 2 Royal Alphonso Mangoes to your bag."
}

User: "Show summer fruits"
Response:
{
  "tool": "search_catalog",
  "searchQuery": "summer fruits",
  "spokenResponse": "Showing our fresh summer fruit harvest collection."
}

User: "Hello" / "Namaste"
Response:
{
  "tool": "general_answer",
  "spokenResponse": "Hello! Welcome to Lumina. How can I help with your organic grocery shopping today?"
}

Return ONLY valid JSON matching this schema.`;

    // Construct multi-turn contents array
    const contents = [];

    const recentHistory = (conversationHistory || []).slice(-6);
    recentHistory.forEach((msg) => {
      if (msg.role === "user" && msg.text) {
        contents.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.role === "assistant" && msg.text) {
        contents.push({ role: "model", parts: [{ text: JSON.stringify({ spokenResponse: msg.text }) }] });
      }
    });

    // Add current turn with RAW untouched user speech
    contents.push({
      role: "user",
      parts: [{ text: userQuery }],
    });

    const requestBody = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    };

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-3.6-flash",
    ];

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJsonText) {
            return JSON.parse(rawJsonText);
          }
        }

        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status}`;
        lastError = new Error(errMsg);

        // If rate limit (429), try next model in list
        if (response.status === 429 || response.status === 503) {
          console.warn(`Model ${model} hit rate limit (${response.status}), trying next model...`);
          continue;
        }

        throw lastError;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Failed to process command with Gemini");
  },
};
