/**
 * Bucka Dizajn Pick&Collect – zaledje v Google preglednici.
 *
 * - shranjuje naročila, ki jih zaposleni vnesejo v aplikaciji (list »Naročila«),
 *   tako da vse naprave v poslovalnici vidijo iste podatke
 * - ko je naročilo označeno kot gotovo, stranki z e-pošto samodejno pošlje obvestilo z rokom za prevzem
 * - vsak dan samodejno pošlje opomnik in končno obvestilo (zabojnik Humana) strankam z e-pošto,
 *   poslovalnici pa povzetek, koga je treba obvestiti po SMS/telefonu
 *
 * Namestitev: glej NAVODILA.md.
 */

/* ======================= NASTAVITVE ======================= */

const NASTAVITVE = {
  // Ključ, ki ga vpišete tudi v aplikaciji (Nastavitve → Ključ za dostop). Izberite svojega!
  kljuc: 'SPREMENI-ME',

  imeDelavnice: 'Bucka Dizajn',
  emailDelavnice: 'info@bucka-dizajn.si', // sem pride dnevni povzetek
  telefon: '+386 40 000 000',
  naslov: 'Primerna ulica 1, 1000 Ljubljana',
  delovniCas: 'pon–pet 9–17, sob 9–12',

  // Enako kot CONFIG v index.html:
  rokPrevzemaDni: 14,      // koledarski dnevi od obvestila »gotovo«
  dodatniDelovniDnevi: 3,  // po opomniku ima stranka še toliko delovnih dni
  koncnoObvestiloPo: 22,   // delovnih dni od obvestila »gotovo« do končnega obvestila
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
const CASOVNI_PAS = 'Europe/Ljubljana';
// [ključ v aplikaciji, naslov stolpca v preglednici]
const POLJA = [
  ['num', 'Številka'], ['sector', 'Sektor'], ['status', 'Status'], ['received', 'Datum prevzema'],
  ['name', 'Ime in priimek'], ['phone', 'Telefon'], ['email', 'E-pošta'], ['pieces', 'Kosov'],
  ['description', 'Opis'], ['price', 'Cena (€)'], ['dueDate', 'Dogovorjeno do'], ['note', 'Opomba'],
  ['readyDate', 'Gotovo dne'], ['readyNotified', 'Obveščeno'], ['deadline', 'Rok za prevzem'],
  ['reminderDate', 'Opomnik'], ['lastDeadline', 'Zadnji rok'], ['finalDate', 'Končno obvestilo'],
  ['handedDate', 'Izdano'], ['discardedDate', 'Oddano v zabojnik'],
  ['createdAt', 'Ustvarjeno'], ['updatedAt', 'Posodobljeno'], ['id', 'ID'],
  ['services', 'Storitve (cenik)'], // nove stolpce dodajajte samo na konec
];
const LIST_CENIK = 'Cenik';
const KLJUCI = POLJA.map((p) => p[0]);
const STOLPEC = Object.fromEntries(KLJUCI.map((k, i) => [k, i + 1]));
const ZAKLENJENO = ['id', 'num', 'sector', 'createdAt', 'updatedAt'];

/* ---------- Enkratna nastavitev ---------- */

/** Zaženite enkrat ročno: pripravi list in dnevni samodejni pregled. */
function nastavi() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(LIST) || ss.insertSheet(LIST);
  sh.getRange(1, 1, 1, POLJA.length).setValues([POLJA.map((p) => p[1])]).setFontWeight('bold').setBackground('#e5eeea');
  sh.setFrozenRows(1);
  sh.getRange(2, 1, sh.getMaxRows() - 1, POLJA.length).setNumberFormat('@'); // vse kot besedilo
  const cenik = ss.getSheetByName(LIST_CENIK) || ss.insertSheet(LIST_CENIK);
  cenik.getRange(1, 1, 1, 4).setValues([['Skupina', 'Storitev', 'Cena (€)', 'Cena od']]).setFontWeight('bold').setBackground('#e5eeea');
  cenik.setFrozenRows(1);
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dnevniPregled').timeBased().everyDays(1).atHour(NASTAVITVE.uraDnevnegaPregleda)
    .inTimezone(CASOVNI_PAS).create();
}

/* ---------- API za aplikacijo ---------- */

