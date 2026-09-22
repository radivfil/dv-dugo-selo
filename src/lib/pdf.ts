/**
 * Generira PDF zahtjeva za ispis djeteta za vlastoručni potpis (u pregledniku, jsPDF).
 * Font Poppins (public/fonts) ugrađuje se u PDF radi ispravnog prikaza č, ć, đ, š, ž.
 * jsPDF se učitava tek kad korisnik zatraži PDF.
 */
import { site } from '../config/site';
import type { NewSubmission } from './submissions';

async function fontBase64(url: string) {
  const buf = await (await fetch(url)).arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

// Fontovi su u public/fonts; BASE_URL pokriva objavu na podadresi (npr. GitHub Pages).
const FONT_DIR = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/fonts`;

const hrDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('hr-HR') : '—');

export async function downloadWithdrawalPdf(id: string, data: NewSubmission) {
  const [{ jsPDF }, regular, semibold] = await Promise.all([
    import('jspdf'),
    fontBase64(`${FONT_DIR}/Poppins-Regular.ttf`),
    fontBase64(`${FONT_DIR}/Poppins-SemiBold.ttf`),
  ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.addFileToVFS('Poppins-Regular.ttf', regular);
  doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
  doc.addFileToVFS('Poppins-SemiBold.ttf', semibold);
  doc.addFont('Poppins-SemiBold.ttf', 'Poppins', 'bold');

  const brand = site.colors.light.brand;
  const left = 20;
  let y = 20;

  // Zaglavlje ustanove
  doc.setFillColor(brand);
  doc.rect(0, 0, 210, 6, 'F');
  doc.setFont('Poppins', 'bold');
  doc.setFontSize(12);
  doc.text(site.legalName, left, y);
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(9);
  doc.text(`${site.contact.address}, ${site.contact.postalCity} · tel. ${site.contact.phone} · ${site.contact.email}`, left, (y += 5));

  doc.setFont('Poppins', 'bold');
  doc.setFontSize(16);
  doc.text('ZAHTJEV ZA ISPIS DJETETA IZ VRTIĆA', left, (y += 18));
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(9);
  doc.text(`Broj prijave: ${id.slice(0, 8).toUpperCase()}   ·   Zaprimljeno elektronički: ${new Date().toLocaleDateString('hr-HR')}`, left, (y += 6));

  const d = data.details;
  const rows: [string, string][] = [
    ['Ime i prezime djeteta', data.child_name ?? '—'],
    ['Datum rođenja djeteta', hrDate(d.birth_date)],
    ['Objekt', d.location ?? '—'],
    ['Skupina', d.group ?? '—'],
    ['Posljednji dan u vrtiću', hrDate(data.date)],
    ['Razlog ispisa', d.reason ?? '—'],
    ['Roditelj / skrbnik', data.parent_name],
    ['Adresa', d.address ?? '—'],
    ['E-pošta', data.parent_contact],
    ['Telefon', d.phone ?? '—'],
  ];

  y += 8;
  doc.setFontSize(10.5);
  for (const [label, value] of rows) {
    y += 9;
    doc.setDrawColor('#D9D4C7');
    doc.line(left, y + 2.5, 190, y + 2.5);
    doc.setFont('Poppins', 'bold');
    doc.text(label, left, y);
    doc.setFont('Poppins', 'normal');
    doc.text(doc.splitTextToSize(value, 100), 90, y);
  }

  y += 16;
  doc.setFontSize(10);
  const statement =
    'Izjavljujem da ispisujem dijete iz vrtića s navedenim datumom te da sam upoznat/a s obvezom podmirenja svih troškova ' +
    'boravka do posljednjeg dana u vrtiću. Potvrđujem da su navedeni podaci točni.';
  doc.text(doc.splitTextToSize(statement, 170), left, y);

  if (d.note) {
    y += 16;
    doc.setFont('Poppins', 'bold');
    doc.text('Napomena:', left, y);
    doc.setFont('Poppins', 'normal');
    doc.text(doc.splitTextToSize(d.note, 170), left, (y += 6));
  }

  // Potpis
  const sigY = 245;
  doc.line(left, sigY, 85, sigY);
  doc.line(120, sigY, 190, sigY);
  doc.setFontSize(9);
  doc.text('Mjesto i datum', left, sigY + 5);
  doc.text('Potpis roditelja / skrbnika', 120, sigY + 5);

  doc.setFontSize(8);
  doc.setTextColor('#4A5468');
  doc.text(
    doc.splitTextToSize(
      'Potpisani zahtjev skenirajte ili fotografirajte i učitajte na stranici za ispis djeteta, ili ga predajte u tajništvu vrtića.',
      170,
    ),
    left,
    275,
  );

  const safe = (data.child_name ?? 'dijete').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\W+/g, '-');
  doc.save(`zahtjev-za-ispis-${safe.toLowerCase()}.pdf`);
}
