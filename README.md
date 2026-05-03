# 🗳️ VoteWise India

**An interactive, accessible, and multilingual educational platform that teaches Indian citizens how the election process works — from voter registration through result declaration.**

Built for the Google PromptWars Hackathon. Powered by 5 Google Cloud services.

---

## 📸 Screenshots

_Add screenshots after deployment._

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│  ┌───────────┐ ┌──────┐ ┌───────┐ ┌─────┐ ┌────────────┐   │
│  │ Timeline  │ │ Quiz │ │ Chat  │ │ TTS │ │ Translate  │   │
│  └─────┬─────┘ └──┬───┘ └──┬────┘ └──┬──┘ └─────┬──────┘   │
│        │          │        │         │           │           │
└────────┼──────────┼────────┼─────────┼───────────┼───────────┘
         │          │        │         │           │
    ┌────▼──────────▼────────▼─────────▼───────────▼──────┐
    │              Google Cloud Run (Express 5)            │
    │  ┌──────────────────────────────────────────────┐    │
    │  │  Middleware: Helmet │ CORS │ Rate Limit │ Zod │    │
    │  └──────────────────────────────────────────────┘    │
    │  ┌──────┐ ┌───────┐ ┌──────────┐ ┌──────┐           │
    │  │ Chat │ │ Quiz  │ │Translate │ │ TTS  │  Routes   │
    │  └──┬───┘ └──┬────┘ └────┬─────┘ └──┬───┘           │
    └─────┼────────┼───────────┼──────────┼────────────────┘
          │        │           │          │
    ┌─────▼──┐ ┌───▼────┐ ┌───▼────┐ ┌───▼──────────┐
    │ Gemini │ │Firebase│ │Google  │ │Google Text-  │
    │  1.5   │ │Firestore│ │Translate│ │to-Speech API│
    │ Flash  │ │ + Auth │ │  API   │ │              │
    └────────┘ └────────┘ └────────┘ └──────────────┘
```

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📖 Interactive Timeline | 8-step election process with animated cards |
| 🗺️ Constituency Explorer | Real 2024 Lok Sabha data for 15 constituencies |
| 📝 Quiz Engine | 20 questions, 4 difficulty levels, Firestore leaderboard |
| 🤖 AI Assistant | Gemini-powered chatbot for election questions |
| 🌐 Multilingual | Hindi, Tamil, Telugu, Bengali via Google Translate |
| 🔊 Text-to-Speech | Google TTS for accessibility |
| ♿ WCAG 2.1 AA | Skip links, focus management, high contrast, font scaling |
| 🔒 Security | Helmet CSP, rate limiting, Zod validation, DOMPurify |

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 20+
- Google Cloud project with APIs enabled

### Steps

```bash
# 1. Clone
git clone https://github.com/your-username/votewise-india.git
cd votewise-india

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Fill in your API keys in .env

# 4. Run
npm run dev

# 5. Open
# http://localhost:8080
```

---

## 🔑 API Keys Setup

### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Set `GEMINI_API_KEY` in `.env`

### Firebase
1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore Database** (test mode for dev)
3. Enable **Anonymous Authentication**
4. Go to Project Settings → Service Accounts → Generate new private key
5. Extract `project_id`, `private_key`, `client_email` to `.env`

### Google Cloud APIs
1. Enable **Cloud Translation API** in Google Cloud Console
2. Enable **Cloud Text-to-Speech API**
3. Create API keys and set in `.env`

---

## 📡 API Routes

| Method | Route | Description | Rate Limit |
|--------|-------|-------------|------------|
| `POST` | `/api/chat` | Gemini AI chat | 10/min |
| `POST` | `/api/quiz/submit` | Submit quiz score | 100/min |
| `GET` | `/api/quiz/leaderboard` | Top 10 scores | 100/min |
| `POST` | `/api/translate` | Translate text | 30/min |
| `POST` | `/api/tts` | Text-to-speech | 20/min |
| `GET` | `/health` | Health check | None |

---

## 🧪 Testing

```bash
# Unit + Integration (Jest)
npm run test:coverage

# E2E (Playwright)
npx playwright install
npm run test:e2e

# All tests
npm run test:all
```

---

## 🐳 Docker & Cloud Run Deployment

```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT_ID/votewise-india

# Deploy
gcloud run deploy votewise-india \
  --image gcr.io/PROJECT_ID/votewise-india \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=...,FIREBASE_PROJECT_ID=...,FIREBASE_CLIENT_EMAIL=...,FIREBASE_PRIVATE_KEY=...,GOOGLE_TRANSLATE_API_KEY=...,GOOGLE_TTS_API_KEY=...
```

---

## 🌐 Google Services Used

1. **Gemini 1.5 Flash** — AI chatbot for election Q&A
2. **Firebase Firestore** — Quiz scores, leaderboard, chat logging
3. **Firebase Anonymous Auth** — Session tracking without login
4. **Google Cloud Translation** — Hindi, Tamil, Telugu, Bengali support
5. **Google Cloud Text-to-Speech** — Audio accessibility for rights section

---

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Skip-to-main-content link
- Keyboard navigable (visible focus rings)
- High contrast mode toggle
- Font size controls (14px / 16px / 20px)
- ARIA live regions for dynamic content
- TTS buttons for screen reader support
- Tested with axe-core in Playwright

---

## 📄 License

MIT

---

_Built with Google Antigravity, Gemini AI, and Firebase._
