# Android PWA / TWA Build Notes

This folder is for Android packaging only. The live PWA files stay at the project root.

## Current PWA files

- `../index.html`
- `../manifest.json`
- `../service-worker.js`
- `../icon-192.png`
- `../icon-512.png`
- `../maskable-icon-512.png`
- `../screenshot-wide.png`

The root manifest has the installable Android basics:

- `name` / `short_name`
- `start_url`
- `scope`
- `display: fullscreen`
- `display_override` with `fullscreen`, `standalone`, and `minimal-ui`
- 192x192 icon
- 512x512 icon
- maskable 512x512 icon
- service worker with a fetch handler
- explicit manifest description mentioning fullscreen and WebXR/VR support

## PWA Builder capability wording

Use this wording when PWA Builder asks what the Android package supports:

```text
Plant 076 is a fullscreen 3D warehouse simulation. It includes an in-app fullscreen control and WebXR/VR launch support for compatible Android browsers, Quest/headset browsers, and devices with WebXR support.
```

The app exposes those capabilities in the root files:

- `manifest.json` uses `display: fullscreen`.
- `index.html` includes the fullscreen button with `aria-label="Enter fullscreen mode"`.
- `index.html` creates the Three.js `VRButton` with `aria-label="Enter VR / WebXR mode"`.

## Android build requirement that cannot be completed until signing

For a Play Store / Trusted Web Activity build, Android needs Digital Asset Links at:

```text
https://YOUR_HOST/.well-known/assetlinks.json
```

That file must include the final Android package name and SHA-256 signing certificate fingerprint. Use `assetlinks.template.json` in this folder after you know those values.

Required values:

- Hosted HTTPS origin, for example `https://plant076.example.com`
- Android package id, for example `com.plastipak.plant076`
- Release signing certificate SHA-256 fingerprint

## Build flow

1. Host the root files over HTTPS.
2. Run `node android/validate-pwa.js` from the project root.
3. Use the hosted URL in PWA Builder or Bubblewrap.
4. Build/sign the Android package.
5. Put the completed Digital Asset Links file at `/.well-known/assetlinks.json` on the same HTTPS host.
6. Rebuild or reinstall the Android app so domain verification refreshes.

Chrome installability requires the manifest basics above. A TWA additionally needs the app-to-site and site-to-app Digital Asset Links relationship to remove the browser URL bar.
