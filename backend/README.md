# BIS Smart Portal Backend

FastAPI backend implementing a RAG pipeline for Indian Standards retrieval.

## Architecture

User Query → Intent Detection → Hybrid Retrieval (BM25 + Keyword + Semantic) → Reciprocal Rank Fusion → Whitelist Validation → Response Generation

## Features
- BM25 keyword retrieval
- Semantic similarity scoring
- Anti-hallucination IS code whitelist
- Deterministic (offline) response generation — no LLM API required
- Judge evaluation metrics endpoint

## Running

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs
