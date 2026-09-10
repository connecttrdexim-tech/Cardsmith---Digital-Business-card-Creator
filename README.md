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

## Sharing and Vercel Blob

Public short links need persistent storage. On Vercel:

1. Open the project and create a **private Blob store** under **Storage**.
2. Enable **Add a read-write token env var to this connection**.
3. Connect the store to the project and redeploy it.

Blob stores the complete published card, including its images and YouTube links.
Keep `BLOB_READ_WRITE_TOKEN` private and never add it to GitHub.

Every separate Vercel deployment needs its own Blob store. Its shared cards and
links belong to that deployment and stop working if its store is removed.
Local development stores published cards in `data/cards.json`; `localhost` links
only work on your computer.
