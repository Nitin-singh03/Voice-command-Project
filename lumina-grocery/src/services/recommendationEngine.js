import { products } from "../data/products";

const EVENTS_STORAGE_KEY = "lumina_shopping_events_log";

// Comprehensive substitutes and pairing map for smart recommendations
export const SUBSTITUTES_MAP = {
  "honeycrisp apples": ["Granny Smith Apples", "Golden Spiced Apple & Pear Cider", "Cold-Pressed Raw Honey", "Wild Organic Blueberries"],
  "granny smith apples": ["Honeycrisp Apples", "Artisanal Sourdough Boule", "Meyer Lemons"],
  "royal alphonso mangoes": ["Rainier Sweet Golden Cherries", "Wild Organic Blueberries", "Authentic Greek Sheep Milk Yogurt"],
  "wild organic blueberries": ["Honeycrisp Apples", "Authentic Greek Sheep Milk Yogurt", "Royal Alphonso Mangoes"],
  "rainier sweet golden cherries": ["Royal Alphonso Mangoes", "Wild Organic Blueberries", "Black Mission Figs"],
  "black mission figs": ["Artisanal Aged Farmhouse Cheese", "Extra Virgin First Harvest Olive Oil", "Cold-Pressed Raw Honey"],
  "artisanal sourdough boule": ["French Black Truffle Cultured Butter", "Cold-Pressed Raw Honey", "Artisanal Aged Farmhouse Cheese", "Rosemary Sea Salt Focaccia"],
  "french pure butter croissants": ["Cold Brew Single-Origin Coffee", "Organic Matcha Ceremony Grade", "French Black Truffle Cultured Butter"],
  "french black truffle cultured butter": ["Artisanal Sourdough Boule", "Artisanal Bronze-Cut Pasta", "Japanese Shiitake Mushrooms"],
  "authentic greek sheep milk yogurt": ["Cold-Pressed Raw Honey", "Wild Organic Blueberries", "Rainier Sweet Golden Cherries"],
  "organic matcha ceremony grade": ["Oat Milk Barista Edition", "Organic Almond Milk", "Swedish Cardamom Morning Buns"],
  "cold brew single-origin coffee": ["Oat Milk Barista Edition", "French Pure Butter Croissants", "Swedish Cardamom Morning Buns"],
  "monsoon herbal spiced chai blend": ["Cold-Pressed Raw Honey", "Swedish Cardamom Morning Buns", "Whole Farm Fresh Milk"],
  "cold-pressed raw honey": ["Artisanal Sourdough Boule", "Organic Matcha Ceremony Grade", "Monsoon Herbal Spiced Chai Blend", "Authentic Greek Sheep Milk Yogurt"],
  "extra virgin first harvest olive oil": ["25-Year Aged Balsamic of Modena IGP", "Fresh French Genovese Basil", "Artisanal Bronze-Cut Pasta", "Rosemary Sea Salt Focaccia"],
  "25-year aged balsamic of modena igp": ["Extra Virgin First Harvest Olive Oil", "Artisanal Aged Farmhouse Cheese", "Black Mission Figs"],
  "aura revitalizing essence": ["Damask Rose Hydrating Face Mist", "Botanical Restorative Night Balm", "Spring Botanical Collection"],
  "botanical restorative night balm": ["Aura Revitalizing Essence", "Lumina Essential Oils Set", "Damask Rose Hydrating Face Mist"],
  "damask rose hydrating face mist": ["Aura Revitalizing Essence", "Botanical Restorative Night Balm", "Wild Lavender Herbal Sparkling Tonic"],
  "lumina essential oils set": ["Spring Botanical Collection", "Wildcrafted Elderberry & Zinc Tonic"],
  "spring botanical collection": ["Lumina Essential Oils Set", "Wild Lavender Herbal Sparkling Tonic"],
  "organic wild lion's mane extract": ["Monsoon Herbal Spiced Chai Blend", "Organic Matcha Ceremony Grade"],
  "wildcrafted elderberry & zinc tonic": ["Cold-Pressed Valencia Orange Juice", "Monsoon Herbal Spiced Chai Blend", "Winter Alpine Dark Hot Cocoa Blend"],
  "artisanal dark truffle gift box": ["Winter Alpine Dark Hot Cocoa Blend", "Artisanal Aged Farmhouse Cheese", "25-Year Aged Balsamic of Modena IGP"],
  "eco-friendly zero waste bundle": ["Plant-Based Dish Soap", "Botanical Whitening Toothpaste", "Cedarwood & Lavender Laundry Detergent"],
};

