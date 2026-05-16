# SKATE

A web app to play the game of SKATE against a bot — installable on phones via PWA.

## Project layout

```
skate-app/
├── index.html           ← entry point (loads styles + app)
├── styles.css           ← all visual styling + animations
├── app.js               ← game logic + UI rendering + service worker registration
├── manifest.json        ← PWA metadata (name, icons, theme color)
├── service-worker.js    ← caches the app for offline + makes it installable
├── icon.svg             ← source icon (edit this if you want to redesign)
├── generate-icons.html  ← one-page utility that renders icon.svg into PNGs
├── icons/               ← generated PNG icons live here
│   ├── icon-192.png       (Android)
│   ├── icon-512.png       (Android, splash)
│   └── apple-touch-icon.png (iOS, 180×180)
├── package.json         ← just defines `npm run dev`
└── .gitignore
```

## One-time setup

You need [Node.js](https://nodejs.org/) installed (LTS version). Verify it's installed:

```sh
node --version
npm --version
```

## Run locally

From inside `skate-app/`:

```sh
npm run dev
```

That starts a local dev server at <http://localhost:5173>. PWAs require this — they
don't work when you open the HTML file directly (`file://`).

## Generating the icons (one-time)

Before your first deploy, you need to generate the three PNG icon files:

1. Run `npm run dev`
2. Open <http://localhost:5173/generate-icons.html>
3. Click "Download All"
4. Save the three PNG files into the `icons/` folder

You only need to redo this if you edit `icon.svg`.

## Testing PWA install on desktop

1. Open the local URL in Chrome
2. Open DevTools → "Application" tab → "Manifest"
3. Verify the manifest is loaded, icons are detected, no errors
4. Click the install icon (⊕) in the Chrome address bar — it should offer to install SKATE as an app

If the install prompt doesn't appear, check the "Manifest" tab in DevTools for missing required fields.

## Deploying to the web

You need this hosted on HTTPS for the PWA install to work on a real phone. The easy free path:

1. Push to GitHub
2. Import the repo on [Vercel](https://vercel.com) (or Netlify) — they auto-deploy on every push
3. Visit the deployed URL on your phone:
   - **iOS Safari:** Share menu → "Add to Home Screen"
   - **Android Chrome:** Menu → "Install app" (or "Add to Home Screen")

## Updating the app after deploy

When you push new changes, the service worker may serve old cached files on first visit.
Two ways to force the update:

- Bump `CACHE_NAME` in `service-worker.js` (e.g. `'skate-v1'` → `'skate-v2'`) on each release
- Or close and reopen the app on the phone (the new SW activates on next launch)
