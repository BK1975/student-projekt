# Samodejna obvestila – namestitev (Google preglednica + Apps Script)

Brezplačno, potrebujete le Google račun (Gmail). Postopek traja približno 10 minut in ga opravite enkrat.

## Kaj dobite

- Vsaka prijava iz aplikacije se samodejno zapiše v Google preglednico (list **Naročila**).
- Delavnica prejme e-pošto o novi prijavi, stranka pa potrdilo s pogoji prevzema.
- V stolpcu **Status** izbirate: Prijavljeno → Oddano → V izdelavi → **Gotovo** → Prevzeto.
- Ko izberete **Gotovo**, stranka samodejno prejme obvestilo z **rokom za prevzem (14 dni)**.
- Vsak dan ob 8.00 skripta preveri roke:
  1. **Dan po izteku 14-dnevnega roka** stranki pošlje opomnik: kose mora prevzeti v **3 delovnih dneh**.
  2. **Na 22. delovni dan** od obvestila »gotovo« (in nikoli pred iztekom 3 dodatnih dni) stranki pošlje
     končno sporočilo: ker blaga ni prevzela v določenem času, smatramo, da ga ne potrebuje, in ga bomo
     oddali v zabojnik **Humana**. Status se spremeni v »Neprevzeto – za Humana«.
- Če stranka nima e-pošte, skripta v stolpec **Opombe** zapiše, da jo je treba poklicati, in to sporoči
  v dnevnem povzetku na e-pošto delavnice.
- Ko stranka kose prevzame, izberite **Prevzeto** – nato ne prejema več obvestil.

Primer: gotovo 2. 11. → rok 16. 11. → opomnik 17. 11. (zadnji rok 20. 11.) → končno obvestilo 2. 12.

## Namestitev

1. Na [sheets.new](https://sheets.new) ustvarite novo Google preglednico, npr. »Bucka Pick&Collect«.
2. V meniju izberite **Razširitve → Apps Script**.
3. Izbrišite vsebino datoteke `Code.gs` in vanjo prilepite vsebino datoteke [`Code.gs`](Code.gs).
   Na vrhu v `NASTAVITVE` vpišite pravi e-poštni naslov, telefon, naslov in delovni čas.
4. Kliknite ⚙ **Nastavitve projekta** in vklopite »Pokaži datoteko manifesta appsscript.json«. Nato
   v urejevalniku odprite `appsscript.json` in vanj prilepite vsebino datoteke
   [`appsscript.json`](appsscript.json). S tem nastavite časovni pas Europe/Ljubljana.
5. Shranite (💾), zgoraj izberite funkcijo **nastavi** in kliknite **Zaženi**. Google vas bo prosil za
   dovoljenja (preglednica, pošiljanje e-pošte, sprožilci) – potrdite jih
   (»Napredno → Pojdi na projekt«).
6. Kliknite **Uvedi → Nova uvedba**, izberite vrsto **Spletna aplikacija**:
   - Izvedi kot: **Jaz**
   - Kdo ima dostop: **Kdorkoli**

   Kliknite **Uvedi** in kopirajte **URL spletne aplikacije** (konča se z `/exec`).
7. V `bucka-dizajn/index.html` v nastavitvah `SHOP` vpišite ta URL v `backendUrl: '...'` in aplikacijo
   ponovno objavite.

Preizkus: oddajte prijavo v aplikaciji – v preglednici se mora pojaviti nova vrstica. Nato v stolpcu
Status izberite »Gotovo« in preverite, ali je prišlo obvestilo.

## Spremembe kasneje

- Rokov (14 dni, 3 delovni dnevi, 22 delovnih dni) ne spreminjajte samo v `Code.gs`, ampak tudi v
  `index.html` (`SHOP.pickupDays`, `reminderWorkDays`, `discardWorkDays`), da so pogoji, prikazani
  strankam, enaki.
- Seznam praznikov (`prazniki`) vsako leto dopolnite.
- Po spremembi `Code.gs` naredite **Uvedi → Upravljaj uvedbe → ✎ → Nova različica**, da URL ostane enak.

## Omejitve

- Gmail lahko pošlje do približno 100 e-poštnih sporočil na dan (z Google Workspace do 1500).
- Obvestila se pošiljajo po **e-pošti**. Samodejni SMS-i bi zahtevali plačljivo storitev (npr. SMS
  ponudnik z API-jem); strankam brez e-pošte delavnica pokliče sama.
