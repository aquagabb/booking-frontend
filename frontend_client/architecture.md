# Arhitectură Frontend — Restaurant Booking

Document de referință pentru reorganizarea proiectului. Descrie stack-ul tehnic, principiile de organizare și structura ideală pe module.

---

## Stack tehnic

| Tehnologie | Versiune | Rol |
|---|---|---|
| **React** | `^19.1.0` | UI framework |
| **React DOM** | `^19.1.0` | Rendering |
| **Vite** | `^6.3.5` | Build tool & dev server |
| **TypeScript** | `~5.8.3` | Type safety |
| **React Router** | `^7.6.2` | Routing |
| **Zustand** | `^5.0.5` | State management global |
| **Axios** | `^1.11.0` | HTTP client |
| **React Hook Form** | `^7.62.0` | Formulare |
| **i18next** | `^25.2.1` | Internaționalizare (RO / EN) |
| **Tailwind CSS** | `^4.1.10` | Styling |

---

## Principii de organizare

> **Obiectiv:** structură clară pe zone de business, fără explozie de fișiere.
> Organizarea principală este **pe pagini**, nu pe tip de fișier (`hooks/`, `types/`, `utils/` peste tot).

1. **Page-first** — unitatea de bază este **pagina** (ecranul/ruta). Tot ce ține de ea stă în același folder.
2. **Un fișier până dovedești contrariul** — pagină simplă = un singur fișier. Extragi doar când depășește ~150–200 linii sau devine greu de citit.
3. **Extract la a 2-a utilizare** — componentă folosită în 2+ pagini → `shared/`. Până atunci, rămâne lângă pagină.
4. **Fără foldere goale** — nu crea `hooks/`, `types/`, `store/` per pagină. Store-uri și API doar la nivel `core/`.
5. **Domenii = grupări logice** — folderele `auth/`, `booking/` etc. sunt doar pentru navigare, nu impun sub-structuri obligatorii.

### Reguli anti „1000 de fișiere"

| Situație | Ce faci |
|---|---|
| Pagină simplă (login, terms, 404) | **1 fișier** `LoginPage.tsx` |
| Pagină medie (listă + filtre) | **2–4 fișiere** în același folder |
| Pagină complexă (checkout cu pași) | **folder** cu `CheckoutPage.tsx` + sub-componente |
| Hook folosit pe o singură pagină | **în același fișier** sau același folder pagină |
| Hook folosit în 3+ pagini | `core/hooks/` |
| Tipuri folosite pe o pagină | **în același fișier** sau `types.ts` lângă pagină |
| Tipuri folosite la API | `core/api/types.ts` |
| Logică pură (pricing) | `core/lib/` dacă e transversală, altfel lângă pagină |

**Estimare realistă pentru proiectul tău:** ~60–90 fișiere `.tsx`/`.ts` în `src/` (nu 1000).

---

## Structura ideală a proiectului

```
src/
├── app/                          # Bootstrap + router (4–6 fișiere)
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx                # Toate rutele într-un singur fișier (sau router/ dacă crește)
│
├── core/                         # Infrastructură — UN SINGUR LOC
│   ├── api/                      # Toate apelurile API (auth, locations, bookings…)
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── locations.ts
│   │   ├── bookings.ts
│   │   └── types.ts
│   ├── stores/                   # Zustand — doar state cross-page
│   │   ├── auth.store.ts
│   │   ├── search.store.ts
│   │   └── notifications.store.ts
│   ├── i18n/
│   ├── lib/                      # pricing, formatDate, cn…
│   └── hooks/                    # Doar hooks folosite în 3+ locuri
│
├── shared/                       # UI reutilizabil (15–25 fișiere)
│   ├── ui/                       # Input, Modal, Button, DatePicker…
│   ├── layout/                   # Header, Footer
│   └── RestaurantCard.tsx        # Compozite folosite în 2+ pagini
│
├── pages/                        # ★ ORGANIZARE PRINCIPALĂ — pe domenii + pagini
│   ├── auth/
│   ├── account/
│   ├── search/
│   ├── location/
│   ├── booking/
│   ├── chat/
│   ├── partner/
│   ├── marketing/
│   └── notifications/
│
├── assets/
└── styles/
```

### Structura internă a unei pagini (template)

**Varianta simplă** (majoritatea paginilor):

```
pages/marketing/
├── HomePage.tsx              # tot codul paginii, 1 fișier
├── TermsPage.tsx
└── NotFoundPage.tsx
```

