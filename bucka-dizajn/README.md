# Bucka Dizajn Pick&Collect

Interno orodje za **zaposlene v poslovalnici Bucka Dizajn**. Deluje v brskalniku (računalnik, tablica,
telefon), na tablico ali telefon pa ga lahko dodate na domači zaslon. Google Play in App Store nista
potrebna.

## Sektorji

### Popravilo oblačil (narejeno)

- **Stranke** (prvi zavihek) – vse stranke poslovalnice: ime in priimek, telefon in opomba. Nova stranka se doda z gumbom **+ Nova**, obstoječo lahko uredite (podatki se posodobijo tudi
  na njenih naročilih) ali odstranite z gumbom **Odstrani stranko** (s potrditvijo; skupaj z njenimi zaključenimi
  naročili – stranke z odprtimi naročili ni mogoče odstraniti). Iskanje po imenu ali telefonu, število obiskov in zadnji obisk, gumba
  **Nova oddaja** in **Naročila**. Stranka se prepozna po telefonski številki.
- **Oddaja** (stranka prinese oblačila) – izbira stranke (ali **+ Nova stranka**), datum oddaje, neobvezni dogovorjeni rok in
  kosi: z gumbom **+ DODAJ NOV KOS** izberete vrsto kosa (hlače, krilo, jakna …), eno ali več storitev
  zanj in opombo. Število kosov se izračuna samo. Vsaka oddaja dobi številko (`P-0001` …).
- **Izdaja** – iskanje po imenu, telefonu ali številki; naročila so združena po stranki in razvrščena po
  datumu oddaje (najnovejše ali najstarejše najprej, z naslovom dneva). Brez iskanja so prikazana vsa
  gotova oblačila, ki čakajo na izdajo. Ob izdaji se prikaže znesek za plačilo.
- **V popravilu** – vsa oblačila, ki so v delu, razvrščena po datumu oddaje; z gumbom **Označi kot gotovo**.
- **Pregled** – »Za urediti danes« (opomniki, končna obvestila, oddaja v zabojnik), **Evidenca** in zadnja
  **Koledar odsotnosti**. Evidenca prikaže en dan naenkrat (puščici ‹ › ali izbira datuma): koliko strank
  je bilo ta dan **V popravilu**, **Gotovih** in **Oddanih** (prinesenih ta dan) – vsak seznam se odpre s klikom. V koledarju
  odsotnosti s klikom označite dneve, ko je poslovalnica zaprta (dopust, bolniška); ti dnevi se ne štejejo
  v rok za prevzem in ne v zamudnino.

**Roki za prevzem in obvestila strankam** (šteje se samo dneve, ko je poslovalnica odprta: torek–petek,
brez praznikov in brez dni odsotnosti iz koledarja):

1. **Gotovo** – stranka dobi obvestilo: za prevzem ima **14 delovnih dni**, po roku zamudnina
   **0,5 € za vsak delovni dan**, neprevzeta oblačila po enem mesecu podarimo v dobrodelne namene
   (zabojnik **Humana**).
2. **Prvi opomnik** – delovni dan pred iztekom roka, z opozorilom, da se po roku zaračuna zamudnina.
3. **Drugi opomnik** – prvi delovni dan po izteku roka (približno teden pred oddajo): teče zamudnina
   (samo za delovne dneve: torek–petek, brez praznikov in dni odsotnosti) in datum dobrodelne oddaje.
4. **Oddaja v Humano** – en mesec po obvestilu »gotovo«; če ta dan poslovalnica ni odprta, se datum
   premakne na prvi naslednji delovni dan (in nikoli prej kot 3 delovne dni po roku).

Če se stranka javi, v podrobnostih naročila ali ob izdaji označite »Brez zamudnine«. Ob izdaji aplikacija
izračuna zamudnino in znesek za plačilo.

Primer: gotovo tor 27. 10. → prvi opomnik sre 18. 11. → rok čet 19. 11. → drugi opomnik (zamudnina
teče) pet 20. 11. → oddaja v Humano pet 27. 11.

Besedila sporočil so v `index.html` (funkcija `message`) in v `google-apps-script/Code.gs` (funkcija
`sporocilo`); naslov, telefon in delovni čas pa v `CONFIG` oziroma `NASTAVITVE`.

**Prevzemni listek** (zavihek **Oddaja**, termo papir 56 mm): zgornji del dobi stranka – podatki
poslovalnice (naslov, telefon, delovni čas), stranka, številka naročila, datum oddaje, število kosov in
pogoji prevzema. Spodnji odrezek ostane v poslovalnici – številka naročila, stranka s telefonom, datum
oddaje in vsi kosi s storitvami in opombami.

Obvestila se pošiljajo s pripravljenim SMS (en dotik) ali s klicem. Če je povezana Google preglednica,
poslovalnica vsak delovni dan prejme e-poštni povzetek, koga je treba obvestiti.

### Izdelava po naročilu (narejeno)

