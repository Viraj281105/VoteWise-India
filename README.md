# 🗳️ VoteWise India

> **Empowering Every Indian. Mastering Democracy.**
> An interactive, multilingual, AI-powered platform that teaches Indian citizens how their elections work — from voter registration to result declaration.

**Built for the Google PromptWars Hackathon** · Powered by 5 Google Cloud services · Live at [vote-wise-india.vercel.app](https://vote-wise-india.vercel.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📖 Interactive Timeline | 8-step animated election process walkthrough |
| 🗺️ Constituency Explorer | Real 2024 Lok Sabha data for all states & UTs |
| 📝 Quiz Engine | 25 questions, 5 difficulty levels, live Firestore leaderboard |
| 🤖 AI Assistant | Gemini-powered chatbot for any election question |
| 🌐 Multilingual | Hindi, Tamil, Telugu, Bengali via Google Translate API |
| 🔊 Text-to-Speech | Google TTS for full audio accessibility |
| 🗺️ Election Results Map | Interactive 2024 results map with D3.js |
| ♿ WCAG 2.1 AA | Skip links, focus rings, high contrast, font scaling |
| 🔒 Security Hardened | Helmet CSP, rate limiting, Zod validation, DOMPurify |

---

## 🌐 Google Services Used

| # | Service | Purpose |
|---|---------|---------|
| 1 | **Gemini 1.5 Flash** | AI chatbot for election Q&A |
| 2 | **Firebase Firestore** | Quiz scores, leaderboard, session logging |
| 3 | **Firebase Anonymous Auth** | Session tracking without requiring login |
| 4 | **Google Cloud Translation API** | Hindi, Tamil, Telugu, Bengali support |
| 5 | **Google Cloud Text-to-Speech API** | Audio accessibility for voter rights section |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                     │
│   Timeline │ Quiz │ AI Chat │ TTS │ Translate │ Map         │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch('/api/...')
┌────────────────────────▼────────────────────────────────────┐
│               Vercel Serverless Functions (/api)            │
│         Helmet │ CORS │ Rate Limiting │ Zod Validation      │
│   /api/chat  │  /api/quiz/*  │  /api/translate  │ /api/tts  │
└──────┬───────────────┬─────────────────┬──────────┬─────────┘
       │               │                 │          │
  ┌────▼───┐     ┌─────▼──────┐   ┌──────▼───┐ ┌───▼──────────┐
  │Gemini  │     │  Firebase  │   │ Google   │ │ Google TTS   │
  │1.5Flash│     │ Firestore  │   │Translate │ │     API      │
  └────────┘     └────────────┘   └──────────┘ └──────────────┘
```

---

## 📡 API Routes

| Method | Route | Description | Rate Limit |
|--------|-------|-------------|------------|
| `POST` | `/api/chat` | Gemini AI election Q&A | 10/min |
| `POST` | `/api/quiz/generate` | Generate quiz questions | 20/min |
| `POST` | `/api/quiz/submit` | Submit quiz score to Firestore | 100/min |
| `GET` | `/api/quiz/leaderboard` | Fetch top 10 scores | 100/min |
| `POST` | `/api/quiz/feedback` | Submit question feedback | 30/min |
| `POST` | `/api/translate` | Translate content to regional language | 30/min |

---

## 📚 Content Coverage

- **25 Quiz Questions** across 5 difficulty levels including History
- **13 Historical Elections** covered in depth (1951–2024)
- **543 Lok Sabha Constituencies** — 2024 & 2019 result data
- **EVM & VVPAT** deep dive with security feature breakdown
- **Voter Rights** section with plain-language explanations
- **Myth Busters** debunking common election misinformation

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- Google Cloud project with APIs enabled

```bash
# 1. Clone
git clone https://github.com/Viraj281105/VoteWise-India.git
cd VoteWise-India

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Fill in your API keys (see below)

# 4. Run
npm run dev
# → http://localhost:8080
```

---

## 🔑 Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
NODE_ENV=production
```

### Getting your keys

**Gemini API** → [aistudio.google.com](https://aistudio.google.com) → Create API key

**Firebase** → [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Service Accounts → Generate new private key

---

## 🧪 Testing

```bash
# Unit + Integration tests (Jest)
npm run test:coverage

# E2E tests (Playwright + axe-core accessibility)
npx playwright install
npm run test:e2e

# Run everything
npm run test:all
```

---

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Skip-to-main-content link
- Full keyboard navigation with visible focus rings
- High contrast mode toggle
- Font size controls (small / medium / large)
- ARIA live regions for all dynamic content
- TTS buttons throughout for screen reader support
- Automated accessibility testing with axe-core + Playwright

---

## 🔒 Security

- **Helmet.js** — HTTP security headers + strict CSP
- **express-rate-limit** — Per-route rate limiting
- **Zod** — Server-side input validation on all API routes
- **DOMPurify** — Client-side XSS protection
- **Firebase Anonymous Auth** — No PII collected
- **No secrets in frontend** — All API keys server-side only

---

## 📄 License

MIT — Built with ❤️ for Indian democracy.

---

*Built with Google Gemini AI, Firebase, and deployed on Vercel.*
