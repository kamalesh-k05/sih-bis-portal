import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite ?url import for the pdf.js worker
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

export interface ParsedFigure {
  id: string;
  page: number;
  kind: 'image' | 'page';
  thumbnail: string; // dataURL
  width: number;
  height: number;
  caption: string;
}

export interface ParsedTable {
  id: string;
  page: number;
  caption: string;
  rows: string[][];
  text: string; // flattened for search
}

export interface ParsedDoc {
  name: string;
  pages: number;
  figures: ParsedFigure[];
  tables: ParsedTable[];
  fullText: string;
  parsedAt: string;
}

interface TextItem { str: string; x: number; y: number; }

function toks(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 1);
}

// Group text items into rows by y, then split into columns by x-gaps.
// Consecutive row-groups with matching column counts + numeric cells => table.
function detectTables(items: TextItem[], page: number, docId: string): ParsedTable[] {
  const TOL = 3;
  const sorted = [...items].filter(i => i.str.trim()).sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: TextItem[][] = [];
  for (const it of sorted) {
    const row = rows.find(r => Math.abs(r[0].y - it.y) <= TOL);
    if (row) row.push(it); else rows.push([it]);
  }
  for (const r of rows) r.sort((a, b) => a.x - b.x);

  const tables: ParsedTable[] = [];
  let run: { row: TextItem[]; cols: string[] }[] = [];
  const flush = () => {
    if (run.length >= 3) {
      const rowsStr = run.map(r => r.cols);
      const numericCells = rowsStr.flat().filter(c => /\d/.test(c)).length;
      const totalCells = rowsStr.flat().length;
      if (totalCells >= 6 && numericCells / totalCells >= 0.3) {
        const text = rowsStr.map(r => r.join(' | ')).join('\n');
        tables.push({
          id: `${docId}-p${page}-t${tables.length + 1}`,
          page,
          caption: `Table on page ${page} (${rowsStr.length} rows x ${rowsStr[0].length} cols)`,
          rows: rowsStr,
          text,
        });
      }
    }
    run = [];
  };

  const colSplit = (row: TextItem[]): string[] => {
    const cols: string[] = [];
    let cur = row[0].str;
    for (let i = 1; i < row.length; i++) {
      const gap = row[i].x - (row[i - 1].x + row[i - 1].str.length * 5);
      if (gap > 28) { cols.push(cur.trim()); cur = row[i].str; }
      else cur += ' ' + row[i].str;
    }
    cols.push(cur.trim());
    return cols.filter(c => c);
  };

  let prevCols = -1;
  for (const row of rows) {
    if (row.length < 2) { flush(); prevCols = -1; continue; }
    const cols = colSplit(row);
    if (cols.length >= 2 && (prevCols === -1 || cols.length === prevCols)) {
      run.push({ row, cols });
      prevCols = cols.length;
    } else { flush(); prevCols = -1; }
  }
  flush();
  return tables;
}

async function extractImages(page: any, pageNum: number, docId: string): Promise<ParsedFigure[]> {
  const figs: ParsedFigure[] = [];
  try {
    const opList = await page.getOperatorList();
    const OPS = (pdfjsLib as any).OPS;
    const ids: string[] = [];
    for (let i = 0; i < opList.fnArray.length; i++) {
      if (opList.fnArray[i] === OPS.paintImageXObject) {
        const id = opList.argsArray[i]?.[0];
        if (id && !ids.includes(id)) ids.push(id);
      }
    }
    let n = 0;
    for (const id of ids) {
      try {
        const img: any = await new Promise(res => {
          try { page.objs.get(id, res); } catch { res(null); }
        });
        if (!img || !img.width || !img.height) continue;
        if (img.width < 60 && img.height < 60) continue; // skip tiny icons
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        let drawn = false;
        try { ctx.drawImage(img.bitmap || img, 0, 0); drawn = true; } catch { /* try raw */ }
        if (!drawn && img.data) {
          try {
            const imageData = ctx.createImageData(img.width, img.height);
            const src = img.data as Uint8Array | Uint8ClampedArray;
            const len = Math.min(src.length, imageData.data.length);
            for (let k = 0; k < len; k++) (imageData.data as any)[k] = (src as any)[k];
            ctx.putImageData(imageData, 0, 0);
            drawn = true;
          } catch { /* skip */ }
        }
        if (!drawn) continue;
        n++;
        figs.push({
          id: `${docId}-p${pageNum}-f${n}`,
          page: pageNum,
          kind: 'image',
          thumbnail: canvas.toDataURL('image/jpeg', 0.75),
          width: img.width, height: img.height,
          caption: `Figure ${n} on page ${pageNum} (${img.width}x${img.height})`,
        });
      } catch { /* next image */ }
    }
  } catch { /* no operator list */ }
  return figs;
}