function doGet() {
  return json({ ok: true, app: 'Bucka Dizajn Pick&Collect' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Neveljavna zahteva' }); }
  if (NASTAVITVE.kljuc === 'SPREMENI-ME') return json({ ok: false, error: 'V Code.gs najprej nastavite svoj ključ.' });
  if (req.key !== NASTAVITVE.kljuc) return json({ ok: false, error: 'Napačen ključ za dostop' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(LIST);
    if (req.action === 'list') return json({ ok: true, orders: vsa(sh).map((v) => v.o), prices: preberiCenik() });
    if (req.action === 'savePrices') { shraniCenik(req.prices || []); return json({ ok: true }); }
    if (req.action === 'create') return json({ ok: true, order: ustvari(sh, req.order || {}) });
    if (req.action === 'update') return json({ ok: true, order: posodobi(sh, req.id, req.patch || {}) });
    return json({ ok: false, error: 'Neznano dejanje' });
  } catch (err) {
    return json({ ok: false, error: err.message || String(err) });
  } finally {
    lock.releaseLock();
  }
}

function ustvari(sh, vnos) {
  if (!vnos.name || !vnos.phone) throw new Error('Ime in telefon sta obvezna');
  if (!vnos.description && !(vnos.services || []).length) throw new Error('Manjka opis ali storitev');
  const sector = vnos.sector || 'popravilo';
  const predpona = sector === 'popravilo' ? 'P-' : 'N-';
  const zadnja = vsa(sh).filter((v) => String(v.o.num).startsWith(predpona))
    .reduce((m, v) => Math.max(m, Number(String(v.o.num).slice(2)) || 0), 0);
  const o = {};
  KLJUCI.forEach((k) => { o[k] = vnos[k]; });
  o.services = Array.isArray(vnos.services) ? vnos.services : [];
  o.id = Utilities.getUuid();
  o.num = predpona + String(zadnja + 1).padStart(4, '0');
  o.sector = sector;
  o.status = o.status || 'sprejeto';
  o.createdAt = o.updatedAt = new Date().toISOString();
  const r = sh.getLastRow() + 1;
  const obseg = sh.getRange(r, 1, 1, KLJUCI.length);
  obseg.setNumberFormat('@');
  obseg.setValues([vrsticaIz(o)]);
  return o;
}

function posodobi(sh, id, patch) {
  const v = vsa(sh).find((x) => x.o.id === id);
  if (!v) throw new Error('Naročila ni mogoče najti – osvežite aplikacijo');
  const prej = v.o.status;
  const o = Object.assign({}, v.o);
  Object.keys(patch).forEach((k) => {
    if (KLJUCI.includes(k) && !ZAKLENJENO.includes(k)) o[k] = patch[k];
  });
  o.updatedAt = new Date().toISOString();

  // Pravkar gotovo: stranki z e-pošto pošlji obvestilo.
  if (o.status === 'gotovo' && prej !== 'gotovo' && o.email && !o.readyNotified) {
    posljiStranki(o.email, `Vaša oblačila so pripravljena za prevzem (št. ${o.num})`, sporocilo('ready', o));
    o.readyNotified = danes();
  }
  zapisi(sh, v.vrstica, o);
  return o;
}

/* ---------- Dnevni pregled rokov ---------- */

/** Sproži se vsak dan: strankam z e-pošto pošlje opomnike in končna obvestila, poslovalnici povzetek. */
function dnevniPregled() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST);
  const t = danes();
  const poslano = [];
  const rocno = [];
  vsa(sh).forEach((v) => {
    const o = v.o;
    const faza = faza_(o, t);
    if (faza === 'opomnik' || faza === 'koncno') {
      if (o.email) {
        if (faza === 'opomnik') {
          o.reminderDate = t;
          o.lastDeadline = dodajDelovneDni(t, NASTAVITVE.dodatniDelovniDnevi);
          posljiStranki(o.email, `Opomnik: prevzem oblačil (št. ${o.num})`, sporocilo('reminder', o));
        } else {
          o.finalDate = t;
          posljiStranki(o.email, `Neprevzeta oblačila (št. ${o.num})`, sporocilo('final', o));
        }
        o.updatedAt = new Date().toISOString();
        zapisi(sh, v.vrstica, o);
        poslano.push(`${faza === 'opomnik' ? 'Opomnik' : 'Končno obvestilo'} (e-pošta): ${o.num} – ${o.name}`);
      } else {
        rocno.push(`${faza === 'opomnik' ? 'OPOMNIK' : 'KONČNO OBVESTILO'}: ${o.num} – ${o.name}, ${o.phone}`);
      }
    } else if (faza === 'humana') {
      rocno.push(`ODDAJ V ZABOJNIK ${NASTAVITVE.zabojnik.toUpperCase()}: ${o.num} – ${o.name}`);
    }
  });
  if (poslano.length || rocno.length) {
    const besedilo = [
      rocno.length ? 'Uredite v aplikaciji (Popravilo oblačil → Pregled):\n' + rocno.join('\n') : '',
      poslano.length ? 'Samodejno poslano:\n' + poslano.join('\n') : '',
    ].filter(Boolean).join('\n\n');
    MailApp.sendEmail(NASTAVITVE.emailDelavnice, `Pick&Collect – pregled ${fmt(t)}`, besedilo);
  }
}

/** Enako kot stage() v aplikaciji. */
function faza_(o, t) {
  if (o.status !== 'gotovo' || !o.deadline) return null;
  if (!o.reminderDate) return t > o.deadline ? 'opomnik' : null;
  if (!o.finalDate) {
    const rok = najkasnejsi(dodajDelovneDni(o.readyDate, NASTAVITVE.koncnoObvestiloPo), dodajDelovneDni(o.lastDeadline, 1));
    return t >= rok ? 'koncno' : null;
  }
  return 'humana';
}

/* ---------- Sporočila ---------- */

function sporocilo(vrsta, o) {
  const podpis = `\n\n${NASTAVITVE.imeDelavnice}\n${NASTAVITVE.naslov}\n${NASTAVITVE.telefon}\nDelovni čas: ${NASTAVITVE.delovniCas}`;
  const pozdrav = `Pozdravljeni ${o.name},\n\n`;
  if (vrsta === 'ready') {
    return pozdrav + `vaša oblačila (št. ${o.num}) so popravljena in čakajo na prevzem.\n` +
      `Rok za prevzem: ${fmt(o.deadline)}.\n\n` +
      `Ker blaga ne skladiščimo, oblačila, ki jih po opomniku ne prevzamete, oddamo v zabojnik ${NASTAVITVE.zabojnik}.` + podpis;
  }
  if (vrsta === 'reminder') {
    return pozdrav + `rok za prevzem vaših oblačil (št. ${o.num}) je potekel ${fmt(o.deadline)}.\n` +
      `Prosimo, prevzemite jih v ${NASTAVITVE.dodatniDelovniDnevi} delovnih dneh, najkasneje do ${fmt(o.lastDeadline)}.\n\n` +
      `Ker blaga ne skladiščimo, neprevzeta oblačila oddamo v zabojnik ${NASTAVITVE.zabojnik}.` + podpis;
  }
  return pozdrav + `ker oblačil (št. ${o.num}) niste prevzeli v določenem času, smatramo, da jih ne potrebujete.\n` +
    `Ker pri nas blaga ne skladiščimo, jih bomo oddali v zabojnik ${NASTAVITVE.zabojnik}.` + podpis;
}

function posljiStranki(email, zadeva, besedilo) {
  MailApp.sendEmail({ to: email, subject: zadeva, body: besedilo, name: NASTAVITVE.imeDelavnice, replyTo: NASTAVITVE.emailDelavnice });
}

/* ---------- Preglednica ---------- */

function vsa(sh) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, KLJUCI.length).getDisplayValues()
    .map((vr, i) => {
      const o = Object.fromEntries(KLJUCI.map((k, j) => [k, vr[j]]));
      try { o.services = o.services ? JSON.parse(o.services) : []; } catch (e) { o.services = []; }
      return { vrstica: i + 2, o };
    })
    .filter((v) => v.o.id);
}

