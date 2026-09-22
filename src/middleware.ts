/**
 * HTML middleware (radi pri buildu statičnih stranica i u dev načinu, pa pokriva i sadržaj iz CMS-a):
 *
 * 1. Tipografija: složenice s crticom (e-Upisi, e-pošta, Eko-škole…) ne smiju se prelomiti na
 *    crtici u dva retka. Iza crtice između dva slova umeće se WORD JOINER (U+2060), nevidljiv znak
 *    koji zabranjuje lom retka. Obrađuje se samo vidljivi tekst: oznake, atributi, <script> i <style>
 *    ostaju netaknuti.
 * 2. Podadresa: kad je stranica objavljena na podadresi (base, npr. /dv-dugo-selo), apsolutne
 *    putanje u href/src/action ("/kontakt", "/uploads/…") dobivaju taj prefiks. Tako komponente,
 *    konfiguracija i CMS sadržaj mogu uvijek pisati obične putanje od korijena.
 */
import { defineMiddleware } from 'astro:middleware';
import { keepHyphenatedWords } from './lib/format';

const SKIP_OR_TAG = /(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<textarea[\s\S]*?<\/textarea>|<[^>]+>)/gi;
const ROOT_PATH_ATTR = /(\s(?:href|src|action|poster)=["'])(\/(?!\/)[^"']*)/gi;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function keepHyphenatedWordsTogether(html: string): string {
  return html
    .split(SKIP_OR_TAG)
    .map((chunk) => (chunk.startsWith('<') ? chunk : keepHyphenatedWords(chunk)))
    .join('');
}

export function prefixBasePath(html: string): string {
  if (!BASE) return html;
  return html.replace(ROOT_PATH_ATTR, (match, attr: string, path: string) =>
    path === BASE || path.startsWith(`${BASE}/`) ? match : `${attr}${BASE}${path}`,
  );
}

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = prefixBasePath(keepHyphenatedWordsTogether(await response.text()));
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
});
