/**
 * Bucka Dizajn Pick&Collect – zaledje v Google preglednici.
 *
 * - sprejme prijave iz spletne aplikacije in jih zapiše v list »Naročila«
 * - ko delavnica v stolpcu »Status« izbere »Gotovo«, stranki pošlje obvestilo z rokom za prevzem
 * - vsak dan samodejno pošlje opomnik in končno obvestilo, če kosi niso prevzeti
 *
 * Namestitev: glej NAVODILA.md.
 */

/* ======================= NASTAVITVE ======================= */

const NASTAVITVE = {
  imeDelavnice: 'Bucka Dizajn',
  emailDelavnice: 'info@bucka-dizajn.si', // sem pridejo nove prijave in dnevni povzetek
  telefon: '+386 40 000 000',
  naslov: 'Primerna ulica 1, 1000 Ljubljana',
  delovniCas: 'pon–pet 9:00–17:00 (čet do 19:00), sob 9:00–12:00',

  rokPrevzemaDni: 14,        // koledarski dnevi od obvestila »gotovo«
  dodatniDelovniDnevi: 3,    // po opomniku ima stranka še toliko delovnih dni
  koncnoObvestiloPo: 22,     // delovnih dni od obvestila »gotovo« do končnega obvestila
  zabojnik: 'Humana',

  delovniDnevi: [1, 2, 3, 4, 5], // 0 = nedelja … 6 = sobota
  prazniki: [
    '2026-12-25', '2026-12-26', '2027-01-01', '2027-01-02', '2027-02-08',
    '2027-03-28', '2027-03-29', '2027-04-27', '2027-05-01', '2027-05-02',
    '2027-06-25', '2027-08-15', '2027-10-31', '2027-11-01', '2027-12-25', '2027-12-26',
  ],
  uraDnevnegaPregleda: 8,
};

/* ========================================================== */

const LIST = 'Naročila';
const STOLPCI = [
  'Koda', 'Prejeto', 'Stranka', 'Telefon', 'E-pošta', 'Obveščanje', 'Oddaja', 'Predviden prevzem',
  'Želen prevzem', 'Kosi', 'Okvirna cena', 'Status', 'Gotovo dne', 'Rok prevzema', 'Opomnik poslan',
  'Zadnji rok', 'Končno obvestilo', 'Opombe',
];
const S = Object.fromEntries(STOLPCI.map((ime, i) => [ime, i + 1])); // številka stolpca po imenu
const ZA_ZABOJNIK = `Neprevzeto – za ${NASTAVITVE.zabojnik}`;
const STATUSI = ['Prijavljeno', 'Oddano', 'V izdelavi', 'Gotovo', 'Prevzeto', ZA_ZABOJNIK,
  `Oddano v zabojnik ${NASTAVITVE.zabojnik}`, 'Preklicano'];

/* ---------- Enkratna nastavitev ---------- */

/** Zaženite enkrat ročno: pripravi list, spustni seznam statusov in samodejne sprožilce. */
function nastavi() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(LIST) || ss.insertSheet(LIST);
  sh.getRange(1, 1, 1, STOLPCI.length).setValues([STOLPCI]).setFontWeight('bold').setBackground('#e5eeea');
  sh.setFrozenRows(1);
  const pravilo = SpreadsheetApp.newDataValidation().requireValueInList(STATUSI, true).build();
  sh.getRange(2, S.Status, sh.getMaxRows() - 1).setDataValidation(pravilo);
  ['Prejeto', 'Gotovo dne', 'Rok prevzema', 'Opomnik poslan', 'Zadnji rok', 'Končno obvestilo'].forEach((ime) =>
    sh.getRange(2, S[ime], sh.getMaxRows() - 1).setNumberFormat('d. m. yyyy'));

  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('obUrejanju').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('dnevniPregled').timeBased().everyDays(1).atHour(NASTAVITVE.uraDnevnegaPregleda).create();
}

/* ---------- Prijave iz spletne aplikacije ---------- */

