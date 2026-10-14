# Bucka Dizajn Pick&Collect

Interno orodje za **zaposlene v poslovalnici Bucka Dizajn**. Deluje v brskalniku (računalnik, tablica,
telefon), na tablico ali telefon pa ga lahko dodate na domači zaslon. Google Play in App Store nista
potrebna.

## Sektorji

### Popravilo oblačil (narejeno)

- **Prevzem** – oblačila stranke se sprejmejo v poslovalnico: datum prevzema, ime in priimek, telefon,
  neobvezna e-pošta, število kosov, opis (s hitrimi gumbi za pogosta popravila), neobvezna cena in
  dogovorjeni rok. Vsak prevzem dobi številko za listek (`P-0001`, `P-0002` …). Pri znani telefonski
  številki aplikacija predlaga ime stranke.
- **Izdaja** – iskanje po imenu, telefonu ali številki; naročila so združena po stranki. Brez iskanja so
  prikazana vsa gotova oblačila, ki čakajo na izdajo. Ob izdaji se prikaže znesek za plačilo.
- **Pregled** – »Za urediti danes« (opomniki, končna obvestila, oddaja v zabojnik), oblačila v popravilu,
  oblačila, ki čakajo na prevzem, in zadnja zaključena naročila.

**Roki za prevzem:**

1. Ko je naročilo označeno kot **gotovo**, se stranko obvesti, rok za prevzem je **14 dni**.
2. Po izteku roka gre **opomnik**: stranka ima še **3 delovne dni**.
3. Na **22. delovni dan** od obvestila (nikoli pred iztekom roka po opomniku) gre **končno obvestilo**:
   ker blaga ni prevzela v določenem času, smatramo, da ga ne potrebuje, in ga bomo oddali v zabojnik
   **Humana**.
4. Ko je blago oddano, ga zaposleni označi kot »Oddano v Humana«.

Primer: gotovo 2. 11. → rok 16. 11. → opomnik 17. 11. (zadnji rok 20. 11.) → končno obvestilo 2. 12.

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
- `DEFAULT_SERVICES` – začetni seznam storitev za hitro izbiro pri prevzemu (brez cen – cene so v blagajni);
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