**Varianta medie** (când ai câteva sub-componente):

```
pages/search/
└── restaurants/
    ├── RestaurantsPage.tsx   # orchestrator — compune restul
    ├── SearchBar.tsx
    ├── FilterPanel.tsx
    └── useSearchFilters.ts   # hook local, doar pt această pagină
```

**Varianta complexă** (flow multi-step, ex. checkout):

```
pages/booking/
└── checkout/
    ├── CheckoutPage.tsx      # container + pași
    ├── CheckoutSteps.tsx
    ├── CheckoutSummary.tsx
    ├── CheckoutContact.tsx
    └── checkout.types.ts     # tipuri locale, dacă sunt multe
```

**Ce NU faci:**

```
❌ pages/booking/checkout/components/CheckoutSummary.tsx
❌ pages/booking/checkout/hooks/useCheckout.ts
❌ pages/booking/checkout/types/checkout.types.ts
❌ pages/booking/api/bookings.ts
```

API-ul merge în `core/api/`. Store-ul în `core/stores/`. Sub-folderele `components/`, `hooks/`, `types/` per pagină apar doar dacă folderul paginii are **10+ fișiere** — rar.

---

## Zone de business → pagini

Fiecare zonă = un folder în `pages/`. Lista de mai jos arată **câte fișiere** ai estimat per zonă, nu structura „ideală” cu foldere goale.

### 1. `pages/auth/` — Autentificare (~4–5 fișiere)

| Fișier | Rută |
|---|---|
| `LoginPage.tsx` | `/login` |
| `RegisterPage.tsx` | `/register` |
| `GoogleCallbackPage.tsx` | `/auth/google/callback` |
| `ForgotPasswordPage.tsx` | `/forgot-password` (viitor) |

**În `core/`:** `api/auth.ts`, `stores/auth.store.ts` (user, token)

**Migrare:** `pages/Login.tsx`, `Register.tsx`, `GoogleCallback.tsx`, `store/user.store.tsx`, `api/users/`

---

### 2. `pages/account/` — Profil & setări (~6–10 fișiere)

| Fișier / folder | Rută |
|---|---|
| `AccountPage.tsx` sau `account/` folder cu tab-uri | `/account/:tab?` |
| `ProfilePage.tsx` | `/profile` |
| `SettingsPage.tsx` | `/settings/:tab?` |
| `FavoritesPage.tsx` | `/favorites` |
| `BookingHistoryPage.tsx` | (sub account sau separat) |

Tab-urile contului (`Security`, `Billing`, `Preferences`) pot fi **secțiuni în `AccountPage.tsx`** sau fișiere separate doar dacă sunt mari.

**Migrare:** `pages/protected/*`, `components/client/*`, `store/favorites.store.tsx`

---

### 3. `pages/search/` — Căutare & filtre (~3–5 fișiere)

```
pages/search/restaurants/
├── RestaurantsPage.tsx
├── SearchBar.tsx
└── FilterPanel.tsx
```

| Rută | `/restaurants` |
| **Store** | `core/stores/search.store.ts` |
| **API** | `core/api/locations.ts` |

**Migrare:** `pages/Restaurants.tsx`, `components/Search.tsx`, `Filters.tsx`, `FilterList.tsx`

---

### 4. `pages/location/` — Pagina locație (~2–4 fișiere)

```
pages/location/
├── LocationPage.tsx          # pagina principală
├── LocationGallery.tsx       # doar dacă LocationPage e prea mare
└── ReservationWidget.tsx
```

| Rută | `/restaurants/:slug` |

**Migrare:** `pages/Restaurant.jsx`, `components/RestaurantDetails.tsx`, `ReservationRight.tsx`

---

### 5. `pages/booking/` — Rezervare / checkout (~8–12 fișiere)

Cel mai complex folder — merită sub-folder `checkout/`:

```
pages/booking/
├── checkout/
│   ├── CheckoutPage.tsx       # container cu pași
│   ├── CheckoutSteps.tsx
│   ├── CheckoutSummary.tsx
│   ├── CheckoutContact.tsx
│   └── CheckoutEventDetails.tsx
├── CheckoutSuccessPage.tsx
└── reservation/
    ├── ReservationViewPage.tsx
    ├── EditReservationPage.tsx
    └── CancelReservationModal.tsx
```

