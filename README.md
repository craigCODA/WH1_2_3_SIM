# Plant 076 Warehouse Simulation — PWABuilder Fixed Package

This package is prepared for the current GitHub Pages project URL:

```text
https://craig-coda.github.io/WH1_2_3_SIM/
```

## What changed

- `index.html` was replaced with `index_consistent_teaching_source_final.html` and kept under the required deploy name `index.html`.
- `app_script_consistent_teaching_final.js` was added to the root of the package.
- `manifest.json` now uses the GitHub Pages project path for `id`, `start_url`, and `scope`.
- Manifest icon and screenshot paths now point under `/WH1_2_3_SIM/`.
- `display` is set to `standalone` with `display_override` keeping `fullscreen` first.
- `index.html` now registers `/WH1_2_3_SIM/service-worker.js` with scope `/WH1_2_3_SIM/`.
- `service-worker.js` now caches the GitHub Pages project path and avoids caching failed responses.
- `validate-pwa.js` was fixed for this package layout. It now validates from the repo root instead of one folder above it.

## Run the local file check

From this folder:

```bash
node validate-pwa.js
```

Expected result:

```text
Android PWA check passed.
TWA note: add https://craig-coda.github.io/.well-known/assetlinks.json after Android package id and release SHA-256 are known.
```

## Important Android / TWA note

For a normal browser-installed PWA, this package has the needed installability basics.

For an Android Trusted Web Activity build, Digital Asset Links still requires the final Android package name and release signing SHA-256 fingerprint.

Because this app is hosted under a GitHub Pages project path, Android checks the origin root:

```text
https://craig-coda.github.io/.well-known/assetlinks.json
```

It does not check only inside the project folder:

```text
https://craig-coda.github.io/WH1_2_3_SIM/.well-known/assetlinks.json
```

Use `assetlinks.template.json` or `.well-known/assetlinks.example.json` after PWABuilder gives you the Android package id and signing SHA-256 fingerprint. The completed `assetlinks.json` must be hosted at the root of the origin or on a custom domain you control.
