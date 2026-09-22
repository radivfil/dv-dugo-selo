/**
 * Pomoćna skripta za demo: za svaki zapis u src/content/dokumenti/*.yml kreira
 * ogledni PDF u public/dokumenti/ ako još ne postoji. Pokretanje: npm run pdfs
 * Stvarni dokumenti zamijenit će ove datoteke kroz CMS.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { jsPDF } from 'jspdf';

const dir = 'src/content/dokumenti';
const font = readFileSync('public/fonts/Poppins-Regular.ttf').toString('base64');

for (const name of readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
  const src = readFileSync(join(dir, name), 'utf8');
  const get = (key) => src.match(new RegExp(`^${key}:\\s*'?(.+?)'?$`, 'm'))?.[1] ?? '';
  const out = join('public', get('file').replace(/^\//, ''));
  if (existsSync(out)) continue;

  const doc = new jsPDF();
  doc.addFileToVFS('Poppins.ttf', font);
  doc.addFont('Poppins.ttf', 'Poppins', 'normal');
  doc.setFont('Poppins');
  doc.setFontSize(10);
  doc.text('Dječji vrtić Dugo Selo — OGLEDNI DOKUMENT (demo)', 20, 20);
  doc.setFontSize(18);
  doc.text(doc.splitTextToSize(get('title'), 170), 20, 40);
  doc.setFontSize(11);
  doc.text(`Kategorija: ${get('category')}`, 20, 62);
  doc.text(`Datum: ${get('date')}`, 20, 70);
  doc.text(doc.splitTextToSize('Ovo je privremeni dokument za prikaz stranice. Tajništvo ga zamjenjuje stvarnim PDF-om kroz /admin.', 170), 20, 86);
  writeFileSync(out, Buffer.from(doc.output('arraybuffer')));
  console.log('PDF:', out);
}
