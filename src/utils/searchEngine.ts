import { IndianStandard, PRODUCT_STANDARD_MAPPINGS } from '../data/standards';

const K1 = 1.5;
const B = 0.75;

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function buildDF(documents: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  for (const doc of documents) {
    const uniqueTerms = new Set(doc);
    for (const term of uniqueTerms) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }
  return df;
}

function bm25Score(
  queryTerms: string[],
  documentTerms: string[],
  df: Map<string, number>,
  totalDocs: number,
  avgDocLength: number
): number {
  let score = 0;
  const docLength = documentTerms.length;
  const termFreq = new Map<string, number>();

  for (const term of documentTerms) {
    termFreq.set(term, (termFreq.get(term) || 0) + 1);
  }

  for (const term of queryTerms) {
    const tf = termFreq.get(term) || 0;
    const docCount = df.get(term) || 0;

    if (tf === 0) continue;

    const idf = Math.log((totalDocs - docCount + 0.5) / (docCount + 0.5) + 1);
    const tfNorm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (docLength / avgDocLength)));

    score += idf * tfNorm;
  }

  return score;
}

function getDocumentText(std: IndianStandard): string {
  return [
    std.id,
    std.title,
    std.category,
    std.subcategory,
    std.scope,
    std.description,
    std.keywords.join(' '),
    std.productExamples.join(' '),
    std.certificationScheme,
    std.applicabilityReason,
    std.whatItCovers.join(' '),
  ].join(' ');
}

export interface SearchResult {
  standard: IndianStandard;
  bm25Score: number;
  keywordScore: number;
  semanticScore: number;
  combinedScore: number;
  matchReason: string;
  confidence: 'high' | 'medium' | 'low';
}

function keywordScore(query: string, standard: IndianStandard): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  if (queryLower.includes(standard.category.toLowerCase())) score += 3;
  if (queryLower.includes(standard.subcategory.toLowerCase())) score += 2;

  for (const example of standard.productExamples) {
    if (queryLower.includes(example.toLowerCase())) score += 4;
  }

  for (const keyword of standard.keywords) {
    if (queryLower.includes(keyword.toLowerCase())) score += 2;
  }

  if (queryLower.includes(standard.id.toLowerCase())) score += 5;

  return score;
}

function semanticScore(query: string, standard: IndianStandard): number {
  const queryTerms = new Set(tokenize(query));
  const docTerms = new Set(tokenize(getDocumentText(standard)));

  let overlap = 0;
  for (const term of queryTerms) {
    if (docTerms.has(term)) overlap++;
  }

  return queryTerms.size > 0 ? overlap / queryTerms.size : 0;
}

export function searchStandards(
  query: string,
  standards: IndianStandard[],
  maxResults: number = 10
): SearchResult[] {
  const queryTerms = tokenize(query);
  const documents = standards.map(s => tokenize(getDocumentText(s)));
  const df = buildDF(documents);
  const totalDocs = standards.length;
  const avgDocLength = documents.reduce((sum, d) => sum + d.length, 0) / totalDocs;

  const results: SearchResult[] = [];

  for (let i = 0; i < standards.length; i++) {
    const bm25 = bm25Score(queryTerms, documents[i], df, totalDocs, avgDocLength);
    const kw = keywordScore(query, standards[i]);
    const sem = semanticScore(query, standards[i]);

    const combined = bm25 * 0.4 + kw * 0.35 + sem * 0.25;

    if (combined > 0.5 || kw > 3) {
      const confidence = combined > 3 ? 'high' : combined > 1.5 ? 'medium' : 'low';

      results.push({
        standard: standards[i],
        bm25Score: bm25,
        keywordScore: kw,
        semanticScore: sem,
        combinedScore: combined,
        matchReason: generateMatchReason(query, standards[i]),
        confidence,
      });
    }
  }

  results.sort((a, b) => b.combinedScore - a.combinedScore);

  return results.slice(0, maxResults);
}

function generateMatchReason(query: string, standard: IndianStandard): string {
  const queryLower = query.toLowerCase();

  for (const example of standard.productExamples) {
    if (queryLower.includes(example.toLowerCase())) {
      return `Your product matches "${example}" which falls under the scope of ${standard.id}.`;
    }
  }

  if (queryLower.includes(standard.category.toLowerCase())) {
    return `Your product belongs to the "${standard.category}" category, which is covered by ${standard.id}.`;
  }

  for (const keyword of standard.keywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      return `The term "${keyword}" in your description relates to ${standard.id} - ${standard.title}.`;
    }
  }

  return `Based on your product description, this standard may be relevant to your product category.`;
}

export function lookupProductMapping(query: string) {
  const queryLower = query.toLowerCase();

  for (const mapping of PRODUCT_STANDARD_MAPPINGS) {
    const mappingWords = mapping.productQuery.toLowerCase().split(' ');
    const queryWords = queryLower.split(' ');

    const overlap = mappingWords.filter(w => queryWords.includes(w)).length;
    const threshold = Math.min(mappingWords.length, queryWords.length) * 0.4;

    if (overlap >= threshold) {
      return mapping;
    }
  }

  return null;
}

export function validateISCode(code: string, whitelist: Set<string>): boolean {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, ' ');
  return whitelist.has(normalized);
}

export function extractISCodes(text: string): string[] {
  const pattern = /IS\s*\d+(\.\d+)?/gi;
  const matches = text.match(pattern) || [];
  return [...new Set(matches.map(m => m.trim().toUpperCase()))];
}

export function reciprocalRankFusion(
  rankedLists: { standard: IndianStandard; score: number }[][],
  k: number = 60
): { standard: IndianStandard; rrfScore: number }[] {
  const scores = new Map<string, { standard: IndianStandard; score: number }>();

  for (const list of rankedLists) {
    list.forEach((item, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      const existing = scores.get(item.standard.id);
      if (existing) {
        existing.score += rrfScore;
      } else {
        scores.set(item.standard.id, { standard: item.standard, score: rrfScore });
      }
    });
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(item => ({ standard: item.standard, rrfScore: item.score }));
}
