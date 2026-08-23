import { products } from "../data/products";

const EVENTS_STORAGE_KEY = "lumina_shopping_events_log";

// Pre-defined substitutes map for complementary and alternative suggestions
export const SUBSTITUTES_MAP = {
  "honeycrisp apples": ["Granny Smith Apples", "Organic Fuji Apples", "Wild Organic Blueberries"],
  "granny smith apples": ["Honeycrisp Apples", "Organic Fuji Apples"],
  "organic fuji apples": ["Honeycrisp Apples", "Wild Organic Blueberries"],
  "wild organic blueberries": ["Honeycrisp Apples", "Organic Fuji Apples"],
  "aura revitalizing essence": ["Botanical Restorative Night Balm", "Spring Botanical Collection"],
  "lumina essential oils set": ["Spring Botanical Collection", "Organic Matcha Ceremony Grade"],
  "spring botanical collection": ["Lumina Essential Oils Set", "Botanical Restorative Night Balm"],
  "artisanal sourdough boule": ["Organic Matcha Ceremony Grade", "Cold-Pressed Raw Honey"],
  "organic matcha ceremony grade": ["Cold-Pressed Raw Honey", "Lumina Essential Oils Set"],
  "cold-pressed raw honey": ["Organic Matcha Ceremony Grade", "Artisanal Sourdough Boule"],
  "botanical restorative night balm": ["Aura Revitalizing Essence", "Lumina Essential Oils Set"],
  "eco-friendly zero waste bundle": ["Spring Botanical Collection"],
};

export const SEASONAL_ITEMS = [
  "Honeycrisp Apples",
  "Wild Organic Blueberries",
  "Artisanal Sourdough Boule",
  "Cold-Pressed Raw Honey",
];

// Seed events so recommendations provide rich, immediate value on first install
function getSeedEvents() {
  const day = 86400000;
  const now = Date.now();
  const at = (daysAgo) => now - daysAgo * day;
  return [
    // Session 14 days ago: Apples + Sourdough + Honey
    { item: "Honeycrisp Apples", action: "add", qty: 2, ts: at(14) },
    { item: "Artisanal Sourdough Boule", action: "add", qty: 1, ts: at(14) + 1000 },
    { item: "Cold-Pressed Raw Honey", action: "add", qty: 1, ts: at(14) + 2000 },

    // Session 7 days ago: Apples + Blueberries + Matcha
    { item: "Honeycrisp Apples", action: "add", qty: 2, ts: at(7) },
    { item: "Wild Organic Blueberries", action: "add", qty: 1, ts: at(7) + 1000 },
    { item: "Organic Matcha Ceremony Grade", action: "add", qty: 1, ts: at(7) + 2000 },

    // Session 10 days ago: Aura Essence + Night Balm
    { item: "Aura Revitalizing Essence", action: "add", qty: 1, ts: at(10) },
    { item: "Botanical Restorative Night Balm", action: "add", qty: 1, ts: at(10) + 1000 },

    // Session 4 days ago: Sourdough + Honey
    { item: "Artisanal Sourdough Boule", action: "add", qty: 1, ts: at(4) },
    { item: "Cold-Pressed Raw Honey", action: "add", qty: 1, ts: at(4) + 1000 },

    // Session 3 days ago: Essential oils + Botanical collection
    { item: "Lumina Essential Oils Set", action: "add", qty: 1, ts: at(3) },
    { item: "Spring Botanical Collection", action: "add", qty: 1, ts: at(3) + 1000 },
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

    // Match back to full product objects
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

  // 3. Smart Substitutes Lookup
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
};
