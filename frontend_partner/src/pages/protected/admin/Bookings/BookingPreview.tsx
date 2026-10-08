import { formatDateTimeRo, formatDuration, capitalize } from '../../../../lib/utils';
import type { BookingDetails, AdvancePayment } from './types';

export type BookingPreviewData = {
  booking: BookingDetails;
  totalAmount: number;
  remainingAmount: number;
  totalAdvancePayments: number;
  bookingCurrencySymbol: string;
  advancePayments: AdvancePayment[];
  /** Numele firmei/organizației partenere, afișat în antetul documentului. */
  organizationName?: string;
};

const STATUS_LABELS: Record<BookingDetails['status'], string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmată',
  completed: 'Finalizată',
  cancelled: 'Anulată',
  rejected: 'Respinsă',
  expired: 'Expirată',
};

function escapeHtml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(value: number, currency: string): string {
  return `${Math.round(value).toLocaleString('ro-RO')} ${currency}`;
}

function notesTotalOf(booking: BookingDetails): number {
  return booking.notes.reduce((sum, note) => {
    const price = typeof note.price === 'string' ? parseFloat(note.price) : (note.price ?? 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
}

/**
 * Construiește documentul HTML de confirmare a rezervării (format A4, pregătit de print/PDF),
 * cu toate informațiile rezervării pe o singură pagină.
 */
export function buildBookingPreviewHtml(data: BookingPreviewData): string {
  const { booking, totalAmount, remainingAmount, totalAdvancePayments, bookingCurrencySymbol, advancePayments, organizationName } = data;

  const venueName = escapeHtml(organizationName || booking.locationName || 'Rezervare');
  const venueSub = escapeHtml(booking.locationName || '');
  const eventTitle = escapeHtml(booking.name || booking.eventName || `Rezervare #${booking.code}`);
  const duration = formatDuration(booking.checkIn, booking.checkOut) || '-';
  const eventDateShort = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('ro-RO') : '-';
  const checkOutTime = booking.checkOut
    ? new Date(booking.checkOut).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    : '-';
  const checkInFull = booking.checkIn ? formatDateTimeRo(booking.checkIn) : '-';
  const checkOutFull = booking.checkOut ? formatDateTimeRo(booking.checkOut) : '-';
  const createdAtFull = booking.createdAt ? formatDateTimeRo(booking.createdAt) : '-';
  const generatedAt = new Date().toLocaleDateString('ro-RO');
  const notesTotal = notesTotalOf(booking);

  const notesHtml = booking.notes.length > 0
    ? booking.notes
        .map(
          (note) => `
        <div class="note">
          <div>
            <div class="note-text">${escapeHtml(note.note)}</div>
            <div class="note-date">Adăugat pe ${escapeHtml(formatDateTimeRo(note.createdAt))}</div>
          </div>
          ${note.price != null ? `<div class="note-price">+${formatMoney(Number(note.price), bookingCurrencySymbol)}</div>` : ''}
        </div>`
        )
        .join('')
    : `<p style="font-size:9pt;color:var(--muted)">Nicio notiță adăugată.</p>`;

  const priceRows = `
    <tr><td>Preț de bază</td><td>${formatMoney(booking.totalPrice, bookingCurrencySymbol)}</td></tr>
    ${notesTotal > 0 ? `<tr class="sub"><td>Ajustări din notițe</td><td>${formatMoney(notesTotal, bookingCurrencySymbol)}</td></tr>` : ''}
    ${totalAdvancePayments > 0 ? `<tr class="sub"><td>Plăți în avans achitate</td><td>-${formatMoney(totalAdvancePayments, bookingCurrencySymbol)}</td></tr>` : ''}
    <tr class="total"><td>Total</td><td>${formatMoney(totalAmount, bookingCurrencySymbol)}</td></tr>
    ${totalAdvancePayments > 0 ? `<tr class="sub"><td>Rămas de plată</td><td>${formatMoney(remainingAmount, bookingCurrencySymbol)}</td></tr>` : ''}
  `;

  let sectionNum = 5;
  const attachmentsNum = booking.attachments.length > 0 ? sectionNum++ : null;
  const termsNum = sectionNum++;
  const pad = (n: number) => String(n).padStart(2, '0');

  const attachmentsSection = attachmentsNum
    ? `
    <section class="section">
      <div class="section-head">
        <span class="section-num">${pad(attachmentsNum)}</span>
        <span class="section-title">Atașamente</span>
      </div>
      <ul class="terms">
        ${booking.attachments.map((a) => `<li>${escapeHtml(a.name)}</li>`).join('')}
      </ul>
    </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>Confirmare Rezervare #${escapeHtml(booking.code)} – ${eventTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  :root {
    --ink: #1a1d24;
    --muted: #6b7280;
    --line: #e5e7eb;
    --soft: #f7f6f2;
    --accent: #1f3a5f;
    --gold: #b08d57;
    --ok: #15803d;
    --ok-bg: #dcfce7;
    --warn: #a16207;
    --warn-bg: #fef9c3;
    --bad: #b91c1c;
    --bad-bg: #fee2e2;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #e9e9ec; }
  body {
    font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: var(--ink);
    font-size: 10.5pt;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #fff;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  @media screen { .page { margin: 24px auto; box-shadow: 0 6px 30px rgba(0,0,0,.12); } }
  @media print  { html, body { background: #fff; } .page { margin: 0; box-shadow: none; } }

  .header {
    background: var(--accent);
    color: #fff;
    padding: 14mm 16mm 12mm;
    position: relative;
    overflow: hidden;
  }
  .header::after {
    content: "";
    position: absolute; right: -40mm; top: -40mm;
    width: 110mm; height: 110mm;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 50%;
  }
  .header::before {
    content: "";
    position: absolute; right: -15mm; top: -25mm;
    width: 70mm; height: 70mm;
    border: 1px solid rgba(176,141,87,.45);
    border-radius: 50%;
  }
  .brand {
    display: flex; justify-content: space-between; align-items: flex-start;
    position: relative; z-index: 1;
  }
  .venue-name {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 15pt; letter-spacing: .5px;
  }
  .venue-sub { font-size: 8.5pt; color: rgba(255,255,255,.7); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .doc-type { text-align: right; font-size: 8.5pt; color: rgba(255,255,255,.75); letter-spacing: 2px; text-transform: uppercase; }
  .doc-type strong { display: block; color: #fff; font-size: 11pt; letter-spacing: 1px; margin-top: 3px; }

  .event-title {
    font-family: "Playfair Display", Georgia, serif;
    font-size: 24pt; line-height: 1.15;
    margin-top: 12mm; position: relative; z-index: 1;
    max-width: 150mm;
  }
  .gold-rule { width: 22mm; height: 2px; background: var(--gold); margin: 5mm 0 4mm; position: relative; z-index: 1; }
  .meta-row { display: flex; gap: 10mm; align-items: center; position: relative; z-index: 1; font-size: 9.5pt; color: rgba(255,255,255,.85); flex-wrap: wrap; }
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-weight: 600; font-size: 8.5pt;
    padding: 3px 10px; border-radius: 20px;
  }
  .badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; }
  .badge.status-confirmed, .badge.status-completed { background: var(--ok-bg); color: var(--ok); }
  .badge.status-confirmed::before, .badge.status-completed::before { background: var(--ok); }
  .badge.status-pending { background: var(--warn-bg); color: var(--warn); }
  .badge.status-pending::before { background: var(--warn); }
  .badge.status-cancelled, .badge.status-rejected, .badge.status-expired { background: var(--bad-bg); color: var(--bad); }
  .badge.status-cancelled::before, .badge.status-rejected::before, .badge.status-expired::before { background: var(--bad); }

  .strip {
    display: grid; grid-template-columns: repeat(4, 1fr);
    margin: -7mm 16mm 0; position: relative; z-index: 2;
    background: #fff; border: 1px solid var(--line); border-radius: 6px;
    box-shadow: 0 4px 14px rgba(15,23,42,.06);
  }
  .strip > div { padding: 4mm 5mm; border-right: 1px solid var(--line); }
  .strip > div:last-child { border-right: 0; }
  .strip .k { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1.2px; color: var(--muted); }
  .strip .v { font-size: 11.5pt; font-weight: 600; margin-top: 1mm; }
  .strip .v.total { color: var(--accent); }

  .content { padding: 9mm 16mm 0; flex: 1; }
  .section { margin-bottom: 7mm; }
  .section-head {
    display: flex; align-items: baseline; gap: 3mm;
    border-bottom: 1px solid var(--line); padding-bottom: 2mm; margin-bottom: 4mm;
  }
  .section-num { font-family: "Playfair Display", Georgia, serif; color: var(--gold); font-size: 13pt; font-weight: 700; }
  .section-title { font-size: 11pt; font-weight: 600; letter-spacing: .3px; }
  .section-desc { margin-left: auto; font-size: 8pt; color: var(--muted); }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 10mm; }
  .field .k { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
  .field .v { font-size: 10.5pt; font-weight: 500; margin-top: .5mm; }

  .two-col { display: grid; grid-template-columns: 1.15fr 1fr; gap: 8mm; }

  .note {
    background: var(--soft); border-left: 3px solid var(--gold);
    padding: 3.5mm 4mm; border-radius: 0 4px 4px 0;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 4mm;
  }
  .note + .note { margin-top: 2.5mm; }
  .note-text { font-weight: 500; }
  .note-date { font-size: 8pt; color: var(--muted); margin-top: 1mm; }
  .note-price { font-weight: 600; color: var(--accent); white-space: nowrap; }

  table.price { width: 100%; border-collapse: collapse; }
  table.price td { padding: 2.6mm 0; border-bottom: 1px solid var(--line); }
  table.price td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  table.price tr.sub td { color: var(--muted); font-size: 9.5pt; }
  table.price tr.total td {
    border-bottom: 0; padding-top: 4mm;
    font-size: 13pt; font-weight: 700; color: var(--accent);
  }
  table.price tr.total td:first-child { font-size: 10pt; text-transform: uppercase; letter-spacing: 1.2px; }

  .terms { font-size: 8pt; color: var(--muted); line-height: 1.5; }
  .terms li { margin-left: 4mm; margin-bottom: 1mm; }

  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16mm; margin-top: 8mm; }
  .sig { border-top: 1px solid var(--ink); padding-top: 2mm; font-size: 8.5pt; color: var(--muted); }
  .sig strong { display: block; color: var(--ink); font-size: 9.5pt; }

  .footer {
    margin-top: 8mm; padding: 5mm 16mm;
    border-top: 1px solid var(--line);
    display: flex; justify-content: space-between;
    font-size: 7.5pt; color: var(--muted);
  }

  @media print {
    .print-bar { display: none; }
  }
  .print-bar {
    position: sticky; top: 0; z-index: 10;
    display: flex; justify-content: center; gap: 3mm;
    padding: 10px; background: #1a1d24;
  }
  .print-bar button {
    font-family: inherit; font-size: 9pt; font-weight: 600;
    padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;
    background: #fff; color: var(--ink);
  }
</style>
</head>
<body>

<div class="print-bar">
  <button onclick="window.print()">Printează / Salvează ca PDF</button>
</div>

<div class="page">

  <header class="header">
    <div class="brand">
      <div>
        <div class="venue-name">${venueName}</div>
        ${venueSub ? `<div class="venue-sub">${venueSub}</div>` : ''}
      </div>
      <div class="doc-type">Confirmare rezervare<strong>#${escapeHtml(booking.code)}</strong></div>
    </div>

    <h1 class="event-title">${eventTitle}</h1>
    <div class="gold-rule"></div>
    <div class="meta-row">
      <span class="badge status-${booking.status}">${escapeHtml(STATUS_LABELS[booking.status])}</span>
      <span>${checkInFull} – ${checkOutTime}</span>
      <span>${booking.bookingSource === 'internal' ? 'Rezervare internă' : 'Rezervare făcută online'}</span>
    </div>
  </header>

  <div class="strip">
    <div><div class="k">Data evenimentului</div><div class="v">${eventDateShort}</div></div>
    <div><div class="k">Număr oaspeți</div><div class="v">${booking.guests ? `${booking.guests} persoane` : '-'}</div></div>
    <div><div class="k">Tip eveniment</div><div class="v">${escapeHtml(booking.eventName) || '-'}</div></div>
    <div><div class="k">Total</div><div class="v total">${formatMoney(totalAmount, bookingCurrencySymbol)}</div></div>
  </div>

  <main class="content">

    <section class="section">
      <div class="section-head">
        <span class="section-num">01</span>
        <span class="section-title">Detalii rezervare</span>
        <span class="section-desc">Rezervare înregistrată pe ${createdAtFull}</span>
      </div>
      <div class="grid">
        <div class="field"><div class="k">Locație</div><div class="v">${venueSub || '-'}</div></div>
        <div class="field"><div class="k">Tip eveniment</div><div class="v">${escapeHtml(booking.eventName) || '-'}</div></div>
        <div class="field"><div class="k">Check-in</div><div class="v">${checkInFull}</div></div>
        <div class="field"><div class="k">Check-out</div><div class="v">${checkOutFull}</div></div>
        <div class="field"><div class="k">Durată</div><div class="v">${duration}</div></div>
        <div class="field"><div class="k">Tip așezare</div><div class="v">${booking.seatingPlanName ? escapeHtml(capitalize(booking.seatingPlanName)) : '-'}</div></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <span class="section-num">02</span>
        <span class="section-title">Informații client</span>
        <span class="section-desc">Organizator principal și entitate plătitoare</span>
      </div>
      <div class="grid">
        <div class="field"><div class="k">Nume client</div><div class="v">${escapeHtml(booking.customerName) || '-'}</div></div>
        <div class="field"><div class="k">Email</div><div class="v">${escapeHtml(booking.customerEmail) || '-'}</div></div>
        <div class="field"><div class="k">Telefon</div><div class="v">${escapeHtml(booking.customerPhone) || '-'}</div></div>
      </div>
    </section>

    <div class="two-col">
      <section class="section">
        <div class="section-head">
          <span class="section-num">03</span>
          <span class="section-title">Notițe &amp; cerințe</span>
        </div>
        ${notesHtml}
      </section>

      <section class="section">
        <div class="section-head">
          <span class="section-num">04</span>
          <span class="section-title">Sumar preț</span>
        </div>
        <table class="price">
          ${priceRows}
        </table>
      </section>
    </div>

    ${attachmentsSection}

    <section class="section">
      <div class="section-head">
        <span class="section-num">${pad(termsNum)}</span>
        <span class="section-title">Mențiuni</span>
      </div>
      <ul class="terms">
        <li>Prezentul document confirmă rezervarea spațiului pentru data și intervalul orar menționate mai sus.</li>
        <li>Orice modificare a numărului de oaspeți sau a serviciilor suplimentare poate influența prețul final.</li>
        <li>Pentru întrebări legate de rezervare, vă rugăm să menționați numărul #${escapeHtml(booking.code)}.</li>
      </ul>
      <div class="signatures">
        <div class="sig"><strong>${venueName}</strong>Semnătură &amp; ștampilă</div>
        <div class="sig"><strong>${escapeHtml(booking.customerName) || 'Client'}</strong>Semnătură client</div>
      </div>
    </section>

  </main>

  <footer class="footer">
    <span>${venueName}${venueSub ? ` · ${venueSub}` : ''}</span>
    <span>Document generat pe ${generatedAt}</span>
    <span>Rezervare #${escapeHtml(booking.code)} · Pagina 1/1</span>
  </footer>

</div>
</body>
</html>`;
}

/** Deschide preview-ul rezervării într-o filă nouă, gata de printat sau salvat ca PDF. */
export function openBookingPreview(data: BookingPreviewData): void {
  const html = buildBookingPreviewHtml(data);
  const previewWindow = window.open('', '_blank');
  if (!previewWindow) return;
  previewWindow.document.open();
  previewWindow.document.write(html);
  previewWindow.document.close();
}

export default openBookingPreview;