Enaki zavihki kot pri popravilih (Stranke, **Naročilo**, **V izdelavi**, Izdaja, Pregled); stranke so skupne
obema sektorjema, naročila pa ločena in imajo svoje številke (`N-0001`, `N-0002` …).

- **Mere** – mere stranke v cm: prsni obseg, pasni obseg, kolčni obseg, dolžina modela, rama + dolžina
  rokava, širina rokava, hrbtna dolžina, hrbtna širina ter poljubne **dodatne mere** (+ Dodaj mero), datum
  merjenja in opomba. Mere so shranjene pri stranki; po vnosu nove stranke v tem sektorju se vnos mer odpre
  sam, kasneje pa jih uredite v zavihku Mere ali z gumbom **Mere** pri stranki. Pri naročilu se mere
  prikažejo ob izbrani stranki, shranijo z naročilom in natisnejo na odrezku listka za poslovalnico.
- **Naročilo** – izbira stranke (ali **+ Nova stranka**) s kontaktno številko, **datum naročila**,
  **datum izdaje** (vpiše se ročno, neobvezno) in kosi: z gumbom **+ DODAJ NOV KOS** izberete izdelek s
  seznama (izdelava hlač, hlače na elastiko, izdelava hlač z žepi, šivanje klasičnega krila, šivanje krila
  z žepi, šivanje ženske jakne s podlogo, šivanje ženske jakne, šivanje podložene obleke, šivanje obleke
  jersey, šivanje maje, izdelava bluze/srajce) in vpišete opombo (mere, material, barva).
- Listek, obvestila strankam (»vaše naročilo je pripravljeno …«), roki za prevzem, zamudnina in evidenca
  delujejo enako kot pri popravilih.
- Seznam izdelkov urejate v Nastavitve → Storitve (skupina `Izdelava po naročilu`).

## Stik s strankami (oba sektorja)

Naprava v poslovalnici naj omogoča klice in SMS. Pri vsakem naročilu so vedno na voljo gumbi **Kliči**,
**Pošlji SMS** in – ko je naročilo gotovo – **Ponovno obvesti** (zadnje poslano obvestilo); pri vsaki stranki
**Kliči** in **Pošlji SMS**. »Pošlji SMS« odpre okno s pripravljenimi besedili (pripravljeno, opomnik,
zamudnina, opozorilo) ali prostim besedilom, ki ga lahko urejate; prikaže tudi število znakov in SMS-ov.
Gumb odpre aplikacijo za sporočila na napravi z vpisano številko in besedilom.

Podprte naprave: **iPhone** in **Android** (npr. Samsung) kličeta in pošiljata SMS neposredno; **Mac** kliče
prek FaceTima in pošilja SMS prek Sporočil s povezanim iPhonom. Za to morata biti Mac in iPhone prijavljena
z istim Apple ID-jem, na iPhonu pa vklopljeno: *Nastavitve → Telefon → Klici na drugih napravah → Mac* in
*Nastavitve → Sporočila → Posredovanje besedilnih sporočil → Mac*. Na drugih računalnikih se pokaže okno s
številko in besedilom za kopiranje.

## Shranjevanje podatkov in več naprav

- **Brez Google preglednice** so podatki shranjeni samo v brskalniku naprave, na kateri vnašate. Druge
  naprave jih ne vidijo – na iPhonu sta celo Safari in aplikacija na domačem zaslonu ločena. Aplikacija na
  to opozori na začetnem zaslonu. V Nastavitvah lahko naredite varnostno kopijo (naročila, stranke,
  odsotnosti in storitve v eni datoteki JSON).
- **Z Google preglednico** (priporočeno) vse naprave vidijo iste stranke in naročila, poslovalnica
  pa vsak delovni dan prejme e-poštni povzetek obvestil. Navodila: [`google-apps-script/NAVODILA.md`](google-apps-script/NAVODILA.md).
  - Ob prvi povezavi aplikacija ponudi **prenos podatkov s te naprave** v preglednico (brez podvajanja;
    zasedena številka naročila dobi novo številko).
  - **Druge naprave povežete z enim dotikom:** Nastavitve → *Poveži drugo napravo* → pošljite povezavo
    (SMS, e-pošta, WhatsApp) in jo odprite na drugi napravi ali v aplikaciji na domačem zaslonu.
    Povezava vsebuje ključ za dostop, zato jo pošljite samo zaposlenim.

## Namestitev na napravo

- **iPhone/iPad (Safari):** Deli → *Dodaj na začetni zaslon*.
- **Android (Chrome):** meni ⋮ → *Namesti aplikacijo* (ali *Dodaj na začetni zaslon*).
- **Računalnik (Chrome/Edge):** ikona za namestitev v naslovni vrstici.

Aplikacija ima ikone za vse naprave, deluje tudi brez povezave (zadnje naložene podatke) in se na
tablici ter računalniku prikaže v dveh stolpcih. Ko objavite novo različico, se na napravah prikaže
obvestilo **»Na voljo je nova različica – Osveži«**.

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
