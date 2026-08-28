# BIS Smart Portal — AI Assistant for Indian Standards & BIS Services

**Smart India Hackathon Prototype**

> "Your simple guide to Indian product standards, BIS certification and product verification."

This is a complete, polished, working prototype for the SIH problem statement:
**"AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers"**

## 🏭 Two Clear User Journeys

1. **For Businesses / Industries** — Describe your product in plain language → get applicable IS codes → understand certification → follow the road to BIS certification.
2. **For Consumers** — Scan/enter BIS details → understand the result → learn about ISI, HUID, CRS → report problems.

## ✨ Key Features

- **Common-man-first UX** — tooltips ("What does this mean?") explain every technical term (ISI, HUID, QCO, CRS, IS number).
- **Grounded RAG pipeline** — BM25 + keyword + semantic hybrid search with Reciprocal Rank Fusion.
- **Anti-hallucination guard** — every IS code is validated against a source-derived whitelist. No invented standards.
- **Plain-English explanations** — the assistant explains WHAT standard and WHY it was selected, with source evidence.
- **Mandatory / Voluntary indicator** with QCO info.
- **Certification roadmap** — 7-step visual journey.
- **Document checklist** with progress tracking.
- **Consumer product verification** (clearly labeled prototype data).
- **Multilingual** — English, Hindi, Tamil (architecture supports more).
- **Judge / Demo mode** — retrieval metrics (Hit@3, MRR@5, latency), whitelist validation.
- **AI Assistant** — persistent chat widget with intent routing.
- **Works fully offline** — deterministic response generation, no LLM API required for core demo.

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Tailwind CSS + Vite |
| State | Zustand |
| Routing | React Router |
| Motion | Framer Motion |
| Backend | FastAPI + Uvicorn |
| Search | BM25 (rank-bm25) + semantic scoring |
| Database | In-memory verified standards dataset (SQLite-ready schema) |

## 🚀 Running Locally

### Frontend
```bash
cd sih-bis-portal
npm install
npm run dev
# opens at http://localhost:3000
```

### Backend (optional)
```bash
cd sih-bis-portal/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The core product experience (standards discovery, verification, assistant, judge demo) works **entirely in the browser** using embedded verified data. The FastAPI backend exposes the same RAG pipeline as an API.

## 🧪 Demo Scenarios (Judge Mode)

- **Business:** "I manufacture a building material."
- **Consumer:** "I bought a product with an ISI mark. How can I check it?"
- **Challenging:** "I manufacture a product but I don't know its IS number."
- **Hallucination guard:** Submit an invalid IS code — see it rejected.

## ⚠️ Important

- This is a **prototype** for demonstration purposes.
- Product verification results use **mock/demonstration data** — clearly labeled as such, never claiming to be the real BIS database.
- The tool is a **facilitator**, not a replacement for BIS. It never claims legal compliance.
- Final verification and certification must be done through **official BIS services** (bis.gov.in).

## 📁 Project Structure

```
src/
  components/    # Header, Footer, StandardCard, ConfidenceBadge, SourceEvidence, DocumentChecklist, AssistantChat, JudgeDemo, UserTypeCard
  pages/         # Home, BusinessJourney, ConsumerJourney, StandardsPage, Assistant, HelpPage, VerifyPage
  data/          # standards.ts (verified dataset + whitelist), translations.ts
  utils/         # searchEngine.ts, antiHallucination.ts, verificationEngine.ts, responseGenerator.ts
  store/         # Zustand app store
  types/         # TypeScript types
backend/
  main.py        # FastAPI + RAG endpoints
  search_engine.py
  anti_hallucination.py
  response_generator.py
  standards_data.py
```

---

*Prototype for Smart India Hackathon. Not affiliated with or endorsed by BIS.*