// Vrednosti za zapis v vrstico: storitve kot JSON, vse ostalo kot besedilo.
function vrsticaIz(o) {
  return KLJUCI.map((k) => (k === 'services' ? JSON.stringify(o.services || []) : o[k] == null ? '' : String(o[k])));
}

function preberiCenik() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_CENIK);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues()
    .filter((r) => r[0] && r[1] && r[2] !== '')
    .map((r) => ({ group: String(r[0]), name: String(r[1]), price: Number(String(r[2]).replace(',', '.')), from: r[3] === true || String(r[3]).toLowerCase() === 'da' }))
    .filter((x) => Number.isFinite(x.price));
}

function shraniCenik(list) {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_CENIK);
  if (!sh) throw new Error('Ni lista Cenik – zaženite funkcijo nastavi');
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 4).clearContent();
  const vrstice = list
    .filter((x) => x.group && x.name && Number.isFinite(Number(x.price)))
    .map((x) => [String(x.group), String(x.name), Number(x.price), x.from ? 'da' : 'ne']);
  if (vrstice.length) sh.getRange(2, 1, vrstice.length, 4).setValues(vrstice);
}

function zapisi(sh, vrstica, o) {
  const obseg = sh.getRange(vrstica, 1, 1, KLJUCI.length);
  obseg.setNumberFormat('@');
  obseg.setValues([vrsticaIz(o)]);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Datumi (LLLL-MM-DD) ---------- */

function danes() { return Utilities.formatDate(new Date(), CASOVNI_PAS, 'yyyy-MM-dd'); }
function razcleni(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dodajDni(s, n) { const d = razcleni(s); d.setDate(d.getDate() + n); return iso(d); }
function jeDelovniDan(s) {
  return NASTAVITVE.delovniDnevi.includes(razcleni(s).getDay()) && !NASTAVITVE.prazniki.includes(s);
}
function dodajDelovneDni(s, n) {
  let x = s;
  while (n > 0) { x = dodajDni(x, 1); if (jeDelovniDan(x)) n--; }
  return x;
}
function najkasnejsi(a, b) { return a > b ? a : b; }
function fmt(s) { if (!s) return ''; const d = razcleni(s); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; }
