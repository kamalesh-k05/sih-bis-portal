import { useEffect } from 'react';

const SITE_URL = 'https://kamalesh-k05.github.io/sih-bis-portal';
const SITE_NAME = 'BIS Smart Portal';
const BASE_DESCRIPTION =
  'AI-powered assistant for Indian Standards and BIS Services. Find the right Indian Standard, understand BIS certification, verify genuine products, and access help — all in one place.';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  schema?: Array<Record<string, any>>;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({
  title = SITE_NAME,
  description = BASE_DESCRIPTION,
  path = '/',
  schema = [],
}: SeoProps) {
  useEffect(() => {
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', `${SITE_URL}${path}`);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${path}`);

    const scripts = schema.map((obj) => ({
      type: obj['@type'] as string,
      json: JSON.stringify(obj),
    }));

    const existing = document.head.querySelectorAll<HTMLScriptElement>(
      'script[data-seo-jsonld]'
    );
    existing.forEach((s) => s.remove());

    scripts.forEach((s, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = s.json;
      document.head.appendChild(script);
    });
  }, [title, description, path, JSON.stringify(schema)]);

  return null;
}

export { SITE_URL, SITE_NAME };
