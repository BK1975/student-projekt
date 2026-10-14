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
- pri popravilih izbira **želenega datuma prevzema** (od predvidenega dne, ko bo gotovo, do izteka roka)
- izbira načina obvestila, ko je naročilo gotovo (SMS, klic, e-pošta)
- **rok za prevzem 14 dni** s samodejnim opomnikom (še 3 delovni dnevi) in končnim obvestilom na
  22. delovni dan, da bodo neprevzeti kosi oddani v zabojnik Humana – glej
  [`google-apps-script/NAVODILA.md`](google-apps-script/NAVODILA.md)
- oddaja: ustvari se številka naročila (npr. `BD-7KQ2M`); prijava se zapiše v Google preglednico
  delavnice (če je nastavljen `backendUrl`), sicer se odpre e-poštni program stranke s pripravljenim
  sporočilom
- seznam zadnjih naročil stranke; aplikacija si zapomni podatke stranke
- deluje tudi brez povezave (service worker)

## Urejanje

Vse nastavitve so na vrhu skripte v [`index.html`](index.html):

- `SHOP` – e-pošta za prijave, telefon, naslov, delovni čas, zaprti dnevi, dolžina termina,
  `backendUrl` (Google Apps Script) in pogoji prevzema (`pickupDays`, `reminderWorkDays`, `discardWorkDays`)
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

- Brez nastavljenega `backendUrl` prijava pride do delavnice šele, ko stranka v svojem e-poštnem programu
  pritisne **Pošlji**, samodejnih opomnikov pa ni. Za samodejna obvestila sledite
  [`google-apps-script/NAVODILA.md`](google-apps-script/NAVODILA.md).
- Termini oddaje se ne zasedajo (dve stranki lahko izbereta isti termin).
- Samodejna obvestila se pošiljajo po e-pošti; SMS bi zahteval plačljivo storitev.
