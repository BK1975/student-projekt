# Google preglednica – skupni podatki in samodejna obvestila

Brezplačno, potrebujete le Google račun (Gmail). Postopek traja približno 10 minut in ga opravite enkrat.

## Kaj dobite

- Vsa naročila so v Google preglednici (list **Naročila**). Vse naprave v poslovalnici vidijo iste podatke.
- Stranke so v listu **Stranke**, seznam storitev (brez cen) pa v listu **Storitve** in velja za vse naprave. Urejate ga v aplikaciji
  (Nastavitve → Storitve).
- Ko zaposleni v aplikaciji označi naročilo kot **gotovo**, stranka z e-pošto samodejno prejme
  obvestilo z rokom za prevzem (14 dni).
- Vsak dan ob 8.00 skripta preveri roke in strankam z e-pošto samodejno pošlje:
  1. **opomnik** dan po izteku 14-dnevnega roka (prevzem v 3 delovnih dneh),
  2. **končno obvestilo** na 22. delovni dan od obvestila »gotovo« (in nikoli pred iztekom roka po
     opomniku), da bo blago oddano v zabojnik **Humana**.
- Poslovalnica dobi dnevni povzetek po e-pošti: kaj je bilo poslano samodejno in koga je treba obvestiti
  po SMS ali telefonu (stranke brez e-pošte), ter katera oblačila je treba oddati v zabojnik.

## Namestitev

1. Na [sheets.new](https://sheets.new) ustvarite novo Google preglednico, npr. »Bucka Pick&Collect«.
2. V meniju izberite **Razširitve → Apps Script**.
3. Izbrišite vsebino datoteke `Code.gs` in vanjo prilepite vsebino datoteke [`Code.gs`](Code.gs).
   Na vrhu v `NASTAVITVE`:
   - pri `kljuc` zamenjajte `SPREMENI-ME` s svojim ključem (npr. 12 naključnih črk in številk) –
     ta ključ ščiti podatke strank,
   - vpišite pravi e-poštni naslov, telefon, naslov in delovni čas.
4. Kliknite ⚙ **Nastavitve projekta** in vklopite »Pokaži datoteko manifesta appsscript.json«. V
   urejevalniku odprite `appsscript.json` in vanj prilepite vsebino datoteke
   [`appsscript.json`](appsscript.json) (časovni pas Europe/Ljubljana).
5. Shranite (💾), zgoraj izberite funkcijo **nastavi** in kliknite **Zaženi**. Potrdite dovoljenja, ki
   jih zahteva Google (»Napredno → Pojdi na projekt«).
6. Kliknite **Uvedi → Nova uvedba**, vrsta **Spletna aplikacija**:
   - Izvedi kot: **Jaz**
   - Kdo ima dostop: **Kdorkoli**

   Kliknite **Uvedi** in kopirajte **URL spletne aplikacije** (konča se z `/exec`).
7. Na vsaki napravi v poslovalnici odprite aplikacijo → **Nastavitve**, vpišite URL in ključ ter kliknite
   **Shrani in poveži**.

Če ste aplikacijo že uporabljali brez preglednice, so tista naročila ostala na napravi. Pred
povezovanjem jih po potrebi izvozite (Nastavitve → Izvozi) in vnesite znova.

## Spremembe kasneje

- Roke in praznike spreminjajte v `Code.gs` **in** v `index.html` (`CONFIG`), da sta enaka.
- Seznam praznikov vsako leto dopolnite.
- Po spremembi `Code.gs`: **Uvedi → Upravljaj uvedbe → ✎ → Različica: Nova različica**, da URL ostane enak.
- Če ste skripto namestili pred dodajanjem seznama storitev, po posodobitvi `Code.gs` še enkrat zaženite
  **nastavi** (doda manjkajoče liste Storitve in Stranke ter stolpec »Storitve«; obstoječi podatki ostanejo).
- Preglednico lahko berete in filtrirate, a podatke urejajte v aplikaciji. Ne spreminjajte vrstnega reda
  stolpcev in ne brišite stolpca **ID**.

## Omejitve

- Gmail pošlje do približno 100 e-poštnih sporočil na dan (Google Workspace do 1500).
- Samodejno se pošilja samo **e-pošta**. Samodejni SMS-i bi zahtevali plačljivega ponudnika SMS.
  Strankam brez e-pošte pošljete SMS v aplikaciji z enim dotikom (besedilo je pripravljeno).
