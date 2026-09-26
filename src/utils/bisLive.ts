import type { IndianStandard } from '../data/standards';

export interface LiveResult {
  ok: boolean;
  live: boolean;
  source: string;
  message: string;
  officialLinks: { label: string; url: string }[];
  fetchedAt: string;
  rowCount: number;
  // BIS 'is_id' is an INTERNAL database key, NOT the IS standard number.
  // Rows returned for a query must be verified on the original page — never
  // presented as confirmed licences of the displayed standard.
  mappingVerified: boolean;
}

function isCodeOf(std: IndianStandard): string {
  return std.id.replace(/\s+/g, '').toUpperCase();
}

export function getOfficialLinks(std: IndianStandard): { label: string; url: string }[] {
  const code = isCodeOf(std);
  const q = encodeURIComponent(std.id);
  const links = [
    { label: 'BIS portal (bis.gov.in)', url: `https://bis.gov.in/?s=${q}` },
    { label: 'ManakOnline certificate search', url: 'https://manakonline.in/MANAK/login' },
    { label: 'BIS licence search (services.bis.gov.in)', url: `https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/isdetails?ID=${q}` },
    { label: 'CRS registry (crsbis.in)', url: 'https://crsbis.in/BIS/' },
  ];
  if (std.officialLink) links.unshift({ label: 'Official standard page', url: std.officialLink });
  void code;
  return links;
}

// Tries the ORIGINAL BIS endpoint directly. Browser CORS usually blocks it
// (verified: no ACAO header, OPTIONS 403) — so we report honestly and fall
// back to cached + deep links. When a serverless relay is configured via
// VITE_BIS_RELAY (e.g. Cloudflare Worker), we fetch live licence JSON.
export async function fetchLiveStandard(std: IndianStandard, timeoutMs = 6000): Promise<LiveResult> {
  const officialLinks = getOfficialLinks(std);
  const relay = (import.meta as any).env?.VITE_BIS_RELAY as string | undefined;
  const fetchedAt = new Date().toISOString();

  // The IS number (e.g. "IS 1077") is NOT the BIS internal id — strip to digits
  // only for the query attempt, and NEVER claim returned rows belong to the standard.
  const digits = (std.id.match(/\d+/) || [''])[0];

  if (!relay) {
    return {
      ok: true, live: false,
      source: 'cached + official BIS links',
      message: `Showing verified cached data for ${std.id} with direct links to the ORIGINAL BIS site below.`,
      officialLinks, fetchedAt, rowCount: 0, mappingVerified: false,
    };
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${relay}?is_id=${encodeURIComponent(digits)}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) throw new Error(`relay ${r.status}`);
    const j = await r.json().catch(() => null);
    const rows = Array.isArray(j?.data?.aaData) ? j.data.aaData.length : 0;
    return {
      ok: true, live: true,
      source: 'services.bis.gov.in (live via relay)',
      message: rows > 0
        ? `BIS server answered LIVE (${rows} licence row${rows !== 1 ? 's' : ''} returned). BIS uses internal IDs, so confirm the match on the original page below — rows are not auto-attributed to ${std.id}.`
        : `BIS server answered LIVE (0 rows for this query). The standard's details below are cached; confirm on the original page.`,
      officialLinks, fetchedAt, rowCount: rows, mappingVerified: false,
    };
  } catch (e: any) {
    clearTimeout(t);
    return {
      ok: true, live: false,
      source: 'cached + official BIS links',
      message: `Live fetch failed (${e?.message || 'network/CORS'}). Showing cached data for ${std.id} — open the ORIGINAL BIS link below to verify.`,
      officialLinks, fetchedAt, rowCount: 0, mappingVerified: false,
    };
  }
}
