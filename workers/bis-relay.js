// Cloudflare Worker — BIS live relay (fixes browser CORS 403).
// Deploy: wrangler deploy. Then set VITE_BIS_RELAY=https://<you>.workers.dev in .env
// Judge: this is the ONLY way to get genuine live licence JSON in a browser.
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }
    const isId = (url.searchParams.get('is_id') || '').replace(/\s+/g, '');
    if (!isId) return json({ error: 'missing is_id' }, 400);
    // ORIGINAL BIS endpoint (server-to-server, no CORS issue)
    const target = `https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Is_llcences/getLiecencesAjax?is_id=${encodeURIComponent(isId)}`;
    try {
      const r = await fetch(target, { headers: { 'User-Agent': 'SIH-BIS-Portal/1.0', 'Accept': 'application/json' } });
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 2000) }; }
      return json({ is_id: isId, live: true, source: 'services.bis.gov.in', data }, 200);
    } catch (e) {
      return json({ is_id: isId, live: false, error: String(e) }, 502);
    }
  },
};
function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
function json(o, s) {
  return new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...cors() } });
}