export const SEASONAL_ITEMS = [
  "Royal Alphonso Mangoes",
  "Rainier Sweet Golden Cherries",
  "Wild Organic Blueberries",
  "Honeycrisp Apples",
  "Black Mission Figs",
  "French Black Truffle Cultured Butter",
  "Monsoon Herbal Spiced Chai Blend",
  "Winter Alpine Dark Hot Cocoa Blend",
  "Golden Spiced Apple & Pear Cider",
  "Organic Matcha Ceremony Grade",
  "Aura Revitalizing Essence",
  "Cold-Pressed Raw Honey",
];

// Seed events representing realistic grocery shopping sessions
function getSeedEvents() {
  const day = 86400000;
  const now = Date.now();
  const at = (daysAgo) => now - daysAgo * day;
  return [
    // Session 14 days ago: Apples + Sourdough + Truffle Butter + Honey
    { item: "Honeycrisp Apples", action: "add", qty: 2, ts: at(14) },
    { item: "Artisanal Sourdough Boule", action: "add", qty: 1, ts: at(14) + 1000 },
    { item: "French Black Truffle Cultured Butter", action: "add", qty: 1, ts: at(14) + 2000 },
    { item: "Cold-Pressed Raw Honey", action: "add", qty: 1, ts: at(14) + 3000 },

    // Session 10 days ago: Sourdough + Truffle Butter
    { item: "Artisanal Sourdough Boule", action: "add", qty: 1, ts: at(10) },
    { item: "French Black Truffle Cultured Butter", action: "add", qty: 1, ts: at(10) + 1000 },

    // Session 7 days ago: Alphonso Mangoes + Greek Yogurt + Honey + Matcha
    { item: "Royal Alphonso Mangoes", action: "add", qty: 1, ts: at(7) },
    { item: "Authentic Greek Sheep Milk Yogurt", action: "add", qty: 1, ts: at(7) + 1000 },
    { item: "Cold-Pressed Raw Honey", action: "add", qty: 1, ts: at(7) + 2000 },
    { item: "Organic Matcha Ceremony Grade", action: "add", qty: 1, ts: at(7) + 3000 },

    // Session 5 days ago: Matcha + Oat Milk + Morning Buns
    { item: "Organic Matcha Ceremony Grade", action: "add", qty: 1, ts: at(5) },
    { item: "Oat Milk Barista Edition", action: "add", qty: 2, ts: at(5) + 1000 },
    { item: "Swedish Cardamom Morning Buns", action: "add", qty: 1, ts: at(5) + 2000 },

    // Session 4 days ago: Skincare Trio
    { item: "Aura Revitalizing Essence", action: "add", qty: 1, ts: at(4) },
    { item: "Botanical Restorative Night Balm", action: "add", qty: 1, ts: at(4) + 1000 },
    { item: "Damask Rose Hydrating Face Mist", action: "add", qty: 1, ts: at(4) + 2000 },

    // Session 2 days ago: Olive Oil + Balsamic + Pasta + Basil
    { item: "Extra Virgin First Harvest Olive Oil", action: "add", qty: 1, ts: at(2) },
    { item: "25-Year Aged Balsamic of Modena IGP", action: "add", qty: 1, ts: at(2) + 1000 },
    { item: "Artisanal Bronze-Cut Pasta", action: "add", qty: 2, ts: at(2) + 2000 },
  ];
}