export async function parsePdf(
  data: Uint8Array,
  name: string,
  onProgress?: (done: number, total: number) => void,
  maxPages = 60,
): Promise<ParsedDoc> {
  const docId = name.replace(/[^a-z0-9]+/gi, '-').slice(0, 24) || 'doc';
  const loadingTask = (pdfjsLib as any).getDocument({ data });
  const pdf = await loadingTask.promise;
  const total = Math.min(pdf.numPages, maxPages);
  const figures: ParsedFigure[] = [];
  const tables: ParsedTable[] = [];
  const textParts: string[] = [];

  for (let p = 1; p <= total; p++) {
    const page = await pdf.getPage(p);
    // text
    let items: TextItem[] = [];
    try {
      const tc = await page.getTextContent();
      items = tc.items
        .filter((it: any) => typeof it.str === 'string' && it.str.trim())
        .map((it: any) => ({ str: it.str, x: it.transform?.[4] || 0, y: it.transform?.[5] || 0 }));
      textParts.push(items.map(i => i.str).join(' '));
    } catch { /* ignore */ }
    // tables
    try {
      const found = detectTables(items, p, docId);
      tables.push(...found);
    } catch { /* ignore */ }
    // embedded diagrams
    try {
      const imgs = await extractImages(page, p, docId);
      figures.push(...imgs);
    } catch { /* ignore */ }
    // page thumbnail as fallback figure (always available)
    try {
      const viewport = page.getViewport({ scale: 0.45 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        figures.push({
          id: `${docId}-p${p}-page`,
          page: p,
          kind: 'page',
          thumbnail: canvas.toDataURL('image/jpeg', 0.6),
          width: canvas.width, height: canvas.height,
          caption: `Page ${p} preview`,
        });
      }
    } catch { /* ignore */ }
    try { page.cleanup(); } catch { /* ignore */ }
    onProgress?.(p, total);
  }

  try { await pdf.destroy(); } catch { /* ignore */ }

  return {
    name,
    pages: total,
    figures, tables,
    fullText: textParts.join('\n'),
    parsedAt: new Date().toISOString(),
  };
}

export interface ParsedSearchResult {
  figures: { fig: ParsedFigure; reason: string }[];
  tables: { tab: ParsedTable; reason: string }[];
  textHits: number;
}

export function searchParsedDoc(doc: ParsedDoc, query: string, max = 12): ParsedSearchResult {
  const q = query.toLowerCase().trim();
  const qt = new Set(toks(q));
  const figOut: { fig: ParsedFigure; reason: string }[] = [];
  const tabOut: { tab: ParsedTable; reason: string }[] = [];

  for (const f of doc.figures) {
    if (f.kind === 'page') continue; // thumbnails shown separately, not in search
    const hay = new Set([...toks(f.caption), ...toks(doc.name)]);
    let hit = 0;
    for (const t of qt) if (hay.has(t)) hit++;
    const codeHit = /is\s*\d+/i.test(q) && f.caption.toLowerCase().includes('figure');
    if (hit > 0 || codeHit || q.includes('diagram') || q.includes('figure') || q.includes('image')) {
      figOut.push({ fig: f, reason: hit > 0 ? `${hit} keyword hit(s)` : 'embedded figure' });
    }
  }
  for (const t of doc.tables) {
    const hay = new Set(toks(t.text + ' ' + t.caption));
    let hit = 0;
    for (const w of qt) if (hay.has(w)) hit++;
    if (hit > 0 || q.includes('table')) {
      tabOut.push({ tab: t, reason: hit > 0 ? `${hit} keyword hit(s)` : 'table in document' });
    }
  }
  const textHits = qt.size ? toks(doc.fullText).filter(w => qt.has(w)).length : 0;
  return {
    figures: figOut.slice(0, max),
    tables: tabOut.slice(0, max),
    textHits,
  };
}
