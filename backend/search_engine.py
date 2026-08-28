from typing import List, Dict, Tuple
import math
import re
from collections import Counter
from standards_data import IndianStandard

# BM25 parameters
K1 = 1.5
B = 0.75


def tokenize(text: str) -> List[str]:
    if not text:
        return []
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    tokens = [t for t in text.split() if len(t) > 1]
    return tokens


def get_document_text(std: IndianStandard) -> str:
    parts = [
        std.id, std.title, std.category, std.subcategory, std.scope,
        std.description, ' '.join(std.keywords),
        ' '.join(std.product_examples),
        std.certification_scheme, std.applicability_reason,
        ' '.join(std.what_it_covers)
    ]
    return ' '.join(parts)


def build_df(documents: List[List[str]]) -> Dict[str, int]:
    df = {}
    for doc in documents:
        for term in set(doc):
            df[term] = df.get(term, 0) + 1
    return df


def bm25_score(query_terms, doc_terms, df, total_docs, avg_doc_len):
    score = 0.0
    doc_len = len(doc_terms)
    tf = Counter(doc_terms)
    for term in query_terms:
        freq = tf.get(term, 0)
        if freq == 0:
            continue
        doc_count = df.get(term, 0)
        idf = math.log((total_docs - doc_count + 0.5) / (doc_count + 0.5) + 1)
        tf_norm = (freq * (K1 + 1)) / (freq + K1 * (1 - B + B * (doc_len / avg_doc_len)))
        score += idf * tf_norm
    return score


def keyword_score(query: str, std: IndianStandard) -> float:
    q = query.lower()
    score = 0.0
    if std.category.lower() in q:
        score += 3
    if std.subcategory.lower() in q:
        score += 2
    for ex in std.product_examples:
        if ex.lower() in q:
            score += 4
    for kw in std.keywords:
        if kw.lower() in q:
            score += 2
    if std.id.lower() in q:
        score += 5
    return score


def semantic_score(query: str, std: IndianStandard) -> float:
    q_terms = set(tokenize(query))
    d_terms = set(tokenize(get_document_text(std)))
    overlap = len(q_terms & d_terms)
    return overlap / len(q_terms) if q_terms else 0.0


class SearchResult:
    def __init__(self, standard, bm25, keyword, semantic, combined, reason, confidence):
        self.standard = standard
        self.bm25_score = bm25
        self.keyword_score = keyword
        self.semantic_score = semantic
        self.combined_score = combined
        self.match_reason = reason
        self.confidence = confidence

    def to_dict(self):
        return {
            'standard': self.standard.to_dict(),
            'bm25_score': round(self.bm25_score, 3),
            'keyword_score': round(self.keyword_score, 3),
            'semantic_score': round(self.semantic_score, 3),
            'combined_score': round(self.combined_score, 3),
            'match_reason': self.match_reason,
            'confidence': self.confidence,
        }


def generate_match_reason(query: str, std: IndianStandard) -> str:
    q = query.lower()
    for ex in std.product_examples:
        if ex.lower() in q:
            return f'Your product matches "{ex}" which falls under the scope of {std.id}.'
    if std.category.lower() in q:
        return f'Your product belongs to the "{std.category}" category, which is covered by {std.id}.'
    for kw in std.keywords:
        if kw.lower() in q:
            return f'The term "{kw}" in your description relates to {std.id} — {std.title}.'
    return f'Based on your product description, this standard may be relevant to your product category.'


def search_standards(query: str, standards: List[IndianStandard], max_results: int = 10) -> List[SearchResult]:
    q_terms = tokenize(query)
    documents = [tokenize(get_document_text(s)) for s in standards]
    df = build_df(documents)
    total = len(standards)
    avg_len = sum(len(d) for d in documents) / total if total else 0

    results = []
    for std in standards:
        doc_terms = tokenize(get_document_text(std))
        bm25 = bm25_score(q_terms, doc_terms, df, total, avg_len)
        kw = keyword_score(query, std)
        sem = semantic_score(query, std)
        combined = bm25 * 0.4 + kw * 0.35 + sem * 0.25

        if combined > 0.5 or kw > 3:
            confidence = 'high' if combined > 3 else ('medium' if combined > 1.5 else 'low')
            results.append(SearchResult(std, bm25, kw, sem, combined, generate_match_reason(query, std), confidence))

    results.sort(key=lambda r: r.combined_score, reverse=True)
    return results[:max_results]


def reciprocal_rank_fusion(ranked_lists, k: int = 60):
    scores = {}
    for lst in ranked_lists:
        for rank, item in enumerate(lst):
            rrf = 1.0 / (k + rank + 1)
            std_id = item['standard']['id'] if isinstance(item, dict) else item.standard.id
            if std_id in scores:
                scores[std_id]['score'] += rrf
            else:
                scores[std_id] = {'standard': item if isinstance(item, dict) else item.to_dict(), 'score': rrf}
    return sorted(scores.values(), key=lambda x: x['score'], reverse=True)