export const RecommendationService = {
  getEvents() {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const initial = getSeedEvents();
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      return getSeedEvents();
    }
  },

  logEvent(item, action = "add", qty = 1) {
    try {
      const events = this.getEvents();
      events.push({ item, action, qty, ts: Date.now() });
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return events;
    } catch (e) {
      console.warn("Failed to log recommendation event", e);
      return [];
    }
  },

  clearEvents() {
    try {
      localStorage.removeItem(EVENTS_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  },

  // 1. Co-occurrence: Frequently added together with items in cart
  computeFrequentlyBoughtTogether(currentCartItemNames, limit = 4) {
    const events = this.getEvents();
    const sessions = {};

    events.filter((e) => e.action === "add").forEach((e) => {
      const dayKey = new Date(e.ts).toDateString();
      (sessions[dayKey] = sessions[dayKey] || new Set()).add(e.item);
    });

    const pairCounts = {};
    Object.values(sessions).forEach((itemSet) => {
      const items = Array.from(itemSet);
      for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items.length; j++) {
          if (i === j) continue;
          pairCounts[items[i]] = pairCounts[items[i]] || {};
          pairCounts[items[i]][items[j]] = (pairCounts[items[i]][items[j]] || 0) + 1;
        }
      }
    });

    const scores = {};
    currentCartItemNames.forEach((name) => {
      const partners = pairCounts[name];
      if (!partners) return;
      Object.entries(partners).forEach(([candidate, count]) => {
        if (currentCartItemNames.includes(candidate)) return;
        scores[candidate] = (scores[candidate] || 0) + count;
      });
    });

    // Fallback complementary recommendations if basket has no historical pair
    if (Object.keys(scores).length === 0 && currentCartItemNames.length > 0) {
      currentCartItemNames.forEach((name) => {
        const subs = this.getSubstitutes(name);
        subs.forEach((prod) => {
          if (!currentCartItemNames.includes(prod.name)) {
            scores[prod.name] = (scores[prod.name] || 0) + 1;
          }
        });
      });
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, score]) => {
        const prod = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
        return prod ? { product: prod, score, reason: `Bought together ${score}×` } : null;
      })
      .filter(Boolean);
  },

  // 2. Reorder Cycle Prediction based on historical timing intervals
  computeDueForReorder(currentCartItemNames, limit = 4) {
    const dayMs = 86400000;
    const now = Date.now();
    const events = this.getEvents();
    const byItem = {};

    events.filter((e) => e.action === "add").forEach((e) => {
      (byItem[e.item] = byItem[e.item] || []).push(e.ts);
    });

    const predictions = [];
    Object.entries(byItem).forEach(([item, timestamps]) => {
      if (currentCartItemNames.includes(item)) return;
      timestamps.sort((a, b) => a - b);
      if (timestamps.length < 2) return; // Needs at least 2 purchases to learn frequency cycle

      const gaps = [];
      for (let i = 1; i < timestamps.length; i++) {
        gaps.push((timestamps[i] - timestamps[i - 1]) / dayMs);
      }
      const avgCycleDays = Math.max(1, Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length));
      const daysSinceLast = Math.max(1, Math.round((now - timestamps[timestamps.length - 1]) / dayMs));

      if (daysSinceLast >= avgCycleDays) {
        const prod = products.find((p) => p.name.toLowerCase() === item.toLowerCase());
        if (prod) {
          predictions.push({
            product: prod,
            avgCycleDays,
            daysSinceLast,
            reason: `Usually every ${avgCycleDays}d (last added ${daysSinceLast}d ago)`,
          });
        }
      }
    });

    return predictions
      .sort((a, b) => (b.daysSinceLast - b.avgCycleDays) - (a.daysSinceLast - a.avgCycleDays))
      .slice(0, limit);
  },

  // 3. Smart Substitutes & Complementary Lookup
  getSubstitutes(productName) {
    const clean = productName.toLowerCase();
    for (const key in SUBSTITUTES_MAP) {
      if (clean.includes(key) || key.includes(clean)) {
        return SUBSTITUTES_MAP[key]
          .map((name) => products.find((p) => p.name.toLowerCase() === name.toLowerCase()))
          .filter(Boolean);
      }
    }
    return [];
  },

  // 4. Get Seasonal Highlights
  getSeasonalRecommendations(seasonName = null, limit = 6) {
    if (seasonName && seasonName !== "All") {
      return products.filter((p) => p.season === seasonName).slice(0, limit);
    }
    return products.filter((p) => p.isSeasonal).slice(0, limit);
  }
};
