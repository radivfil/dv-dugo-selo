/**
 * Sloj za prijave iz obrazaca (izostanak, ispis, kontakt).
 *
 * Dva načina rada, bez izmjene ostatka koda:
 *  - SUPABASE: ako su postavljeni PUBLIC_SUPABASE_URL i PUBLIC_SUPABASE_ANON_KEY (.env),
 *    prijave idu u tablicu `submissions`, a skenovi u Storage bucket `skenovi`.
 *    Shema i RLS pravila: supabase/schema.sql
 *  - DEMO: bez ključeva sve se sprema u localStorage preglednika (samo za prezentaciju).
 *
 * Supabase klijent učitava se dinamički, pa se u demo načinu ne preuzima nimalo dodatnog koda.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type SubmissionType = 'izostanak' | 'ispis' | 'kontakt';
export type SubmissionStatus = 'nova' | 'u_obradi' | 'rijeseno';

export interface Submission {
  id: string;
  created_at: string;
  type: SubmissionType;
  child_name: string | null;
  parent_name: string;
  parent_contact: string;
  date: string | null;
  details: Record<string, string>;
  attachment_path: string | null;
  status: SubmissionStatus;
}

export type NewSubmission = Omit<Submission, 'id' | 'created_at' | 'status' | 'attachment_path'>;

export const TYPE_LABELS: Record<SubmissionType, string> = {
  izostanak: 'Prijava izostanka',
  ispis: 'Ispis djeteta',
  kontakt: 'Kontakt upit',
};

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  nova: 'Nova',
  u_obradi: 'U obradi',
  rijeseno: 'Riješeno',
};

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
export const isDemoMode = !SUPABASE_URL || !SUPABASE_KEY;

const BUCKET = 'skenovi';
const DEMO_KEY = 'dv-demo-submissions';
const DEMO_FILES_KEY = 'dv-demo-files';

let client: Promise<SupabaseClient> | undefined;
export function getSupabase(): Promise<SupabaseClient> {
  if (isDemoMode) throw new Error('Supabase nije konfiguriran (demo način).');
  client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(SUPABASE_URL!, SUPABASE_KEY!));
  return client;
}

/* ---------------- Demo spremište (localStorage) ---------------- */

function demoRead(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function demoWrite(items: Submission[]) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(items));
  } catch {
    throw new Error('Preglednik ne dopušta spremanje podataka (privatni način?).');
  }
}

/** Primjeri prijava da nadzorna ploča u demo načinu nije prazna. */
function demoSeed(): Submission[] {
  const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();
  return [
    { id: 'demo-1', created_at: day(0), type: 'izostanak', child_name: 'Lana Horvat', parent_name: 'Ivana Horvat', parent_contact: 'ivana.horvat@example.com', date: day(0).slice(0, 10), details: { location: 'Centralni objekt', group: 'Leptirići', reason: 'Bolest', date_to: day(-2).slice(0, 10) }, attachment_path: null, status: 'nova' },
    { id: 'demo-2', created_at: day(1), type: 'kontakt', child_name: null, parent_name: 'Marko Babić', parent_contact: 'marko.babic@example.com', date: null, details: { subject: 'Upisi', message: 'Poštovani, zanima me ima li slobodnih mjesta u jaslicama u objektu Ostrna tijekom godine?' }, attachment_path: null, status: 'u_obradi' },
    { id: 'demo-3', created_at: day(3), type: 'ispis', child_name: 'Petar Kovačević', parent_name: 'Ana Kovačević', parent_contact: 'ana.k@example.com', date: day(-20).slice(0, 10), details: { location: 'Područni objekt Kozinščak', reason: 'Preseljenje', birth_date: '2021-04-12', phone: '091 234 5678' }, attachment_path: 'demo-3/potpisani-zahtjev.pdf', status: 'rijeseno' },
  ];
}

/* ---------------- Javno sučelje ---------------- */

export async function createSubmission(data: NewSubmission): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 500)); // realističan osjećaj slanja
    const items = demoRead();
    items.unshift({ ...data, id, created_at: new Date().toISOString(), status: 'nova', attachment_path: null });
    demoWrite(items);
    return { id };
  }
  const supabase = await getSupabase();
  // Anonimni korisnik smije samo INSERT (RLS), pa ne tražimo povratni redak.
  const { error } = await supabase.from('submissions').insert({ id, ...data });
  if (error) throw new Error(error.message);
  return { id };
}

/** Učitava potpisani sken zahtjeva za ispis. Putanja: <id prijave>/<naziv datoteke> */
export async function uploadAttachment(submissionId: string, file: File): Promise<string> {
  const safeName = file.name.normalize('NFD').replace(/[^\w.-]+/g, '-').toLowerCase();
  const path = `${submissionId}/${Date.now()}-${safeName}`;
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 600));
    const items = demoRead().map((s) => (s.id === submissionId ? { ...s, attachment_path: path } : s));
    demoWrite(items);
    // Male datoteke spremamo kao data URL da se u demo nadzornoj ploči mogu otvoriti.
    if (file.size < 1.5 * 1024 * 1024) {
      const dataUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      try {
        const files = JSON.parse(localStorage.getItem(DEMO_FILES_KEY) ?? '{}');
        files[path] = dataUrl;
        localStorage.setItem(DEMO_FILES_KEY, JSON.stringify(files));
      } catch {
        /* prepuno spremište: datoteka se ne može pregledati, ali prijava je zabilježena */
      }
    }
    return path;
  }
  const supabase = await getSupabase();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/* ---------------- Administracija (/admin/prijave) ---------------- */

export async function listSubmissions(): Promise<Submission[]> {
  if (isDemoMode) {
    let items = demoRead();
    if (!items.length && localStorage.getItem(`${DEMO_KEY}-seeded`) !== '1') {
      items = demoSeed();
      demoWrite(items);
      localStorage.setItem(`${DEMO_KEY}-seeded`, '1');
    }
    return items;
  }
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  // Skenovi se učitavaju u Storage (anonimni korisnik ne smije mijenjati redak), pa ih povezujemo po mapi <id>/
  const rows = (data ?? []) as Submission[];
  await Promise.all(
    rows
      .filter((r) => r.type === 'ispis')
      .map(async (r) => {
        const { data: files } = await supabase.storage.from(BUCKET).list(r.id, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });
        if (files?.[0]) r.attachment_path = `${r.id}/${files[0].name}`;
      }),
  );
  return rows;
}

export async function updateStatus(id: string, status: SubmissionStatus): Promise<void> {
  if (isDemoMode) {
    demoWrite(demoRead().map((s) => (s.id === id ? { ...s, status } : s)));
    return;
  }
  const supabase = await getSupabase();
  const { error } = await supabase.from('submissions').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getAttachmentUrl(path: string): Promise<string | null> {
  if (isDemoMode) {
    try {
      return JSON.parse(localStorage.getItem(DEMO_FILES_KEY) ?? '{}')[path] ?? null;
    } catch {
      return null;
    }
  }
  const supabase = await getSupabase();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

export function resetDemoData() {
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(DEMO_FILES_KEY);
  localStorage.removeItem(`${DEMO_KEY}-seeded`);
}

/* ---------------- Prijava administratora ---------------- */

export async function adminSession(): Promise<{ email: string } | null> {
  if (isDemoMode) return { email: 'demo@vrtic' };
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session ? { email: data.session.user.email ?? '' } : null;
}

export async function adminSignIn(email: string, password: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Neispravna e-pošta ili lozinka.');
}

export async function adminSignOut(): Promise<void> {
  if (isDemoMode) return;
  const supabase = await getSupabase();
  await supabase.auth.signOut();
}