| Rute | `/checkout/:slug`, `/checkout/successful/:id/:code`, `/booking/view/:id/:code` |
| **Lib** | `core/lib/pricing.ts` |

**Migrare:** `pages/Checkout*.tsx`, `pages/protected/client/Reservations/*`

---

### 6. `pages/chat/` — Mesagerie (~3–4 fișiere)

```
pages/chat/
├── MessagesPage.tsx           # client
├── MessagesAdminPage.tsx      # admin (sau pages/admin/ mai târziu)
└── ChatPanel.tsx              # ConversationList + ChatContent combinate sau separate
```

Componentele `Chat/*` din `shared/` merg aici dacă sunt folosite doar de aceste pagini. Dacă și header-ul arată preview mesaje → `shared/ChatBadge.tsx`.

**Migrare:** `pages/protected/MessagesClient.tsx`, `MessagesAdmin.tsx`, `components/shared/Chat/*`

---

### 7. `pages/partner/` — Înregistrare partener (~3 fișiere)

| Fișier | Rută |
|---|---|
| `PartnerLandingPage.tsx` | `/join` |
| `PartnerBecomePage.tsx` | `/join/register` |
| `PartnerRegisterPage.tsx` | `/partner/register` |

**Migrare:** `pages/PartnerPage.tsx`, `PartnerBecomePage.tsx`, `PartnerRegister.tsx`

---

### 8. `pages/marketing/` — Homepage & statice (~5–6 fișiere)

| Fișier | Rută |
|---|---|
| `HomePage.tsx` | `/` |
| `TermsPage.tsx` | `/terms` |
| `PrivacyPage.tsx` | `/privacy` |
| `ContactPage.tsx` | `/contact` |
| `NotFoundPage.tsx` | `*` |

Pagini statice simple = **1 fișier fiecare**, fără sub-foldere.

**Migrare:** `pages/Home.tsx`, `Subscriptions.tsx`, `NotFound.tsx`

---

### 9. `pages/notifications/` — Notificări (~2 fișiere)

| Fișier | Rută |
|---|---|
| `NotificationsPage.tsx` | `/notifications` |
| `NotificationsAdminPage.tsx` | `/admin/notifications` |

**Store:** `core/stores/notifications.store.ts` (badge în header)

---

### 10. `pages/admin/` — Admin (viitor, ~3–5 fișiere)

Doar când ai nevoie de panou dedicat. Paginile admin pot rămâne în zonele lor (`chat/MessagesAdminPage`) până atunci.

---

## Inventar total estimat

| Zonă | Fișiere pagină | + core/shared |
|---|---|---|
| auth | 4 | api + store |
| account | 8 | store favorites |
| search | 4 | store search |
| location | 3 | — |
| booking | 10 | lib pricing |
| chat | 3 | api chat |
| partner | 3 | api orgs |
| marketing | 5 | — |
| notifications | 2 | store |
| **shared/ui + layout** | — | ~20 |
| **core (api, stores, i18n, lib)** | — | ~15 |
| **app** | — | ~5 |
| **Total** | | **~80 fișiere** |

---

## Layer-uri transversale

### `core/api/` — un singur loc pentru API

```
core/api/
├── client.ts          # axios + interceptors
├── types.ts           # ApiResponse, Paginated, ApiError
├── auth.ts
├── locations.ts
├── bookings.ts
├── chat.ts
├── notifications.ts
└── organizations.ts
```

Nu duplica API per pagină sau per „feature".

### `core/stores/` — doar state între pagini

| Store | Când îl folosești |
|---|---|
| `auth.store.ts` | user logat — peste tot |
| `search.store.ts` | filtre persistate între navigări |
| `notifications.store.ts` | badge header |
| `favorites.store.ts` | opțional, sau direct în account |

**Nu** crea store per pagină. Datele de pe o singură pagină = `useState` / fetch în componentă.

### `shared/ui/` — design system

Componente UI pure, fără logică de business. ~15–20 fișiere total:

- `Input`, `Select`, `Modal`, `Button`, `Badge`, `DatePicker`, `TimePicker`…

**Migrare:** `components/shared/Custom*` → `shared/ui/`

### `shared/layout/` — Header, Footer, Sidebar

---

## Router — un singur fișier (sau două)

La ~20 de rute, **nu** împărți rutele per modul în fișiere separate. Un `app/router.tsx` e suficient:

