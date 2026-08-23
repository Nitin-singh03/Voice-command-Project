# Lumina — Voice-Enabled Luxury Grocery & Shopping Assistant

An intelligent, voice-controlled e-commerce web application with real-time Web Speech API recognition, Natural Language Processing (NLP), multi-lingual support, smart recommendation algorithms (co-occurrence & restock cycle prediction), and automated categorization.

---

## 🎯 Required Feature Checklist & Implementation Map

| Requirement | Implementation Detail & File Reference |
|---|---|
| **1. Voice Command Recognition** | Add items directly via voice (e.g. `"Add milk"`, `"I need apples"`, `"Add 2 bottles of water"`). Handled in [`VoiceContext.jsx`](./src/context/VoiceContext.jsx). |
| **2. Natural Language Processing (NLP)** | Flexible phrase recognition (`"I want to buy bananas"`, `"Add bananas to my list"`, `"Put bread in my bag"`, `"I need eggs"`). |
| **3. Multilingual Voice Support** | Full voice recognition and synthesis in **English (`en-US`)**, **Español (`es-ES`)**, **हिन्दी (`hi-IN`)**, and **தமிழ் (`ta-IN`)**. |
| **4. History-Based Recommendations** | Real-time session co-occurrence learning ("Frequently Added Together") and interval cycle restock predictions ("Due for a Restock"). Handled in [`recommendationEngine.js`](./src/services/recommendationEngine.js). |
| **5. Seasonal & Peak Harvest** | Dynamic in-season suggestions for produce and harvests. |
| **6. Smart Substitutes** | Automatically provides alternatives (e.g. almond milk/oat milk for milk, Fuji for Granny Smith, Matcha for coffee). |
| **7. Add/Remove Items via Voice** | Voice removal supported (`"Remove milk from my list"`, `"Delete Honeycrisp Apples"`, `"Clear my cart"`). |
| **8. Automatic Item Categorization** | Automatically tags and organizes items into `Produce`, `Dairy`, `Bakery`, `Beverages`, `Pantry`, `Household`, `Wellness`, and `Skincare`. |
| **9. Quantity Management via Voice** | Intelligent word & number extraction (`"Add 2 bottles of water"`, `"Buy 5 oranges"`, `"Add a dozen eggs"`, `"Add a couple apples"`). |
| **10. Voice-Activated Search** | Natural item search by brand, category, or origin (`"Find me organic apples"`, `"Search matcha"`). |
| **11. Voice Price Range Filtering** | Extract and filter by budget (`"Find toothpaste under $5"`, `"Show items under $10"`). |
| **12. Minimalist & Visual UI/UX** | Real-time audio waveform equalizer, hearing transcript streaming, spoken audio feedback, glowing floating mic orb, and mobile-first responsive layout. |
| **13. Production Ready & Hostable** | Single-command production build (`npm run build`) deployable to AWS S3/CloudFront, Firebase Hosting, Netlify, Vercel, or GCP. |

---

## 🚀 Getting Started Locally

```bash
# 1. Navigate to the project directory
cd lumina-grocery

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production Deployment

```bash
npm run build
```
Output files will be generated in the `dist/` directory ready for static hosting on Firebase, AWS, Vercel, or Cloudflare Pages.

---

## 💡 Example Voice Commands to Try

- **Add with Quantities**: `"Add 2 bottles of water"`, `"Add a dozen eggs"`, `"Buy 2 Honeycrisp Apples"`
- **Natural Language Variations**: `"I want to buy organic bananas"`, `"I need whole milk"`, `"Put sourdough in my cart"`
- **Price Range Search**: `"Find toothpaste under $5"`, `"Find items under $10"`, `"Search produce under $4"`
- **Remove Items**: `"Remove milk from my list"`, `"Delete sourdough bread"`
- **Navigation & Checkout**: `"Open my cart"`, `"Take me to checkout"`, `"Apply coupon LUMINA20"`, `"Go home"`
- **Multilingual Queries**:
  - Spanish: `"Añade 2 manzanas"`, `"Ir al carrito"`
  - Hindi: `"2 सेब जोड़ो"`, `"कार्ट दिखाओ"`
  - Tamil: `"ஆப்பிள் சேர்"`, `"கார்ட் திற"`
