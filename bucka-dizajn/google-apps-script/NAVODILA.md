# Google preglednica – skupni podatki in samodejna obvestila

Brezplačno, potrebujete le Google račun (Gmail). Postopek traja približno 10 minut in ga opravite enkrat.

## Kaj dobite

- Vsa naročila so v Google preglednici (list **Naročila**). Vse naprave v poslovalnici vidijo iste podatke.
- Stranke so v listu **Stranke**, seznam storitev (brez cen) pa v listu **Storitve** in velja za vse naprave. Urejate ga v aplikaciji
  (Nastavitve → Storitve).
- Ko zaposleni v aplikaciji označi naročilo kot **gotovo**, stranka z e-pošto samodejno prejme
  obvestilo z rokom za prevzem (14 delovnih dni), zamudnino (0,50 € za vsak delovni dan po roku) in datumom, od
  katerega neprevzeta oblačila oddamo v zabojnik **Humana** (en mesec od obvestila).
- Vsak dan ob 8.00 skripta strankam z e-pošto samodejno pošlje:
  1. **opomnik** delovni dan pred iztekom roka,
  2. **obvestilo o zamudnini** prvi delovni dan po izteku roka,
  3. **opozorilo pred oddajo** zadnji delovni dan pred oddajo v zabojnik (če je isti dan na vrsti tudi
     obvestilo o zamudnini, gre samo opozorilo, ki vsebuje oboje).

  Roki, zamudnina in obvestila se štejejo samo po dnevih, ko je poslovalnica odprta (`delovniDnevi`,
  `prazniki` in dnevi odsotnosti iz lista **Odsotnosti**, ki jih označite v aplikaciji); ob drugih dneh
  skripta ničesar ne pošlje.
- Poslovalnica dobi dnevni povzetek po e-pošti: kaj je bilo poslano samodejno, komu je treba poslati
  opomnik po SMS (stranke brez e-pošte) in katera oblačila je treba oddati v zabojnik.

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
7. Na eni napravi odprite aplikacijo → **Nastavitve**, vpišite URL in ključ ter kliknite **Shrani in
   poveži**. Če so na napravi že podatki, jih aplikacija ponudi prenesti v preglednico.
8. Druge naprave povežete v Nastavitvah z gumbom **Pošlji povezavo** / **Kopiraj povezavo** (pod
   »Poveži drugo napravo«). Povezavo odprite na drugi napravi – na iPhonu po možnosti v aplikaciji na
   domačem zaslonu – in potrdite **Poveži**. Povezava vsebuje ključ, zato jo pošljite samo zaposlenim.

Če ste aplikacijo že uporabljali brez preglednice, podatke s te naprave prenesete ob povezavi ali kasneje
v Nastavitvah (»Podatki s te naprave« → Prenesi v preglednico).

## Spremembe kasneje

- Roke in praznike spreminjajte v `Code.gs` **in** v `index.html` (`CONFIG`), da sta enaka.
- Seznam praznikov vsako leto dopolnite.
- Po spremembi `Code.gs`: **Uvedi → Upravljaj uvedbe → ✎ → Različica: Nova različica**, da URL ostane enak.
- Če ste skripto namestili pred dodajanjem seznama storitev, po posodobitvi `Code.gs` še enkrat zaženite
  **nastavi** (doda manjkajoče liste Storitve, Stranke in Odsotnosti ter nove stolpce; obstoječi podatki ostanejo).
- Preglednico lahko berete in filtrirate, a podatke urejajte v aplikaciji. Ne spreminjajte vrstnega reda
  stolpcev in ne brišite stolpca **ID**.

## Omejitve

- Gmail pošlje do približno 100 e-poštnih sporočil na dan (Google Workspace do 1500).
- Samodejno se pošilja samo **e-pošta**. Samodejni SMS-i bi zahtevali plačljivega ponudnika SMS.
  Strankam brez e-pošte pošljete SMS v aplikaciji z enim dotikom (besedilo je pripravljeno).
