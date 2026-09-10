# Cardsmith

A simple digital business card creator built with React. Create a card, customize
its layout and colors, then share it using a short link or QR code.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal, usually `http://localhost:5173`.

To test the production version and share server:

```bash
npm run build
npm start
```

Then open `http://localhost:4173`.

## How it works

- Complete or skip the card setup steps.
- Use **QR code** or **Share link** from the finished-card screen.
- Use **Open in full editor** for detailed changes and exports.
- **Save now** stores the draft in the current browser. Changes also autosave.
- Sharing stores the complete card and creates a short server-backed link.

After editing a published card, share it again to publish the latest version.

## Test JSON import

Import [test-card.json](./test-card.json) using **Import JSON** on the home screen
or **Upload a JSON file** when creating a card.

## Main features

- Four card layouts, preset accents, and a custom color picker
- Contact details, social profiles, and custom information sections
- Photo gallery and YouTube video embeds
- Short share links and QR codes
- PNG, PDF, print, VCF, and JSON exports
- Local autosave with no account required

## Sharing with other people

Links containing `localhost` only work on your computer. For public sharing,
deploy the Node.js app and build it with your public address:

```powershell
$env:VITE_PUBLIC_APP_URL = "https://cards.example.com"
npm run build
npm start
```

Published cards are stored in `data/cards.json`. Use persistent storage when
deploying.

## Share error

If sharing says the service is unavailable, run either `npm run dev` or:

```bash
npm run build
npm start
```

Vercel deployments require a connected private Blob store for short links.
