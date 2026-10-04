# JV Webdesign: statische homepage

Statische versie (HTML, CSS, JS) van de goedgekeurde homepage. Geen build-stap: open `index.html` of zet de map op een webserver.

## Structuur

```
jv-webdesign/
├── index.html                  homepage (header, inhoud, footer, FAQ-schema)
├── 404.html                    foutpagina (noindex, absolute paden /assets/... zodat ze op elke URL werkt)
├── _headers                    Cloudflare Pages: security-headers + caching fonts/afbeeldingen
├── favicon.ico                 16/32/48 px, voor browsers die /favicon.ico opvragen
└── assets/
    ├── css/
    │   ├── fonts.css           @font-face voor Plus Jakarta Sans (lokaal)
    │   ├── jv-webdesign.css    designsysteem + homepage-layout, ongewijzigd uit het handoff-pakket
    │   └── site.css            alleen voor de statische versie: sticky header, mobiel menu, formulierstatus, skip-link
    ├── js/
    │   └── main.js             mobiel menu, formulierverzending, jaartal
    ├── fonts/                  plus-jakarta-sans-latin.woff2, plus-jakarta-sans-latin-ext.woff2
    └── images/
        ├── favicon.svg
        ├── hero/               screenshot klantwebsite, 1080 × 600, WebP
        └── realisaties/        3 screenshots realisaties, WebP
```

`jv-webdesign.css` blijft gelijk aan de WordPress-versie. Aanpassingen voor de statische site horen in `site.css`.

## Nog te doen

- **Contactformulier (Formspree)**: gekoppeld aan formulier `mbglvqaa`. Eerste inzending nog bevestigen via de mail van Formspree. Honeypot = `_gotcha`, onderwerp van de mail = verborgen veld `_subject`. Het veld `email` gebruikt Formspree automatisch als reply-to.
- **Boekingskalender (Cal.com)**: gekoppeld aan `johan-vrolix-lab56o/30min` (2x in `#boeken`). Afspraaktype in Cal.com nog hernoemen naar "Gratis kennismaking". EU-account? Zet `data-cal-origin` op `https://app.cal.eu`. De agenda laadt pas na een klik op "Toon beschikbare momenten", dus geen Cal.com-scripts of -cookies vooraf.
- **Afbeeldingen**: placeholders in `.home-browser-screen` en `.home-project-media` vervangen door `<img>` met alt-tekst.
- **Placeholders**: alles tussen [haken] invullen (`grep -n "\[" index.html`). Nooit verzonnen reviews, klantnamen of cijfers.

## Hosting: Cloudflare Pages

- `404.html` in de hoofdmap wordt automatisch getoond bij onbekende URL's, met status 404. Zonder dat bestand zou Pages elke foute URL met de homepage beantwoorden (status 200, een "soft 404" voor Google).
- `_headers` zet security-headers en lange caching voor fonts. Bewust geen Content-Security-Policy, zodat Cal.com en Formspree blijven werken.
- Absolute paden in `404.html`: de site moet in de root van het domein staan.
