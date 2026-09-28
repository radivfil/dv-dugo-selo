/**
 * Preuzima placeholder fotografije s Pexelsa u public/images/placeholder/.
 * Ključ se čita iz .env (PEXELS_API_KEY) i nikad se ne zapisuje u kod ni u ispis.
 * Pokretanje: node scripts/fetch-pexels.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const key = readFileSync('.env', 'utf8').match(/PEXELS_API_KEY=(.+)/)?.[1]?.trim();
if (!key) throw new Error('Nedostaje PEXELS_API_KEY u .env');

const OUT = 'public/images/placeholder';
mkdirSync(OUT, { recursive: true });

// upit → koliko fotografija i kako ih imenovati
const QUERIES = [
  { q: 'kindergarten classroom colorful', alt: 'kindergarten classroom', slug: 'ucionica', count: 3 },
  { q: 'children playing preschool', alt: 'children playing', slug: 'igra', count: 3 },
  { q: 'kids painting activity', alt: 'children painting', slug: 'slikanje', count: 3 },
  { q: 'preschool playground', alt: 'playground children', slug: 'igraliste', count: 3 },
];

/** Pexels zna vratiti 500 na pojedini upit: tri pokušaja, pa pričuvni upit. */
async function search(query, count) {
  for (let i = 0; i < 3; i++) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&size=large`;
    const res = await fetch(url, { headers: { Authorization: key } });
    if (res.ok) return (await res.json()).photos;
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
  }
  return null;
}

const manifest = [];

for (const { q, alt, slug, count } of QUERIES) {
  const photos = (await search(q, count)) ?? (await search(alt, count));
  if (!photos) throw new Error(`Pexels ne odgovara za "${q}"`);

  for (const [i, p] of photos.entries()) {
    const name = `${slug}-${i + 1}.jpg`;
    const path = `${OUT}/${name}`;
    if (!existsSync(path)) {
      const img = await fetch(p.src.large2x);
      writeFileSync(path, Buffer.from(await img.arrayBuffer()));
    }
    manifest.push({ file: name, query: q, photographer: p.photographer, photographerUrl: p.photographer_url, pageUrl: p.url, alt: p.alt || '' });
    console.log(`${name}  ${p.photographer}`);
  }
}

const readme = `# PLACEHOLDER FOTOGRAFIJE

**Pexels licenca:** besplatno, komercijalna upotreba dozvoljena, atribucija nije obavezna.
https://www.pexels.com/license/

> **ZAMIJENITI STVARNIM FOTOGRAFIJAMA VRTIĆA PRIJE LANSIRANJA.**
> Za objavu fotografija djece potrebna je pisana suglasnost roditelja.

| Datoteka | Fotograf | Upit | Izvor |
|---|---|---|---|
${manifest.map((m) => `| \`${m.file}\` | ${m.photographer} | ${m.query} | ${m.pageUrl} |`).join('\n')}

Preuzeto skriptom \`scripts/fetch-pexels.mjs\` (${new Date().toLocaleDateString('hr-HR')}).
`;
writeFileSync(`${OUT}/README.md`, readme);
writeFileSync(`${OUT}/photos.json`, JSON.stringify(manifest, null, 2));
console.log(`\nUkupno: ${manifest.length} fotografija + README.md + photos.json`);
