/**
 * Edge funkcija: šalje e-mail tajništvu (i skupini) kad stigne nova prijava.
 * Poziva je Database Webhook na INSERT u public.submissions (vidi supabase/schema.sql).
 *
 * Postavljanje:
 *   supabase functions deploy notify-submission --no-verify-jwt
 *   supabase secrets set RESEND_API_KEY=... NOTIFY_TO=tajnistvo@vrtic.hr NOTIFY_FROM="Vrtić <obrasci@vrtic.hr>"
 * (Resend ima besplatni plan; može se zamijeniti bilo kojim SMTP/API servisom.)
 */
const LABELS: Record<string, string> = {
  izostanak: 'Prijava izostanka',
  ispis: 'Zahtjev za ispis djeteta',
  kontakt: 'Kontakt upit',
};

const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

Deno.serve(async (req) => {
  const payload = await req.json();
  const row = payload.record;
  if (!row) return new Response('no record', { status: 400 });

  const details = Object.entries(row.details ?? {})
    .map(([k, v]) => `<tr><td><b>${escapeHtml(k)}</b></td><td>${escapeHtml(v)}</td></tr>`)
    .join('');

  const html = `
    <h2>${escapeHtml(LABELS[row.type] ?? row.type)}</h2>
    <table cellpadding="4">
      <tr><td><b>Dijete</b></td><td>${escapeHtml(row.child_name)}</td></tr>
      <tr><td><b>Roditelj</b></td><td>${escapeHtml(row.parent_name)}</td></tr>
      <tr><td><b>Kontakt</b></td><td>${escapeHtml(row.parent_contact)}</td></tr>
      <tr><td><b>Datum</b></td><td>${escapeHtml(row.date)}</td></tr>
      ${details}
    </table>
    <p>Sve prijave: /admin/prijave</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('NOTIFY_FROM'),
      to: Deno.env.get('NOTIFY_TO'),
      reply_to: row.parent_contact?.includes('@') ? row.parent_contact : undefined,
      subject: `${LABELS[row.type] ?? 'Prijava'}: ${row.child_name ?? row.parent_name}`,
      html,
    }),
  });

  return new Response(res.ok ? 'ok' : await res.text(), { status: res.ok ? 200 : 502 });
});
