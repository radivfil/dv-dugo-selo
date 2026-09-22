/**
 * Logika svih obrazaca (<form data-form="izostanak|ispis|kontakt">):
 *  - provjera polja s porukama na hrvatskom i sažetkom grešaka (fokus na sažetak),
 *  - slanje kroz src/lib/submissions.ts (Supabase ili demo),
 *  - animirana potvrda uspjeha; nakon uspjeha šalje događaj `submission:created`
 *    (koristi ga obrazac za ispis za PDF i upload skena).
 */
import { createSubmission, type NewSubmission, type SubmissionType } from '../lib/submissions';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function messageFor(field: Field): string {
  const v = field.validity;
  if (field instanceof HTMLInputElement && field.type === 'checkbox' && v.valueMissing) return 'Potrebno je označiti ovo polje.';
  if (v.valueMissing) return field instanceof HTMLSelectElement ? 'Odaberite jednu od ponuđenih mogućnosti.' : 'Ovo polje je obavezno.';
  if ((v.typeMismatch || v.patternMismatch) && field.type === 'email') return 'Upišite ispravnu adresu e-pošte, npr. ime@primjer.hr.';
  if (v.patternMismatch && field.type === 'tel') return 'Upišite broj telefona, npr. 091 234 5678.';
  if (v.rangeUnderflow) return field.dataset.minMessage ?? 'Datum je prerani.';
  if (v.rangeOverflow) return field.dataset.maxMessage ?? 'Datum je prekasni.';
  if (v.tooShort) return 'Upis je prekratak.';
  if (v.customError) return field.validationMessage;
  return 'Provjerite upisanu vrijednost.';
}

function labelText(form: HTMLFormElement, field: Field) {
  const label = form.querySelector<HTMLLabelElement>(`label[for="${field.id}"]`);
  return (label?.textContent ?? field.name).replace(/\*|\(neobavezno\)/g, '').trim();
}

function setError(field: Field, message: string) {
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

function validate(form: HTMLFormElement): Field[] {
  const fields = [...form.querySelectorAll<Field>('input[id], select[id], textarea[id]')];
  const invalid: Field[] = [];
  for (const field of fields) {
    field.setCustomValidity('');
    const afterName = field.dataset.after;
    if (afterName && field.value) {
      const other = form.elements.namedItem(afterName) as HTMLInputElement | null;
      if (other?.value && field.value < other.value) field.setCustomValidity('Datum završetka ne može biti prije datuma početka.');
    }
    if (field instanceof HTMLInputElement && field.type === 'file' && field.files?.[0]) {
      const max = Number(field.dataset.maxMb ?? 10);
      if (field.files[0].size > max * 1024 * 1024) field.setCustomValidity(`Datoteka je veća od ${max} MB.`);
    }
    if (!field.checkValidity()) {
      setError(field, messageFor(field));
      invalid.push(field);
    } else setError(field, '');
  }
  return invalid;
}

function showSummary(form: HTMLFormElement, invalid: Field[]) {
  const summary = form.querySelector<HTMLElement>('[data-error-summary]')!;
  const list = form.querySelector<HTMLElement>('[data-error-list]')!;
  list.replaceChildren(
    ...invalid.map((f) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${f.id}`;
      a.textContent = `${labelText(form, f)}: ${messageFor(f)}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        f.focus();
      });
      li.append(a);
      return li;
    }),
  );
  summary.classList.toggle('hidden', invalid.length === 0);
  if (invalid.length) {
    summary.focus();
    if (!reduceMotion()) {
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
    }
  }
}

/** Pretvara polja obrasca u zapis za tablicu submissions (atribut data-map određuje stupac). */
function toSubmission(form: HTMLFormElement, type: SubmissionType): NewSubmission {
  const record: NewSubmission = { type, child_name: null, parent_name: '', parent_contact: '', date: null, details: {} };
  for (const field of form.querySelectorAll<Field>('[name]')) {
    if (field.name === 'website' || (field instanceof HTMLInputElement && field.type === 'file')) continue;
    if (field instanceof HTMLInputElement && field.type === 'checkbox' && !field.checked) continue;
    const value = field.value.trim();
    if (!value) continue;
    const map = field.dataset.map as keyof NewSubmission | undefined;
    if (map) (record as any)[map] = value;
    else record.details[field.name] = value;
  }
  return record;
}

function initForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    if (form.dataset.ready) return;
    form.dataset.ready = 'true';
    // Stranica je statična, pa današnji datum kao minimum postavljamo u pregledniku.
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    form.querySelectorAll<HTMLInputElement>('[data-min-today]').forEach((i) => (i.min = today));
    form.querySelectorAll<HTMLInputElement>('[data-max-today]').forEach((i) => (i.max = today));
    const shell = form.closest<HTMLElement>('[data-form-shell]')!;
    const success = shell.querySelector<HTMLElement>('[data-success]')!;
    const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
    const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
    const submitError = form.querySelector<HTMLElement>('[data-submit-error]')!;
    const originalLabel = submitLabel.textContent;

    // Greška nestaje čim korisnik ispravi polje
    form.addEventListener('input', (e) => {
      const field = e.target as Field;
      if (field.getAttribute('aria-invalid') === 'true') {
        field.setCustomValidity('');
        if (field.checkValidity()) setError(field, '');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitError.classList.add('hidden');
      const invalid = validate(form);
      showSummary(form, invalid);
      if (invalid.length) return;

      // Honeypot popunjen: tiho "uspješno" bez spremanja
      if ((form.elements.namedItem('website') as HTMLInputElement)?.value) return;

      const type = form.dataset.form as SubmissionType;
      const data = toSubmission(form, type);
      submit.disabled = true;
      submitLabel.textContent = 'Šaljem…';
      try {
        const { id } = await createSubmission(data);
        form.classList.add('hidden');
        success.classList.remove('hidden');
        success.querySelector('[data-success-id]')!.textContent = id.slice(0, 8).toUpperCase();
        success.focus();
        shell.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        shell.dispatchEvent(new CustomEvent('submission:created', { detail: { id, data }, bubbles: true }));
      } catch (err) {
        submitError.textContent = `Slanje nije uspjelo (${(err as Error).message}). Pokušajte ponovno ili nas nazovite.`;
        submitError.classList.remove('hidden');
      } finally {
        submit.disabled = false;
        submitLabel.textContent = originalLabel;
      }
    });

    shell.querySelector('[data-reset]')?.addEventListener('click', () => {
      form.reset();
      form.querySelector('[data-error-summary]')!.classList.add('hidden');
      form.querySelectorAll<Field>('[aria-invalid]').forEach((f) => setError(f, ''));
      success.classList.add('hidden');
      form.classList.remove('hidden');
      shell.dispatchEvent(new CustomEvent('submission:reset', { bubbles: true }));
      form.querySelector<Field>('input:not([type=hidden]), select, textarea')?.focus();
    });
  });
}

document.addEventListener('astro:page-load', initForms);
