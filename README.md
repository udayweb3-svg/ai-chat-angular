# AkiroAI — Angular AI Chat App

![Angular](https://img.shields.io/badge/Angular-17-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/Google%20Gemini-API-orange?logo=google)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

A production-ready conversational AI chat application built with **Angular 17** and the **Google Gemini API**. Features multi-turn conversation memory, secure API key handling via serverless proxy, and CI/CD deployment on Vercel.

**🔗 Live Demo:** [akiroai-udaynand.vercel.app](https://akiroai-udaynand.vercel.app)

---

## ✨ Features

- 💬 **Multi-turn conversations** — Gemini remembers full chat context
- 🔒 **Secure API proxy** — API key never exposed in the browser
- ⚡ **Angular 17 Standalone** — Modern architecture, no NgModule
- 🎨 **ChatGPT-like UI** — Textarea input, typing indicator, auto-scroll
- 🔁 **Graceful fallback** — Mock responses when API is unavailable
- 🚀 **CI/CD pipeline** — Auto-deploy on every GitHub push via Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Standalone Components), TypeScript, SCSS |
| AI Model | Google Gemini Flash (via Generative Language API) |
| Backend | Vercel Serverless Function (API proxy) |
| Deployment | Vercel + GitHub CI/CD |

---

## 🏗️ Architecture

```
User (Browser)
     │
     ▼
Angular App  ──POST /api/chat──▶  Vercel Serverless Function
                                          │
                                          ▼
                                  Google Gemini API
                                  (key stored securely
                                   in Vercel env vars)
```

The Angular frontend **never calls Gemini directly**. All API requests go through `/api/chat` — a serverless function that injects the API key server-side. This is the production-standard pattern for securing third-party API keys in frontend apps.

---

## 📁 Project Structure

```
ai-chat-angular/
├── api/
│   └── chat.js                  # Vercel serverless proxy function
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── chat/            # Main chat UI component
│   │   │   └── history-sidebar/ # Conversation history sidebar
│   │   └── services/
│   │       └── gemini.service.ts # Gemini API service (multi-turn)
│   └── environments/
│       └── environment.example.ts # Safe example (copy & rename)
├── setup-env.js                 # Build-time env injection script
├── vercel.json                  # Vercel config (routes + build)
└── angular.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI 17: `npm install -g @angular/cli`
- Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/udayweb3-svg/ai-chat-angular.git
cd ai-chat-angular

# 2. Install dependencies
npm install

# 3. Set up environment
cp src/environments/environment.example.ts src/environments/environment.ts
# Edit environment.ts and add your Gemini API key

# 4. Run locally
ng serve
# Open http://localhost:4200
```

### Environment Variables

Create `src/environments/environment.ts` (not committed to Git):

```typescript
export const environment = {
  production: false,
  geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE'
};
```

> **Note:** Get a free API key at [aistudio.google.com](https://aistudio.google.com). Free tier allows 1,500 requests/day.

---

## ☁️ Deploying to Vercel

1. Fork this repo and import it into [vercel.com](https://vercel.com)
2. Add environment variable in Vercel dashboard:
   - Key: `GEMINI_API_KEY` | Value: your API key
3. Vercel auto-runs `setup-env.js` during build to inject the key
4. Every push to `main` triggers an automatic redeploy

---

## 🔐 Security

- API key stored as a **Vercel environment variable** — never in source code
- `src/environments/environment.ts` is in `.gitignore`
- All Gemini calls proxied through `/api/chat` serverless function
- Browser network tab shows only `/api/chat` — API key is never visible

---

## 🧠 How Multi-Turn Memory Works

```typescript
// Each message is added to history
this.history.push({ role: 'user', content: userMessage });

// Full history sent with every request in Gemini's native format
const contents = this.history.map(entry => ({
  role: entry.role === 'user' ? 'user' : 'model',
  parts: [{ text: entry.content }]
}));
```

Since the Gemini API is stateless, the full conversation history is sent with every request. This gives Gemini context to understand follow-up questions.

---

## 🗺️ Roadmap

- [x] Basic chat UI with Angular 17 standalone
- [x] Gemini API integration with multi-turn memory
- [x] Secure serverless proxy on Vercel
- [x] CI/CD via GitHub + Vercel
- [ ] Chat history persistence (localStorage)
- [ ] Export conversation as PDF
- [ ] Multiple AI model selection (Gemini Pro / Flash)
- [ ] RAG integration — document Q&A feature

---

## 👤 Author

**Uday Nand**
Full Stack Developer | Angular & AI Integration

- GitHub: [@udayweb3-svg](https://github.com/udayweb3-svg)
- Email: udayweb3@gmail.com

---

## 📄 License

MIT License — feel free to use this project as a template.