function doGet() {
  return json({ ok: true, app: 'Bucka Dizajn Pick&Collect' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const o = JSON.parse(e.postData.contents);
    if (!o.code || !o.customer || !o.customer.name || !Array.isArray(o.items) || !o.items.length) {
      return json({ ok: false, error: 'Nepopolna prijava' });
    }
    const sh = SpreadsheetApp.getActive().getSheetByName(LIST);
    const kosi = o.items.map((it, i) => {
      let t = `${i + 1}. [${it.kind === 'repair' ? 'Popravilo' : 'Po naročilu'}] ${it.title}`;
      if (it.detail) t += ` – ${it.detail}`;
      if (it.note) t += ` – „${it.note}“`;
      if (it.deadline) t += ` – želen rok ${it.deadline}`;
      return t;
    }).join('\n');
    const vrstica = [];
    vrstica[S['Koda'] - 1] = o.code;
    vrstica[S['Prejeto'] - 1] = new Date();
    vrstica[S['Stranka'] - 1] = o.customer.name;
    vrstica[S['Telefon'] - 1] = "'" + o.customer.phone; // ohrani + in presledke
    vrstica[S['E-pošta'] - 1] = o.customer.email || '';
    vrstica[S['Obveščanje'] - 1] = o.customer.notify || '';
    vrstica[S['Oddaja'] - 1] = o.dropOff;
    vrstica[S['Predviden prevzem'] - 1] = o.ready;
    vrstica[S['Želen prevzem'] - 1] = o.pickupWish || '';
    vrstica[S['Kosi'] - 1] = kosi;
    vrstica[S['Okvirna cena'] - 1] = `od ${o.total} €${o.unpriced ? ' + po dogovoru' : ''}`;
    vrstica[S['Status'] - 1] = 'Prijavljeno';
    for (let i = 0; i < STOLPCI.length; i++) if (vrstica[i] === undefined) vrstica[i] = '';
    sh.appendRow(vrstica);

    const zaDelavnico = {
      to: NASTAVITVE.emailDelavnice,
      subject: `Nova prijava ${o.code} – oddaja ${o.dropOff}`,
      body: o.text || kosi,
    };
    if (o.customer.email) zaDelavnico.replyTo = o.customer.email;
    MailApp.sendEmail(zaDelavnico);
    if (o.customer.email) {
      posljiStranki(o.customer.email, `Potrdilo prijave ${o.code}`, [
        `Pozdravljeni ${o.customer.name},`,
        '',
        `hvala za prijavo. Pričakujemo vas ${o.dropOff} na naslovu ${NASTAVITVE.naslov}.`,
        `Številka naročila: ${o.code}`,
        `Predviden prevzem: ${o.pickupWish || o.ready}`,
        '',
        'Prijavljeni kosi:',
        kosi,
        '',
        pogojiPrevzema(),
      ]);
    }
    return json({ ok: true, code: o.code });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Status »Gotovo« ---------- */

/** Sproži se ob vsakem urejanju preglednice. */
function obUrejanju(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== LIST || e.range.getColumn() > S.Status || e.range.getLastColumn() < S.Status) return;
  for (let r = e.range.getRow(); r <= e.range.getLastRow(); r++) {
    if (r === 1) continue;
    const status = sh.getRange(r, S.Status).getValue();
    const gotovoDne = sh.getRange(r, S['Gotovo dne']).getValue();
    if (status === 'Gotovo' && !gotovoDne) oznaciGotovo(sh, r);
  }
}

function oznaciGotovo(sh, r) {
  const v = preberi(sh, r);
  const danes = brezUre(new Date());
  const rok = dodajDni(danes, NASTAVITVE.rokPrevzemaDni);
  sh.getRange(r, S['Gotovo dne']).setValue(danes);
  sh.getRange(r, S['Rok prevzema']).setValue(rok);
  if (!v.email) return dodajOpombo(sh, r, 'Gotovo – ni e-pošte, obvestite stranko po telefonu.');
  posljiStranki(v.email, `Naročilo ${v.koda} je pripravljeno za prevzem`, [
    `Pozdravljeni ${v.stranka},`,
    '',
    `vaše naročilo ${v.koda} je gotovo in čaka na prevzem na naslovu ${NASTAVITVE.naslov}.`,
    `Delovni čas: ${NASTAVITVE.delovniCas}`,
    '',
    `Rok za prevzem: ${datum(rok)}`,
    '',
    pogojiPrevzema(),
  ]);
}

/* ---------- Dnevni pregled rokov ---------- */

/** Sproži se vsak dan: pošlje opomnike in končna obvestila. */
function dnevniPregled() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST);
  const danes = brezUre(new Date());
  const povzetek = [];
  for (let r = 2; r <= sh.getLastRow(); r++) {
    const v = preberi(sh, r);
    if (v.status !== 'Gotovo' || !v.gotovoDne) continue;
    const korak = naslednjiKorak(v, danes);

    if (korak === 'opomnik') {
      const zadnjiRok = dodajDelovneDni(danes, NASTAVITVE.dodatniDelovniDnevi);
      sh.getRange(r, S['Opomnik poslan']).setValue(danes);
      sh.getRange(r, S['Zadnji rok']).setValue(zadnjiRok);
      if (v.email) {
        posljiStranki(v.email, `Opomnik: prevzem naročila ${v.koda}`, [
          `Pozdravljeni ${v.stranka},`,
          '',
          `rok za prevzem vašega naročila ${v.koda} (${datum(v.rokPrevzema)}) je potekel.`,
          `Prosimo, da kose prevzamete v ${NASTAVITVE.dodatniDelovniDnevi} delovnih dneh, najkasneje do ${datum(zadnjiRok)}.`,
          '',
          `Naslov: ${NASTAVITVE.naslov}`,
          `Delovni čas: ${NASTAVITVE.delovniCas}`,
          '',
          `Ker blaga ne skladiščimo, bomo neprevzete kose oddali v zabojnik ${NASTAVITVE.zabojnik}.`,
        ]);
        povzetek.push(`Opomnik poslan: ${v.koda} – ${v.stranka}`);
      } else {
        dodajOpombo(sh, r, 'Opomnik – ni e-pošte, pokličite stranko.');
        povzetek.push(`POKLIČITE (opomnik): ${v.koda} – ${v.stranka}, ${v.telefon}`);
      }
    } else if (korak === 'koncno') {
      sh.getRange(r, S['Končno obvestilo']).setValue(danes);
      sh.getRange(r, S.Status).setValue(ZA_ZABOJNIK);
      if (v.email) {
        posljiStranki(v.email, `Neprevzeto naročilo ${v.koda}`, [
          `Pozdravljeni ${v.stranka},`,
          '',
          `ker naročila ${v.koda} niste prevzeli v določenem času (rok ${datum(v.rokPrevzema)}, po opomniku do ${datum(v.zadnjiRok)}),`,
          'smatramo, da ga ne potrebujete.',
          `Ker pri nas blaga ne skladiščimo, ga bomo oddali v zabojnik ${NASTAVITVE.zabojnik}.`,
          '',
          'Lep pozdrav,',
          NASTAVITVE.imeDelavnice,
        ]);
        povzetek.push(`Končno obvestilo poslano: ${v.koda} – ${v.stranka}`);
      } else {
        dodajOpombo(sh, r, 'Končno obvestilo – ni e-pošte, pokličite stranko.');
        povzetek.push(`POKLIČITE (končno obvestilo): ${v.koda} – ${v.stranka}, ${v.telefon}`);
      }
    }
  }
  if (povzetek.length) {
    MailApp.sendEmail(NASTAVITVE.emailDelavnice, `Pick&Collect – dnevni pregled ${datum(danes)}`,
      povzetek.join('\n') + '\n\n' + SpreadsheetApp.getActive().getUrl());
  }
}

