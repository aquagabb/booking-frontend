# Reguli Proiect (CSS, Layout & Cod)

## Regula #1 — Fără shadow

Nu adăuga clase de umbră (`shadow`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` etc.) pe niciun element, decât dacă utilizatorul cere explicit asta într-o cerere anume.

Separarea vizuală a cardurilor/secțiunilor se face doar cu `border` (opțional + `bg-white` + `rounded-xl`), nu cu umbre.

## Pattern pentru carduri

Pentru a segmenta conținutul unei pagini în secțiuni vizuale distincte, se folosește:

```
bg-white rounded-xl border border-[var(--color-gray)] p-4
```

Exemplu: [Overview.tsx](src/pages/protected/admin/Bookings/Overview.tsx) — pagina de detalii rezervare este împărțită în carduri separate (antet, sumar preț, detalii rezervare, informații client, atașamente, notițe) folosind exact acest pattern, fără `shadow-*`.

## Regula #2 — Doar culori deja folosite în aplicație

Nu inventa culori/nuanțe noi. Pentru orice element nou (bannere, badge-uri, iconițe, stări), folosește doar culorile deja prezente în restul aplicației — nu adăuga nuanțe Tailwind care nu apar deja în codebase.

Culori "status/semantic" deja stabilite în aplicație (reutilizează-le, nu inventa altele):

- **Gri (text neutru):** `text-gray-400/500/600/700/900`, `bg-gray-50/100` (rămân clase Tailwind standard, neschimbate)
- **Gri (borduri):** vezi Regula #4 — nu `border-gray-200/300` direct, ci `border-[var(--color-gray)]`
- **Primary (accent brand):** `bg-primary`, `text-primary`, `border-primary`
- **Success / confirmat:** `bg-green-100 text-green-700`
- **Eroare / anulat / respins:** `bg-red-100 text-red-700`, `text-red-600`
- **Info:** `bg-blue-50 text-blue-700`
- **Avertisment / în așteptare / apropiat:** `bg-yellow-100 text-yellow-700` (pending) sau `bg-amber-50/100 border-amber-200 text-amber-600/700` (avertismente de tip "atenție", ex. reminder eveniment apropiat) — pattern deja folosit în [CheckoutSummary.tsx](src/components/CheckoutSummary.tsx), [ReservationClient.tsx](src/pages/protected/client/Reservations/ReservationClient.tsx), [AccountOverview.tsx](src/components/client/AccountOverview.tsx).

Dacă ai nevoie de o culoare pentru un caz nou, caută întâi în codebase (`grep` după `bg-`, `text-`, `border-`) un pattern similar deja folosit și reutilizează-l, în loc să alegi o nuanță nouă.

## Alte convenții observate

- Spațiere între secțiuni/carduri: `space-y-6` (coloană) / `gap-6` (grid).
- Dropdown-uri și meniuri contextuale: `rounded-lg border border-gray-200` (fără shadow).
- Textul din interfață (etichete, titluri, mesaje) este în limba română.

## Regula #3 — Helpers reutilizabile în `lib/utils.ts`

Doar pentru funcții care merită folosite global (logică generică, nu specifică unei singure componente): înainte să scrii o funcție ajutătoare (formatare, fallback, calcule etc.), verifică întâi dacă există deja ceva similar în [src/lib/utils.ts](src/lib/utils.ts).

- Dacă există deja → folosește-o pe aceea, nu duplica logica inline.
- Dacă nu există și funcția e suficient de generică încât ar putea fi refolosită în alte componente/pagini → adaug-o în `lib/utils.ts` (nu inline în componentă) și folosește-o de acolo.
- Dacă e o logică strict specifică unei singure componente (ex. un calcul care n-are sens în altă parte) → rămâne locală în componentă, nu se bagă în utils degeaba.

Exemplu: `withFallback()` din `lib/utils.ts` — afișează `-` când o valoare lipsește, folosit în [ReservationDetails.tsx](src/pages/protected/admin/Bookings/ReservationDetails.tsx) și [ClientDetails.tsx](src/pages/protected/admin/Bookings/ClientDetails.tsx) în loc să fie reimplementat în fiecare fișier.

## Regula #4 — Gri unificat prin `--color-gray`

Variabila globală `--color-gray` din [index.css](src/index.css) este singura sursă de adevăr pentru gri-ul de bordură/fundal deschis al aplicației. Valoarea ei actuală: `#e7e7e7`.

- Pe pagina Bookings Overview și fișierele ei asociate — [Overview.tsx](src/pages/protected/admin/Bookings/Overview.tsx), [ReservationDetails.tsx](src/pages/protected/admin/Bookings/ReservationDetails.tsx), [Notes.tsx](src/pages/protected/admin/Bookings/Notes.tsx), [Attachements.tsx](src/pages/protected/admin/Bookings/Attachements.tsx) — toate bordurile gri folosesc `border-[var(--color-gray)]`, nu `border-gray-200`/`border-gray-300`.
- La orice modificare/adăugare pe aceste fișiere, continuă cu `border-[var(--color-gray)]` pentru consistență — nu reintroduce `border-gray-200`.
- Restul aplicației (pagini neatinse încă) folosește în continuare `border-gray-200` direct; dacă utilizatorul cere extinderea la alte pagini, aplică același `border-[var(--color-gray)]` acolo unde indică explicit.
- Dacă se schimbă din nou culoarea "gri" a aplicației, se modifică doar valoarea `--color-gray` din `index.css` — nu se umblă clasă cu clasă.

## Regula #5 — Folosește clasele de buton existente, nu stiluri repetate

Înainte să stilizezi un `<button>` de la zero (culori, border, background inline sau clase Tailwind ad-hoc), verifică dacă există deja o clasă de buton în [index.css](src/index.css) care acoperă cazul:

- `btn-primary` — buton plin, culoare primary (`bg-primary` + text alb)
- `btn-outline` — buton cu border + text primary, fundal primary la hover
- `btn-outline-transparent` — buton cu border + text `muted` (gri), fundal `muted` la hover
- `btn-icon` — buton doar-iconiță

Aceste clase dau doar culoarea/border-ul (nu au padding/font-size definit), deci pentru mărime se adaugă mereu alături clasele Tailwind deja standardizate în aplicație:

```
px-3 py-1.5 rounded-lg text-sm
```

(vezi [Dashboard/Reminders.tsx](src/pages/protected/admin/Dashboard/Reminders.tsx), [Dashboard/AttentionNeeded.jsx](src/pages/protected/admin/Dashboard/AttentionNeeded.jsx) — nu inventa alt padding/font-size pentru butoane secundare).

Dacă niciuna dintre clasele existente nu se potrivește, întreabă înainte să introduci un nou stil de buton — nu adăuga o variantă nouă doar pentru un singur loc.

## Regula #6 — Formulare de adăugare/editare = modal, folosind componenta generală

Orice formular de adăugare sau editare (notiță, plată, rezervare etc.) se deschide într-un modal, folosind componenta generală [CustomModal](src/components/shared/Modals/CustomModal.tsx) — nu un formular inline expandat în pagină/card.

Pattern-ul standard (vezi modalul "Adaugă plată în avans" din [Overview.tsx](src/pages/protected/admin/Bookings/Overview.tsx) și modalul de notițe din [Notes.tsx](src/pages/protected/admin/Bookings/Notes.tsx)):

```
<CustomModal
  open={...}
  onClose={...}
  title="..."
  className="relative bg-white rounded-xl w-full max-w-md flex flex-col overflow-hidden"
>
  <div className="p-4 space-y-4">
    {/* câmpurile formularului */}
    <div className="flex gap-3 pt-4">
      <button className="btn-outline-transparent flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium">Anulează</button>
      <button className="btn-primary flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium">Salvează</button>
    </div>
  </div>
</CustomModal>
```

- Același modal se reutilizează pentru "adaugă" și "editează" (titlu + acțiune de submit condiționate de starea de editare), nu se duplică formularul.
- Pentru confirmări de ștergere se folosește tot componenta generală [ConfirmModal](src/components/shared/Modals/ConfirmModal.tsx), nu CustomModal.
- Butoanele din footer-ul modalului urmează Regula #5 (`btn-outline-transparent` / `btn-primary` + `px-4 py-2 rounded-lg text-sm font-medium`).
