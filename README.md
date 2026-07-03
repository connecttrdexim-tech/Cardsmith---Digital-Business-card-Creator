# Cardsmith — Digital Business Card Creator

A backend-free digital business card builder. Create a card, customize its theme,
add contact links / social icons / photo gallery / expandable info sections, then
share it as a link or QR code. Everything runs in the browser — nothing to deploy
except static files.

---

## 1. Requirements

- [Node.js](https://nodejs.org) **v18 or newer** (v20 recommended)
- npm (comes with Node)
- VS Code (or any editor)

Check your versions in a terminal:

```bash
node -v
npm -v
```

---

## 2. Install & run (development)

Open this folder in VS Code, then open a terminal (`` Ctrl+` ``) and run:

```bash
npm install
npm run dev
```

Vite will print a local URL, typically **http://localhost:5173**. Open it in your
browser. Changes to any file under `src/` hot-reload instantly.

---

## 3. Build for production

```bash
npm run build
```

This outputs a fully static site into the `dist/` folder. To confirm it works
before deploying:

```bash
npm run preview
```

---

## 4. Hosting (no backend required)

`dist/` is 100% static HTML/CSS/JS. Deploy it anywhere that serves static files:

- **Netlify / Vercel / Cloudflare Pages / GitHub Pages** — drag-and-drop the
  `dist` folder, or connect the repo and set build command `npm run build`,
  output directory `dist`.
- **Your own server** — copy `dist/` to any web server (nginx, Apache, S3 + CDN, etc).
- **Locally** — just double-run `npm run preview`, or open `dist/index.html`
  directly (routing uses `HashRouter` specifically so it also works from a plain
  `file://` path or a sub-folder, with no server rewrite rules needed).

---

## 5. How sharing works without a server

There's no database, so a "shareable link" can't point at a server record.
Instead, the entire card (compressed) is embedded directly in the URL itself,
after `#/view/`. Opening the link decodes the card client-side. This is why:

- Links get long if you add lots of large photos — the app warns you above
  ~2,000 characters and flags it as "large" past ~6,000.
- Anyone with the link can see the card, and the QR code encodes the same
  link, since scanning it just opens that URL.
- Recipients can tap **"Save a copy"** on the view page to store their own
  local copy in their browser, letting them, e.g., re-share or reference it later.

If you later add a real backend, replace `src/utils/share.js` with calls to
your API and store only a short ID in the URL instead.

---

## 6. Data storage

- **Card data** (all cards you create) is stored in the browser's **IndexedDB**
  (via the `idb` library), scoped to whichever origin/device you're using.
  It does not sync across devices or browsers on its own.
- **Small preferences** use `localStorage`.
- Use **Export card data (JSON)** in the editor to back up a card, and
  **Import JSON** on the home screen to restore/transfer it to another
  browser or device.

---

## 7. File structure

```
digital-business-card/
├── index.html                  # HTML shell, fonts
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/                     # static assets copied as-is
├── README.md
└── src/
    ├── main.jsx                 # React entry point, HashRouter
    ├── App.jsx                  # Routes: Home / Editor / ViewCard
    ├── index.css                # Tailwind + global styles
    │
    ├── data/
    │   ├── cardModel.js          # Default card shape, section types
    │   └── themePresets.js       # 10 built-in themes
    │
    ├── db/
    │   └── storage.js            # IndexedDB (cards) + localStorage (prefs)
    │
    ├── utils/
    │   ├── vcf.js                 # .vcf (vCard) file generation
    │   ├── share.js               # URL encode/decode, share actions
    │   ├── exportCard.js          # PNG / PDF / print export
    │   ├── jsonIO.js              # JSON export/import, image file reading
    │   └── contactActions.js      # tel/whatsapp/email/maps click handlers
    │
    ├── components/
    │   ├── CardForm.jsx           # Main editing form (collapsible groups)
    │   ├── CardPreview.jsx        # The rendered card itself
    │   ├── ContactIconGrid.jsx    # Clickable contact/social icons
    │   ├── DynamicSections.jsx    # Expandable About/Products/FAQs/etc.
    │   ├── SectionsEditor.jsx     # Editor for the above
    │   ├── GalleryCarousel.jsx    # Swipeable photo/video gallery (view)
    │   ├── GalleryEditor.jsx      # Editor for the above
    │   ├── ThemePicker.jsx        # Theme swatch grid
    │   ├── ImageUploadField.jsx   # Reusable image upload control
    │   ├── FormField.jsx          # Reusable text/textarea input
    │   ├── QRCodeModal.jsx        # QR display, download PNG, print
    │   └── ShareModal.jsx         # Copy link, WhatsApp/Email/Telegram/Web Share
    │
    └── pages/
        ├── Home.jsx                 # List / create / import / delete cards
        ├── Onboarding.jsx           # Step-by-step wizard for new cards
        ├── Editor.jsx               # Full form + live preview + export actions
        └── ViewCard.jsx             # Public read-only card (decoded from URL)

    components/onboarding/
        ├── StepShell.jsx             # Progress bar + Back/Next/Skip shell
        ├── StartStep.jsx             # "Start fresh" vs "Upload JSON" choice
        └── FinishStep.jsx            # Review screen + JSON download + finish

    components/ (shared field groups, used by both CardForm and Onboarding)
        ├── IdentityFields.jsx
        ├── ContactFields.jsx
        ├── SocialFields.jsx
        └── DesignFields.jsx
```

---

## 8. Feature checklist

- **Step-by-step onboarding wizard** for new cards: Identity → Contact →
  Social → Theme → Sections → Gallery → Review, one topic per screen, with
  **Back**, **Next**, and **Skip** on every step, a progress bar, and a live
  preview alongside. Finishing (or skipping to the end) lands you in the
  full editor to fine-tune anything.
- **Download a JSON file of any card** — from the onboarding review screen,
  the full editor ("Export card data"), or directly from a card's tile on
  the home screen.
- **Upload a JSON file** to restore or start from a previously exported card —
  available both on the home screen and as the first choice when creating a
  new card ("Start fresh" vs "Upload a JSON file").
- Live-preview card editor with logo, photo, full contact & social fields
- 10 built-in themes (Modern, Minimal, Glass, Premium, Elegant, Dark, Light,
  Gradient, Luxury, Corporate) + accent color and font override
- Clickable contact icons: call (copies number + `tel:`), WhatsApp with
  prefilled message, email with subject/body, website, Google Maps, LinkedIn,
  GitHub, Facebook, Instagram, X, YouTube, Telegram
- Unlimited custom expandable info sections (About, Products, Services, Team,
  FAQs, Testimonials, Portfolio, etc.), each with its own items
- Photo gallery with swipe/scroll carousel + embedded YouTube videos
- Auto-generated QR code (download PNG, print)
- Share via link, Web Share API, WhatsApp, Email, Telegram, or copy-to-clipboard
- Download contact as `.vcf` (imports into phone contacts)
- Export card as PNG, PDF, or print
- Export/import full card data as JSON for backup/transfer
- All data stored locally (IndexedDB); no account, no server
- Fully static — self-hostable anywhere

---

## 9. Known limitations (by design, since there's no backend)

- A shared link only works if the recipient opens that exact link — there's
  no central database to "look up" a card by short ID.
- Very large images make links long. Keep logos/photos reasonably sized
  (the app doesn't currently auto-compress uploads).
- Cards saved in one browser don't automatically appear in another; use
  JSON export/import to move them.
