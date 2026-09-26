import { DOC_FIGURES, type DocFigure } from '../data/documentIndex';

export interface DocSearchResult { fig: DocFigure; score: number; reason: string; }

function toks(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 1);
}

export function searchDocuments(query: string, max = 10): DocSearchResult[] {
  const q = query.toLowerCase().trim();
  const qt = new Set(toks(q));
  const out: DocSearchResult[] = [];

  for (const fig of DOC_FIGURES) {
    let score = 0;
    const reasons: string[] = [];
    const codeNorm = fig.isCode.toLowerCase().replace(/\s+/g, '');

    if (q.includes(fig.isCode.toLowerCase()) || q.replace(/\s+/g, '').includes(codeNorm)) {
      score += 6; reasons.push(`matches ${fig.isCode}`);
    }
    if ((q.includes('diagram') || q.includes('figure') || q.includes('fig')) && fig.kind === 'diagram') {
      score += 2; reasons.push('kind: diagram');
    }
    if (q.includes('table') && fig.kind === 'table') { score += 2; reasons.push('kind: table'); }

    const hay = new Set([...toks(fig.title), ...toks(fig.caption), ...fig.keywords.flatMap(toks)]);
    let overlap = 0;
    for (const t of qt) if (hay.has(t)) overlap++;
    if (overlap > 0) { score += overlap; reasons.push(`${overlap} keyword hit(s)`); }

    if (score > 0) out.push({ fig, score, reason: reasons.join(' · ') });
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, max);
}
