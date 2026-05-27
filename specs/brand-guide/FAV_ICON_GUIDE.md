# NMECAR Favicon Package

Πλήρες σετ favicons για την εφαρμογή NMECAR, βασισμένο στο "nme" mark του λογοτύπου σε σκούρο rounded badge (σε στιλ modern app icon).

## Περιεχόμενα

| Αρχείο | Μέγεθος | Σκοπός |
|---|---|---|
| `favicon.ico` | 16+32+48 multi-res | Legacy browsers, Windows |
| `favicon.svg` | Vector | Modern browsers (Chrome 80+, Firefox, Safari) — απεριόριστη ευκρίνεια |
| `favicon-symbol.svg` | Vector | Εναλλακτικό: μόνο το σύμβολο, χωρίς background |
| `favicon-16x16.png` | 16×16 | Browser tab |
| `favicon-32x32.png` | 32×32 | Browser tab (retina), bookmarks |
| `favicon-48x48.png` | 48×48 | Windows site tile |
| `favicon-96x96.png` | 96×96 | Desktop shortcut |
| `favicon-256x256.png` | 256×256 | High-DPI displays |
| `apple-touch-icon.png` | 180×180 | iOS home screen icon |
| `android-chrome-192x192.png` | 192×192 | Android home screen |
| `android-chrome-384x384.png` | 384×384 | Android high-DPI |
| `android-chrome-512x512.png` | 512×512 | PWA splash screen |
| `site.webmanifest` | — | PWA manifest |

## Εγκατάσταση

### Βήμα 1: Τοποθέτηση αρχείων

Αντίγραψε **όλα τα αρχεία** στο root directory του web server σου (συνήθως `public/`, `static/`, ή `wwwroot/`):

```
public/
├── favicon.ico
├── favicon.svg
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

### Βήμα 2: HTML `<head>` tags

Πρόσθεσε αυτά τα tags στο `<head>` κάθε σελίδας (ή στο master layout):

```html
<!-- Browser tab icon (modern browsers προτιμούν SVG) -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Fallback για older browsers -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="shortcut icon" href="/favicon.ico">

<!-- iOS -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android / PWA -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#231F20">
```

### Spring Boot (Thymeleaf templates)

Στο `src/main/resources/static/` βάλε τα αρχεία, και στο layout template:

```html
<head th:fragment="favicons">
  <link rel="icon" type="image/svg+xml" th:href="@{/favicon.svg}">
  <link rel="icon" type="image/png" sizes="32x32" th:href="@{/favicon-32x32.png}">
  <link rel="icon" type="image/png" sizes="16x16" th:href="@{/favicon-16x16.png}">
  <link rel="apple-touch-icon" sizes="180x180" th:href="@{/apple-touch-icon.png}">
  <link rel="manifest" th:href="@{/site.webmanifest}">
  <meta name="theme-color" content="#231F20">
</head>
```

### Angular

Στο `src/` directory βάλε τα αρχεία, και στο `angular.json` πρόσθεσέ τα στα `assets`. Στο `index.html`:

```html
<head>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#231F20">
</head>
```

### React (Create React App / Vite)

Στο `public/` directory. Στο `index.html` της React app, τα ίδια tags όπως παραπάνω. Το CRA έχει ήδη το `manifest.json` — μπορείς να το αντικαταστήσεις με το `site.webmanifest` ή να συγχωνεύσεις τα περιεχόμενα.

## Επικύρωση

Αφού κάνεις deploy, δοκίμασε:

1. **Hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) — οι browsers κάνουν aggressive caching favicons
2. **Browser tab**: το favicon πρέπει να εμφανίζεται καθαρό
3. **iOS Safari**: "Add to Home Screen" — έλεγξε το apple-touch-icon
4. **Android Chrome**: "Add to Home Screen" — έλεγξε το manifest icon
5. **Online validator**: https://realfavicongenerator.net/favicon_checker

## Caching

Οι browsers cache-άρουν favicons επιθετικά (μέχρι και 1 χρόνο). Αν χρειαστεί update στο μέλλον, πρόσθεσε version query string:

```html
<link rel="icon" href="/favicon.svg?v=2">
```

## Customization

Όλα τα αρχεία είναι παραγμένα από δύο SVG sources που μπορείς να επεξεργαστείς:

- `favicon.svg` — το badge με το dark background (default)
- `favicon-symbol.svg` — μόνο το σύμβολο, για χρήση πάνω σε άλλα backgrounds

Αν θες να αλλάξεις χρώματα ή να ξαναπαράξεις τα PNGs σε διαφορετικά μεγέθη, χρησιμοποίησε:

```bash
pip install cairosvg pillow
python -c "import cairosvg; cairosvg.svg2png(url='favicon.svg', write_to='out.png', output_width=512, output_height=512)"
```