/**
 * Kaj je treba danes narediti z naročilom s statusom »Gotovo«.
 * Opomnik: dan po izteku roka za prevzem.
 * Končno obvestilo: na ${koncnoObvestiloPo}. delovni dan od obvestila »gotovo«,
 * a nikoli pred iztekom zadnjega roka po opomniku.
 */
function naslednjiKorak(v, danes) {
  if (!v.opomnik) return danes > v.rokPrevzema ? 'opomnik' : null;
  if (v.koncno) return null;
  const poPravilu = dodajDelovneDni(v.gotovoDne, NASTAVITVE.koncnoObvestiloPo);
  const poZadnjemRoku = dodajDelovneDni(v.zadnjiRok, 1);
  return danes >= najkasnejsi(poPravilu, poZadnjemRoku) ? 'koncno' : null;
}

/* ---------- Pomožne funkcije ---------- */

function preberi(sh, r) {
  const v = sh.getRange(r, 1, 1, STOLPCI.length).getValues()[0];
  const d = (ime) => (v[S[ime] - 1] instanceof Date ? brezUre(v[S[ime] - 1]) : null);
  return {
    koda: v[S['Koda'] - 1],
    stranka: v[S['Stranka'] - 1],
    telefon: v[S['Telefon'] - 1],
    email: String(v[S['E-pošta'] - 1] || '').trim(),
    status: v[S['Status'] - 1],
    gotovoDne: d('Gotovo dne'),
    rokPrevzema: d('Rok prevzema'),
    opomnik: d('Opomnik poslan'),
    zadnjiRok: d('Zadnji rok'),
    koncno: d('Končno obvestilo'),
  };
}

function pogojiPrevzema() {
  return `Pogoji prevzema: gotove kose je treba prevzeti v ${NASTAVITVE.rokPrevzemaDni} dneh od obvestila. ` +
    `Po izteku roka vam pošljemo opomnik in imate še ${NASTAVITVE.dodatniDelovniDnevi} delovne dni. ` +
    `Ker blaga ne skladiščimo, neprevzete kose oddamo v zabojnik ${NASTAVITVE.zabojnik}.`;
}

function posljiStranki(email, zadeva, vrstice) {
  MailApp.sendEmail({
    to: email,
    subject: zadeva,
    body: vrstice.concat(['', '--', NASTAVITVE.imeDelavnice, NASTAVITVE.naslov, NASTAVITVE.telefon]).join('\n'),
    name: NASTAVITVE.imeDelavnice,
    replyTo: NASTAVITVE.emailDelavnice,
  });
}

function dodajOpombo(sh, r, besedilo) {
  const c = sh.getRange(r, S.Opombe);
  const prej = c.getValue();
  c.setValue((prej ? prej + '\n' : '') + `${datum(new Date())}: ${besedilo}`);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function brezUre(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function dodajDni(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function najkasnejsi(a, b) { return a > b ? a : b; }
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function jeDelovniDan(d) {
  return NASTAVITVE.delovniDnevi.includes(d.getDay()) && !NASTAVITVE.prazniki.includes(iso(d));
}
function dodajDelovneDni(d, n) {
  let x = brezUre(d);
  while (n > 0) {
    x = dodajDni(x, 1);
    if (jeDelovniDan(x)) n--;
  }
  return x;
}
function datum(d) { return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; }
