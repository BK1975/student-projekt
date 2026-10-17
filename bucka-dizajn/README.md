# Bucka Dizajn Pick&Collect

Interno orodje za **zaposlene v poslovalnici Bucka Dizajn**. Deluje v brskalniku (računalnik, tablica,
telefon), na tablico ali telefon pa ga lahko dodate na domači zaslon. Google Play in App Store nista
potrebna.

## Sektorji

### Popravilo oblačil (narejeno)

- **Stranke** (prvi zavihek) – vse stranke poslovalnice: ime in priimek, telefon, neobvezna e-pošta in
  opomba. Nova stranka se doda z gumbom **+ Nova**, obstoječo lahko uredite (podatki se posodobijo tudi
  na njenih naročilih). Iskanje po imenu, telefonu ali e-pošti, število obiskov in zadnji obisk, gumba
  **Nov prevzem** in **Naročila**. Stranka se prepozna po telefonski številki.
- **Prevzem** – oblačila stranke se sprejmejo v poslovalnico: izbira obstoječe stranke (ali **+ Nova
  stranka**), datum prevzema, število kosov, storitve (po skupinah iz cenika, brez cen), opis, neobvezna
  cena in dogovorjeni rok. Vsak prevzem dobi številko za listek (`P-0001`, `P-0002` …).
- **Izdaja** – iskanje po imenu, telefonu ali številki; naročila so združena po stranki in razvrščena po
  datumu prevzema (najnovejše ali najstarejše najprej, z naslovom dneva). Brez iskanja so prikazana vsa
  gotova oblačila, ki čakajo na izdajo. Ob izdaji se prikaže znesek za plačilo.
- **V popravilu** – vsa oblačila, ki so v delu, razvrščena po datumu prevzema; z gumbom **Označi kot gotovo**.
- **Pregled** – »Za urediti danes« (opomniki, končna obvestila, oddaja v zabojnik), **Evidenca** in zadnja
  zaključena naročila. Evidenca prikaže en dan naenkrat (puščici ‹ › ali izbira datuma): koliko strank je
  bilo ta dan **Prevzetih**, **V popravilu** in **Gotovih**, z imeni strank in številkami naročil.

**Roki za prevzem:**

1. Ko je naročilo označeno kot **gotovo**, se stranko obvesti: za prevzem ima **14 delovnih dni**.
2. **Delovni dan pred iztekom roka** gre **opomnik**.
3. Po roku teče **zamudnina 0,50 € na dan** (koledarski dnevi), razen če se stranka javi – takrat v
   podrobnostih naročila ali ob izdaji označite »Brez zamudnine«. Ob izdaji aplikacija izračuna zamudnino
   in znesek za plačilo.
4. Oblačila, ki niso prevzeta v **enem mesecu** od obvestila, se oddajo v zabojnik **Humana**; zaposleni
   jih označi kot »Oddano v Humana«.

Primer: gotovo 29. 9. → opomnik pet 16. 10. → rok za prevzem pon 19. 10. → zamudnina od 20. 10. →
oddaja v Humano od 29. 10.

**Prevzemni listek:** po shranjenem prevzemu (ali v podrobnostih naročila) z gumbom **Natisni listek**.
Zgornji del dobi stranka (podatki, storitve, pogoji prevzema), spodnji odrezek s številko se pripne na
oblačilo. Listek je oblikovan za tiskalnik računov (80 mm), natisne pa se tudi na A4.

Obvestila se pošiljajo s pripravljenim SMS (en dotik), po e-pošti ali s klicem. Če je povezana Google
preglednica, strankam z e-pošto obvestila pošilja **samodejno**.

### Izdelava po naročilu (sledi)

## Shranjevanje podatkov

- **Brez nastavitev** so podatki shranjeni samo v brskalniku naprave, na kateri vnašate (primerno za
  preizkus). V Nastavitvah lahko naredite varnostno kopijo (izvoz/uvoz JSON).
- **Z Google preglednico** (priporočeno) vse naprave v poslovalnici vidijo iste podatke, strankam z
  e-pošto pa se obvestila pošiljajo samodejno. Navodila: [`google-apps-script/NAVODILA.md`](google-apps-script/NAVODILA.md).

## Urejanje

Na vrhu skripte v [`index.html`](index.html):

- `CONFIG` – ime, telefon, naslov in delovni čas (za besedilo sporočil), roki (`pickupDays`,
  `reminderWorkDays`, `discardWorkDays`), delovni dnevi in prazniki
- `DEFAULT_SERVICES` – začetni seznam storitev po ceniku Bucka Dizajn, razvrščen po skupinah (brez cen – cene so v blagajni);
  seznam sicer urejate v aplikaciji: Nastavitve → Storitve

Enake roke in praznike nastavite tudi v `google-apps-script/Code.gs`. Po spremembi datotek v `sw.js`
povečajte `CACHE` (npr. `bucka-v4`).

## Lokalni zagon

```bash
cd bucka-dizajn
python3 -m http.server 8080
# odprite http://localhost:8080
```

## Objava

Mapo objavite na statičnem gostovanju s `https`, npr. **Netlify** (povlecite mapo na
app.netlify.com/drop), **GitHub Pages** ali **Cloudflare Pages**. Stran ima oznako `noindex`, zato je
iskalniki ne prikazujejo. Podatki strank niso v datotekah strani, ampak na napravi ali v vaši Google
preglednici, dostop do nje pa je zaščiten s ključem.
