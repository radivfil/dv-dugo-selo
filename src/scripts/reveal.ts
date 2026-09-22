/**
 * Scroll-reveal: elementi s atributom [data-reveal] dobivaju klasu .is-visible kad uđu u pogled.
 * Sama animacija je u CSS-u (global.css) i isključena je uz prefers-reduced-motion.
 * Ponovno se pokreće nakon svakog View Transitions prijelaza (astro:page-load).
 */
let observer: IntersectionObserver | undefined;

function initReveal() {
  document.documentElement.classList.add('js');
  observer?.disconnect();

  const items = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => observer!.observe(el));
}

document.addEventListener('astro:page-load', initReveal);
// ClientRouter zamjenjuje atribute <html> nakon prijelaza, pa klasu .js vraćamo prije iscrtavanja.
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
