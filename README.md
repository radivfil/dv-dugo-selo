# Vrtić template (Astro + Tailwind): demo DV „Dugo Selo”

Ponovno iskoristiva osnova za web stranice vrtića i škola. Statične stranice (Astro), minimalno JavaScripta,
obrasci sa Supabaseom (ili demo način bez baze) i Sveltia CMS za tajništvo.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # statični izlaz u dist/ (GitHub Pages, Netlify, Vercel, Cloudflare Pages)
npm run check      # provjera tipova
```

## Objava (GitHub Pages)

Svaki push na `main` pokreće `.github/workflows/deploy.yml`: build s `SITE_URL` i `BASE_PATH` (podadresa =
naziv repozitorija) i objava na `https://<korisnik>.github.io/<repozitorij>/`. Komponente i sadržaj uvijek pišu
putanje od korijena (`/kontakt`, `/uploads/…`); `src/middleware.ts` im pri buildu dodaje podadresu.
Za vlastitu domenu ukloniti `BASE_PATH` iz workflowa i postaviti `site.url`.

Demo je isključen iz tražilica (`site.indexable: false` → noindex). Za pravu objavu postaviti na `true`.

## Struktura

```
src/
  config/site.ts          ← SVI podaci ustanove: naziv, boje, fontovi, kontakt, lokacije, izbornik, tekstovi, programi
  content/                ← sadržaj koji uređuje CMS (novosti, jelovnik, dokumenti, galerija)
  content.config.ts       ← sheme sadržaja (moraju odgovarati public/admin/config.yml)
  layouts/BaseLayout.astro← <head>, boje iz konfiguracije → CSS varijable, View Transitions
  components/
    layout/               ← Header (izbornik + mobilni panel), Footer
    sections/             ← Hero, QuickLinks, ProgramBento, LocationList, DocumentTable, NewsList, CtaBand, PageHeader
    forms/                ← FormShell (validacija, potvrda, animacija), FormField
    ui/                   ← Icon (Lucide), Logo (monogram), Photo (lazy + rezervirano mjesto), Badge, SectionHeading
  lib/submissions.ts      ← sloj za prijave: Supabase ili demo (localStorage)
  lib/pdf.ts              ← PDF zahtjeva za ispis (jsPDF, font s hrvatskim znakovima)
  scripts/                ← reveal (scroll animacije), forms (logika obrazaca)
  pages/                  ← 9 stranica izbornika (uklj. novosti), izjava o pristupačnosti, 404, admin
public/admin/config.yml   ← Sveltia CMS konfiguracija
supabase/                 ← schema.sql (tablica, RLS, storage) i edge funkcija za e-mail obavijesti
```

## Novi klijent (drugi vrtić ili škola)

1. `src/config/site.ts`: naziv, monogram, boje (`colors.light` / `colors.dark`), fontovi, kontakt, lokacije, izbornik, tekstovi.
2. `src/content/`: zamijeniti novosti, jelovnik, dokumente i galeriju (ili ih prepustiti tajništvu kroz CMS).
3. `public/admin/config.yml`: `backend.repo`, `site_url` i kategorije dokumenata (iste kao `documentCategories`).
4. `public/favicon.svg`: boje monograma.
5. `.env`: Supabase ključevi (vidi niže).

Komponente ne sadrže podatke o ustanovi, pa se ne diraju.

## Obrasci i Supabase

Bez `.env` stranica radi u **demo načinu**: prijave se spremaju u preglednik i vide na `/admin/prijave`.

Za pravu bazu (besplatni Supabase tier):

1. Napravi projekt na supabase.com i u SQL Editoru pokreni `supabase/schema.sql`.
2. Kopiraj `.env.example` u `.env` i upiši `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY`.
3. Authentication → Users: dodaj račune za tajništvo i isključi javnu registraciju.
4. E-mail obavijesti: deploy `supabase/functions/notify-submission` i Database Webhook na INSERT (upute u datotekama).

Posjetitelji smiju samo dodati prijavu i učitati sken (RLS). Čitanje i promjena statusa zahtijevaju prijavu djelatnika.

| Obrazac | Stranica | Tijek |
|---|---|---|
| Prijava izostanka | `/roditelji/prijava-izostanka` | obrazac → baza → e-mail (webhook) |
| Ispis djeteta | `/roditelji/ispis-djeteta` | obrazac → baza → PDF za potpis → upload skena (Storage) |
| Kontakt | `/kontakt#obrazac` | obrazac → baza |

## CMS (Sveltia)

`/admin`: novosti, tjedni jelovnik, PDF dokumenti (s pregledom PDF-a) i fotografije galerije.
Lokalno: u Chromeu ili Edgeu odabrati „Work with Local Repository” i mapu projekta.
Produkcija: GitHub prijava. Svaka izmjena je commit, nakon kojeg hosting automatski ponovno objavljuje stranicu.

## Animacije

- View Transitions (`<ClientRouter />` u BaseLayoutu) za prijelaze između stranica.
- CSS-first scroll-reveal: atribut `data-reveal` (+ `style="--reveal-i:N"` za redoslijed), `src/scripts/reveal.ts`.
- Funkcionalne mikro-animacije: potvrda uspjeha obrasca (iscrtavanje kvačice), trešnja obrasca pri grešci, hover stanja.
- Sve se isključuje uz `prefers-reduced-motion`.
- **GSAP / Framer Motion kasnije:** `Hero` ima slot `motion` za island komponentu:
  `<Hero ...><HeroMotion slot="motion" client:visible /></Hero>`. Za Framer Motion treba `npx astro add react`.

## Pristupačnost (bez widgeta)

Semantički HTML, poveznica za preskakanje, vidljiv fokus, kontrast ≥ 4,5:1 (svijetli i tamni način),
alt tekst, `prefers-reduced-motion`, `prefers-color-scheme`, klikabilni elementi ≥ 44×44 px,
obrasci sa sažetkom grešaka. Provjereno alatom axe-core (WCAG 2.2 AA) na svim stranicama, na širinama
320–1920 px i pri 150 % i 200 % sistemskog fonta.

## Tipografija

Riječi se ne rastavljaju na slogove (`hyphens: manual`), jer preglednici hrvatski rastavljaju nepouzdano.
Složenice s crticom (e-Upisi, e-pošta, Eko-škole) ne lome se na crtici: `src/middleware.ts` pri generiranju
stranica umeće nevidljivi WORD JOINER (U+2060) iza crtice. To vrijedi i za sadržaj iz CMS-a.

## Prije objave (TODO)

- [ ] Stvarne fotografije (trenutno su rezervirana mjesta s opisom): `public/uploads` ili kroz CMS
- [ ] Provjeriti adrese i telefone područnih objekata, e-adresu, OIB i koordinate karte (`site.ts`, označeno s TODO)
- [ ] Imena stručnog tima, broj djece u heroju
- [ ] Zamijeniti ogledne PDF-ove stvarnim dokumentima
- [ ] `backend.repo` u `public/admin/config.yml` i konačna domena (`site.url`)
- [ ] Izjava o pristupačnosti: status „potpuno usklađena” potvrditi neovisnom provjerom prije objave