```tsx
// app/router.tsx
import { HomePage } from '@/pages/marketing/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RestaurantsPage } from '@/pages/search/restaurants/RestaurantsPage';
// ...

export const publicRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/restaurants', element: <RestaurantsPage /> },
  { path: '/restaurants/:slug', element: <LocationPage /> },
  { path: '/checkout/:slug', element: <CheckoutPage /> },
  // ...
];

export const protectedRoutes = [
  { path: '/account/:tab?', element: <AccountPage /> },
  { path: '/favorites', element: <FavoritesPage /> },
  // ...
];
```

Când depășește ~80 linii, poți separa în `publicRoutes.ts` + `protectedRoutes.ts` — nu mai mult.

---

## State management — simplu

| Ce | Unde |
|---|---|
| Date de la API pe o pagină | fetch / hook în **pagină** |
| UI local (modal, tab) | `useState` în **pagină** |
| Filtre search, user auth, notificări badge | `core/stores/` |
| Logică pură (prețuri) | `core/lib/` |

**Store-uri actuale → destinație:**

| Actual | Nou |
|---|---|
| `store/user.store.tsx` | `core/stores/auth.store.ts` |
| `store/search.store.tsx` | `core/stores/search.store.ts` |
| `store/favorites.store.tsx` | `core/stores/favorites.store.ts` |
| `store/notifications.store.tsx` | `core/stores/notifications.store.ts` |

---

## Alias-uri de import (recomandat)

Configurare în `vite.config.ts` și `tsconfig.json`:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@app': path.resolve(__dirname, './src/app'),
    '@core': path.resolve(__dirname, './src/core'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@pages': path.resolve(__dirname, './src/pages'),
  },
}
```

```ts
import { Button } from '@shared/ui/Button';
import { useAuthStore } from '@core/stores/auth.store';
import { locationsApi } from '@core/api/locations';
import { CheckoutPage } from '@pages/booking/checkout/CheckoutPage';
```

---

## Diagramă — pagini, nu module adânci

```
  marketing/          auth/           search/        location/
  HomePage            LoginPage       RestaurantsPage  LocationPage
  TermsPage           RegisterPage         │                │
  NotFoundPage             │               └───────┬────────┘
       │                   │                       │
       └───────────────────┼───────────────────────┘
                           ▼
                    booking/checkout/
                    CheckoutPage → SuccessPage
                           │
         account/          │          chat/
         AccountPage    ReservationView   MessagesPage
         FavoritesPage
```

**Flux utilizator:** marketing → search → location → booking → account/chat

**Regulă import:** paginile importă din `@core/` și `@shared/`. Paginile **nu** importă din alte pagini — dacă ai nevoie de ceva comun, mută în `shared/`.

---

## Plan de migrare

1. **Creează scheletul** — `app/`, `core/`, `shared/`, `pages/` (foldere goale pe zone)
2. **Mută `core/`** — API, stores, i18n, lib (fără să atingi paginile încă)
3. **Mută `shared/ui`** — componentele `Custom*`
4. **Mută paginile pe rând**, zona cu zona:
   - `pages/marketing/` (simplu, 1 fișier/pagină)
   - `pages/auth/`
   - `pages/search/`
   - `pages/location/`
   - `pages/booking/` (cel mai mare efort)
   - restul
5. **Un singur `router.tsx`** — actualizezi importurile pe măsură ce muți
6. **Ștergi folderele vechi** — `src/components/`, `src/store/`, `src/api/` când sunt goale

**Nu muta tot deodată.** După fiecare zonă, verifici că rutele merg.

---

## Convenții de naming

| Tip | Convenție | Exemplu |
|---|---|---|
| Pagină (route component) | `*Page.tsx` | `LoginPage.tsx` |
| Sub-componentă pagină | `PascalCase.tsx`, același folder | `FilterPanel.tsx` |
| Hook local pagină | `use*.ts`, același folder | `useSearchFilters.ts` |
| Store global | `*.store.ts` în `core/stores/` | `auth.store.ts` |
| API | `*.ts` în `core/api/` | `locations.ts` |

---

## Note

- Păstrează **TypeScript**; convertește treptat `.jsx` → `.tsx`.
- `mockup/` → `core/mocks/` sau șters când API-ul e stabil.
- Dacă un folder pagină are sub 3 fișiere, **nu** crea sub-foldere `components/` — ține totul plat.
- Când ești tentat să creezi un fișier nou, întreabă: *„Poate trăi în fișierul paginii?”* — de obicei da.
