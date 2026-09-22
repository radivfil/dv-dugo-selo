/** Formatiranje datuma i tekstova na hrvatskom (koristi se na poslužitelju i u pregledniku). */

const dateFmt = new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateShort = (d: Date | string) => shortFmt.format(new Date(d));

/**
 * Složenice s crticom (e-Upisi, Horvat-Kovačević, primjer-dugo-selo.hr) ne lome se na crtici:
 * iza crtice između dva slova umeće se nevidljivi WORD JOINER (U+2060).
 * Koristi ga src/middleware.ts za sav HTML i admin za tekst koji iscrtava u pregledniku.
 */
export const keepHyphenatedWords = (text: string) => text.replace(/(\p{L})-(?=\p{L})/gu, '$1-\u2060');
