# 🔐 AuthKey

> A Chrome Extension for locking websites behind **WebAuthn biometric authentication** — protecting you from distraction and unauthorized access with passkeys, scheduled locks, and activity analytics.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔑 **Passkey Authentication** | Register once with your device biometrics (fingerprint, Face ID, Windows Hello). No passwords stored. |
| 🔒 **Site Locking** | Lock any website by hostname. A full-screen overlay blocks access until you authenticate. |
| ⏰ **Scheduled Locks** | Automatically lock sites on custom schedules — daily, weekdays, weekends, or specific days & time windows. |
| 📊 **Activity Analytics** | Track unlock history, site access patterns, and productivity trends with charts. |
| 🕐 **Timed Unlock Sessions** | Unlocks are temporary (10-minute TTL). Sites re-lock automatically after the session expires. |
| 🌙 **Dark / Light Mode** | Full theme support via a toggle in the options page. |
| 🛡️ **Shadow DOM Overlay** | The lock overlay is injected inside an isolated Shadow DOM to prevent any page from overriding it. |

---

## 🏗️ Architecture Overview

AuthKey is a **Manifest V3** Chrome Extension built with React + TypeScript + Vite, using the [`@crxjs/vite-plugin`](https://crxjs.dev/) for seamless extension bundling.

```
authkey/
├── manifest.json              # Chrome Extension manifest (MV3)
├── popup.html                 # Extension toolbar popup
├── options.html               # Full-page options dashboard
├── auth.html                  # Authentication popup window
├── index.html                 # Dev entry (unused in prod)
│
└── src/
    ├── background.ts          # Service worker — message bus & lock logic
    ├── contentScript.ts       # Injected into every page — overlay & unlock flow
    ├── webAuthn.ts            # WebAuthn registration & authentication logic
    ├── crypto.ts              # AES-GCM encryption & PBKDF2 key derivation utils
    ├── messages.ts            # Typed message contracts between scripts
    │
    ├── storage/
    │   └── lockDb.ts          # Dexie (IndexedDB) schema for sites, schedules & logs
    │
    ├── pages/
    │   ├── popupPages/
    │   │   └── popup.tsx      # Toolbar popup UI
    │   ├── optionsPage/
    │   │   └── options.tsx    # Full dashboard (sites, schedules, analytics)
    │   └── auth/              # Auth window page
    │
    └── components/
        ├── options/
        │   ├── Analytics.tsx      # Recharts-powered activity graphs
        │   ├── ScheduleLock.tsx   # Schedule CRUD UI
        │   └── LoginScreen.tsx    # Biometric sign-in screen
        ├── shared/                # Reusable components (modals, tickers)
        ├── ui/                    # shadcn/ui component library
        └── magicui/               # Animation components
```

---

## 🔑 How Authentication Works

AuthKey uses the **WebAuthn API** (FIDO2 / Passkeys) — no passwords, no servers.

1. **Registration** — On first use you register using your platform authenticator (fingerprint, face, PIN). The public key is stored in `chrome.storage.local`.
2. **Authentication** — When unlocking a site, a challenge is generated locally. Your authenticator signs it. The signature is verified against the stored public key using the **Web Crypto API**.
3. **Key Algorithms Supported:**
   - `ES256` — ECDSA with P-256 (preferred)
   - `RS256` — RSASSA-PKCS1-v1_5 with SHA-256 (fallback)
4. **Unlock TTL** — After a successful auth, the site is unlocked for **10 minutes**. The TTL is enforced in the service worker.

> All cryptographic operations happen **entirely client-side**. No credentials, passwords, or keys ever leave your device.

---

## 🗄️ Data Storage

AuthKey uses **Dexie (IndexedDB)** for structured local storage with three tables:

| Table | Key | Purpose |
|---|---|---|
| `lockedSites` | `host` | Tracks each site`s lock state, unlock expiry, and unlock count |
| `schedules` | `++id` | Auto-lock schedules with time windows and repeat rules |
| `activityLogs` | `++id` | Timestamped log of lock/unlock/add/remove events |

Chrome`s `chrome.storage.local` is used separately to store:
- `authkey_user` — the registered user ID
- `credential_<userId>` — the stored WebAuthn public key credential

---

## 🔄 Message Flow

All inter-script communication uses typed messages via `chrome.runtime.sendMessage`:

```
Content Script  ──►  Background Service Worker  ──►  Content Script
                           │
                      Auth Window (popup)
```

| Message | Direction | Description |
|---|---|---|
| `GET_LOCK_STATE` | Content → BG | Check if current host is locked (also evaluates schedules) |
| `SET_LOCK_STATE` | Options → BG | Manually lock/unlock a host |
| `GET_LOCKED_SITES` | Popup/Options → BG | Fetch all tracked sites |
| `REQUEST_UNLOCK` | Content → BG | Open the biometric auth popup window |
| `AUTH_RESULT` | Auth Window → BG | Report success/failure of authentication |
| `UNLOCK_GRANTED` | BG → Content | Tell the content script to remove the overlay |
| `SETUP_REQUIRED` | BG → Content | Tell the content script to show a setup message |

---

## ⏰ Schedule System

Schedules define time windows during which sites are **automatically locked**. Evaluated in real-time by the service worker on every `GET_LOCK_STATE` call.

**Repeat modes:**
- `never` — One-time lock on a specific date
- `daily` — Every day
- `weekdays` — Monday–Friday
- `weekends` — Saturday–Sunday
- `custom` — Pick specific days (Mon, Tue, Wed, etc.)

Overnight schedules (e.g., `23:00–07:00`) are handled by checking both **today** and **yesterday`s** time window to correctly catch spanning intervals.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 + `@crxjs/vite-plugin` |
| **Compiler** | SWC (`@vitejs/plugin-react-swc`) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI primitives + shadcn/ui |
| **Icons** | Lucide React + React Icons |
| **Animations** | Motion (Framer Motion successor) + Lottie |
| **Charts** | Recharts |
| **Database** | Dexie (IndexedDB wrapper) |
| **Date/Time** | Day.js |
| **WebAuthn** | `@simplewebauthn/browser` |
| **Package Manager** | pnpm |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- Google Chrome / Chromium browser

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd authkey

# Install dependencies
pnpm install
```

### Development

```bash
pnpm dev
```

This starts Vite`s dev server and watches for changes. The extension files are output to `dist/`.

### Build for Production

```bash
pnpm build
```

Outputs the optimized extension to the `dist/` folder.

### Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project

---

## 📦 Extension Pages

| Page | File | Description |
|---|---|---|
| **Popup** | `popup.html` | Quick view from the toolbar icon — shows locked sites, lock/unlock toggle |
| **Options** | `options.html` | Full dashboard — manage sites, schedules, view analytics, theme toggle |
| **Auth** | `auth.html` | Biometric authentication popup — opened automatically when a locked site is visited |

---

## 🔒 Permissions

Declared in `manifest.json`:

| Permission | Reason |
|---|---|
| `storage` | Store lock state, credentials, and schedules |
| `tabs` | Read tab IDs to associate auth windows with locked tabs |
| `activeTab` | Communicate with the active tab`s content script |
| `host_permissions: *://*/*` | Inject the content script into all pages |

---

## 🧹 Linting

```bash
pnpm lint
```

Uses ESLint 9 with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.

---

## 📁 Key Source Files

| File | Purpose |
|---|---|
| `src/background.ts` | Service worker — handles all messages, schedule evaluation, unlock TTL |
| `src/contentScript.ts` | Injects lock overlay into pages, communicates with service worker |
| `src/webAuthn.ts` | Full WebAuthn registration & signature verification logic |
| `src/crypto.ts` | PBKDF2 key derivation + AES-GCM encrypt/decrypt utilities |
| `src/messages.ts` | Typed message contracts shared across all extension scripts |
| `src/storage/lockDb.ts` | Dexie database schema and all CRUD operations |
| `src/pages/optionsPage/options.tsx` | Full options dashboard (sites, schedules, analytics, theme) |
| `src/components/options/ScheduleLock.tsx` | Schedule CRUD interface |
| `src/components/options/Analytics.tsx` | Activity charts and stats |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
