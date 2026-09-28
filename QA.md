# QA izvještaj — redizajn „življe” (grana `redesign-zivlje`)

**Datum:** 28. rujna 2026.
**Provjereno:** 14 ruta × 6 širina (320, 375, 768, 1024, 1440, 1920 px) × **svijetla i tamna tema**.
**Alati:** Playwright (Chromium), axe-core 4.10.3, vlastita mjerenja kontrasta po WCAG 2.1 formuli.
**Snimke:** `qa-screenshots/` (20 snimki: početna na 6 širina u obje teme + programi, galerija, upisi, roditelji).

## Kritično

Nema nalaza.

## Srednje

- [ ] **Filtar galerije nije u URL-u** — `/galerija`. Odabrana kategorija ne zapisuje se u adresu, pa se
      filtrirani prikaz ne može podijeliti poveznicom ni vratiti gumbom „natrag”. Tablica dokumenata to
      već radi ispravno (`?kategorija=…`).
- [ ] **Placeholder fotografije** — `public/images/placeholder/`. Fotografije su s Pexelsa i prikazuju
      strane vrtiće. Prije objave zamijeniti stvarnima, uz pisanu suglasnost roditelja za fotografije djece.

## Kozmetičko

- [ ] **`<img>` bez atributa `width` i `height`** — `src/components/ui/Photo.astro`. Prostor rezervira
      `aspect-ratio`, pa pomaka rasporeda nema; dimenzije fotografija iz CMS-a nisu unaprijed poznate.
- [ ] **Tamna „krem” ploha** (`washCream` `#2C2415`) u tamnoj temi djeluje smeđkasto. Funkcionalno je
      ispravna (kontrast teksta 13,5:1), ali se može zamijeniti neutralnijom ako smeta.

## Provjereno i uredno

- **Kontrast (korak 9):** axe-core bez ijedne povrede na 14 stranica u **obje teme**. Tema se postavlja
  prije iscrtavanja, pa mjerenje odgovara stvarnom stanju.
- **Ispravljeno tijekom audita:** posvijetljena plava `#0E76C0` više ne podnosi bijeli tekst s
  prozirnošću (`text-on-brand/85` je davao 3,9–4,3:1), pa je svugdje zamijenjen punom bijelom; oznake
  dobi u plavim pločicama prebačene su na bijelu podlogu s plavim tekstom; uklonjena je prozirnost
  brojača u adminu.
- **Vodoravni scroll:** nema ga ni na jednoj ruti, širini ni temi.
- **Preklapanje:** zaglavlje s prekidačem teme i izbornikom čisto na svim širinama.
- **Prelamanje riječi:** nijedna riječ se ne lomi usred.
- **Prekidač teme:** mijenja temu, pamti izbor (`localStorage`), preživi osvježavanje i prijelaz između
  stranica, ima `aria-pressed` i mijenja opis za čitač zaslona. Bez zapamćenog izbora prati postavku sustava.
- **Fotografije:** sve se učitavaju (0 grešaka 404), nijedno rezervirano mjesto više nije prazan okvir.
