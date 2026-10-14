# Bucka Dizajn Pick&Collect

Spletna aplikacija za šiviljsko delavnico: stranka na spletu prijavi oblačila za **popravilo** ali
**izdelavo po naročilu**, izbere termin za **oddajo** in izve predviden datum **prevzema** gotovih kosov.
Ne potrebuje Google Play ali App Store – deluje v brskalniku, na telefonu pa jo je mogoče dodati na
domači zaslon (PWA).

## Kaj zna

- okvirni cenik popravil in izdelave po meri (cena »od« in čas izdelave)
- prijava več kosov naenkrat:
  - **popravilo** – vrsta oblačila, ena ali več storitev (krajšanje, zadrga, ožanje …), opis
  - **po naročilu** – vrsta izdelka, opis želje, želen rok
- izbira termina oddaje glede na delovni čas, praznike in najkrajši čas vnaprej
- samodejni izračun predvidenega prevzema (najdaljši čas izdelave v delovnih dneh)
- izbira načina obvestila, ko je naročilo gotovo (SMS, klic, e-pošta)
- oddaja: ustvari se številka naročila (npr. `BD-7KQ2M`) in odpre e-poštni program stranke s
  pripravljenim sporočilom na naslov delavnice
- seznam zadnjih naročil stranke; aplikacija si zapomni podatke stranke
- deluje tudi brez povezave (service worker)

## Urejanje

Vse nastavitve so na vrhu skripte v [`index.html`](index.html):

- `SHOP` – e-pošta za prijave, telefon, naslov, delovni čas, zaprti dnevi, dolžina termina
- `GARMENTS` – vrste oblačil
- `REPAIRS` – storitve popravil (`price` = cena od, `days` = delovni dnevi izdelave)
- `CUSTOM` – izdelava po naročilu (`price: 0` pomeni »po dogovoru«)

Trenutne cene, roki in kontaktni podatki so **primeri** – zamenjajte jih s pravimi.

Po spremembi datotek v `sw.js` povečajte `CACHE` (npr. `bucka-v2`), da obiskovalci dobijo novo različico.

## Lokalni zagon

```bash
cd bucka-dizajn
python3 -m http.server 8080
# odprite http://localhost:8080
```

## Objava na spletu (brezplačno)

Mapo lahko objavite na katerikoli statični gostovanji, npr. **Netlify** (povlecite mapo na
app.netlify.com/drop), **GitHub Pages** ali **Cloudflare Pages**. Za namestitev na domači zaslon in
delovanje brez povezave mora stran teči prek `https`.

## Omejitve te različice

Aplikacija nima strežnika: prijava pride do delavnice šele, ko stranka v svojem e-poštnem programu
pritisne **Pošlji**. Termini se ne zasedajo (dve stranki lahko izbereta isti termin), status naročila
pa stranki sporočite sami (SMS/klic/e-pošta). Za skupen koledar terminov, pregled naročil za delavnico
in statuse (»v izdelavi«, »pripravljeno za prevzem«) bi bil naslednji korak preprost strežnik ali
storitev, kot je Firebase ali Supabase.
