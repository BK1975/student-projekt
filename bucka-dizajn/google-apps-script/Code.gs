/**
 * Bucka Dizajn Pick&Collect – zaledje v Google preglednici.
 *
 * - shranjuje naročila, ki jih zaposleni vnesejo v aplikaciji (list »Naročila«),
 *   tako da vse naprave v poslovalnici vidijo iste podatke
 * - ko je naročilo označeno kot gotovo, stranki z e-pošto samodejno pošlje obvestilo z rokom za prevzem
 * - vsak dan strankam z e-pošto samodejno pošlje prvi opomnik (delovni dan pred rokom) in drugi
 *   opomnik (prvi delovni dan po roku: zamudnina in datum dobrodelne oddaje),
 *   poslovalnici pa povzetek, koga je treba obvestiti po SMS/telefonu in kaj odnesti v zabojnik
 *
 * Namestitev: glej NAVODILA.md.
 */

/* ======================= NASTAVITVE ======================= */

const NASTAVITVE = {
  // Ključ, ki ga vpišete tudi v aplikaciji (Nastavitve → Ključ za dostop). Izberite svojega!
  kljuc: 'SPREMENI-ME',

  imeDelavnice: 'Bucka Dizajn',
  emailDelavnice: 'buckadizajn@gmail.com', // sem pride dnevni povzetek
  telefon: '040 428 401',
  naslov: 'Ulica Hermana Potočnika 7, 1000 Ljubljana',
  delovniCas: 'ponedeljek zaprto; torek, četrtek in petek 10.00–14.00; sreda 14.00–18.00',

  // Enako kot CONFIG v index.html:
  rokPrevzemaDelovnihDni: 14, // za prevzem ima stranka toliko delovnih dni od obvestila »gotovo«
  zamudninaNaDan: 0.5,        // € za vsak delovni dan po roku za prevzem
  oddajaPoMesecih: 1,         // po toliko mesecih od obvestila »gotovo« neprevzeto oddamo v zabojnik
  najmanjDniPoRoku: 3,        // oddaja v zabojnik najprej toliko delovnih dni po roku za prevzem
  zabojnik: 'Humana',
  delovniDnevi: [2, 3, 4, 5], // dnevi, ko je poslovalnica odprta (0 = nedelja … 6 = sobota)
  // Slovenski dela prosti prazniki se izračunajo sami (tudi velika noč); sem dodajte le izredne proste dni.
  prazniki: [],
  uraDnevnegaPregleda: 8,
};

/* ========================================================== */

const LIST = 'Naročila';
const CASOVNI_PAS = 'Europe/Ljubljana';
// [ključ v aplikaciji, naslov stolpca v preglednici]
const POLJA = [
  ['num', 'Številka'], ['sector', 'Sektor'], ['status', 'Status'], ['received', 'Datum oddaje'],
  ['name', 'Ime in priimek'], ['phone', 'Telefon'], ['email', 'E-pošta'], ['pieces', 'Kosov'],
  ['description', 'Opis'], ['price', 'Cena (€)'], ['dueDate', 'Dogovorjeno do'], ['note', 'Opomba'],
  ['readyDate', 'Gotovo dne'], ['readyNotified', 'Obveščeno'], ['deadline', 'Rok za prevzem'],
  ['reminderDate', 'Prvi opomnik'], ['lastDeadline', 'Zadnji rok'], ['finalDate', 'Končno obvestilo'],
  ['handedDate', 'Izdano'], ['discardedDate', 'Oddano v zabojnik'],
  ['createdAt', 'Ustvarjeno'], ['updatedAt', 'Posodobljeno'], ['id', 'ID'],
  ['services', 'Storitve'], // nove stolpce dodajajte samo na konec
  ['feeWaived', 'Brez zamudnine'], ['lateFee', 'Zamudnina (€)'],
  ['lateNoticeDate', 'Obvestilo o zamudnini'], ['warnDate', 'Drugi opomnik'],
  ['items', 'Kosi'], ['measures', 'Mere ob naročilu'],
];
const LIST_STORITVE = 'Storitve';
const LIST_STRANKE = 'Stranke';
const LIST_ODSOTNOSTI = 'Odsotnosti';
const LIST_ZAPISKI = 'Zapiski';
const POLJA_ZAPISKI = [['id', 'ID'], ['text', 'Besedilo'], ['date', 'Pokaži od'], ['createdAt', 'Ustvarjeno']];
const JSON_POLJA = ['services', 'items'];
const POLJA_STRANKE = [['id', 'ID'], ['name', 'Ime in priimek'], ['phone', 'Telefon'], ['email', 'E-pošta'], ['note', 'Opomba'], ['createdAt', 'Ustvarjeno'],
  ['measures', 'Mere']]; // mere so shranjene kot JSON
// Na listu Stranke se stolpci iščejo po naslovu, zato jih lahko premikate. Stolpec »Naročila« (številke
// naročil stranke) izpolni skripta sama; »Ustvarjeno« je zapisan kot datum in čas.
const STOLPEC_NAROCILA = 'Naročila';
const FORMAT_CASA = 'd.m.yyyy hh:mm AM/PM';
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
  const storitve = ss.getSheetByName(LIST_STORITVE) || ss.insertSheet(LIST_STORITVE);
  storitve.getRange(1, 1, 1, 2).setValues([['Skupina', 'Storitev']]).setFontWeight('bold').setBackground('#e5eeea');
  storitve.setFrozenRows(1);
  const ods = ss.getSheetByName(LIST_ODSOTNOSTI) || ss.insertSheet(LIST_ODSOTNOSTI);
  ods.getRange(1, 1).setValue('Datum odsotnosti').setFontWeight('bold').setBackground('#e5eeea');
  ods.getRange(2, 1, ods.getMaxRows() - 1, 1).setNumberFormat('@');
  if (!ss.getSheetByName(LIST_STRANKE)) {
    const stranke = ss.insertSheet(LIST_STRANKE);
    stranke.getRange(1, 1, 1, POLJA_STRANKE.length).setValues([POLJA_STRANKE.map((p) => p[1])]).setFontWeight('bold').setBackground('#e5eeea');
    stranke.setFrozenRows(1);
    stranke.getRange(2, 1, stranke.getMaxRows() - 1, POLJA_STRANKE.length).setNumberFormat('@');
  }
  pripraviStranke_(ss.getSheetByName(LIST_STRANKE));
  osveziNarocilaStrank_();
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dnevniPregled').timeBased().everyDays(1).atHour(NASTAVITVE.uraDnevnegaPregleda)
    .inTimezone(CASOVNI_PAS).create();
}

/* ---------- API za aplikacijo ---------- */

// Aplikacija pošilja manjše zahteve kot GET (?p=…), večje kot POST – oboje obdela obdelaj_.
function doGet(e) {
  const prm = (e && e.parameter) || {};
  const out = prm.p ? obdelaj_(prm.p) : json({ ok: true, app: 'Bucka Dizajn Pick&Collect', verzija: 3 });
  if (!/^[\w$]+$/.test(prm.cb || '')) return out;
  // Rezervna pot za brskalnike, ki zavrnejo fetch: odgovor kot <script> (JSONP).
  return ContentService.createTextOutput(prm.cb + '(' + out.getContent() + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  return obdelaj_(e && e.postData ? e.postData.contents : '');
}

function obdelaj_(besedilo) {
  let req;
  try { req = JSON.parse(besedilo); } catch (err) { return json({ ok: false, error: 'Neveljavna zahteva' }); }
  if (NASTAVITVE.kljuc === 'SPREMENI-ME') return json({ ok: false, error: 'V Code.gs najprej nastavite svoj ključ.' });
  if (req.key !== NASTAVITVE.kljuc) return json({ ok: false, error: 'Napačen ključ za dostop' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(LIST);
    uskladiGlavo_(sh);
    if (req.action === 'list') return json({ ok: true, orders: vsa(sh).map((v) => v.o), services: preberiStoritve(), customers: preberiStranke(), absences: odsotnosti(), notes: preberiZapiske() });
    if (req.action === 'saveAbsences') { shraniOdsotnosti(req.absences || []); return json({ ok: true }); }
    if (req.action === 'saveServices') { shraniStoritve(req.services || []); return json({ ok: true }); }
    if (req.action === 'saveNote') return json({ ok: true, note: shraniZapisek(req.note || {}) });
    if (req.action === 'deleteNote') { izbrisiZapisek(req.id); return json({ ok: true }); }
    let odgovor;
    if (req.action === 'importAll') odgovor = Object.assign({ ok: true }, uvoziVse(sh, req));
    else if (req.action === 'deleteCustomer') odgovor = Object.assign({ ok: true }, odstraniStranko(sh, req.id, req.orderIds));
    else if (req.action === 'saveCustomer') odgovor = { ok: true, customer: shraniStranko(req.customer || {}) };
    else if (req.action === 'create') odgovor = { ok: true, order: ustvari(sh, req.order || {}) };
    else if (req.action === 'update') odgovor = { ok: true, order: posodobi(sh, req.id, req.patch || {}) };
    else return json({ ok: false, error: 'Neznano dejanje' });
    osveziNarocilaStrank_(); // številke naročil pri strankah
    return json(odgovor);
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
  o.items = Array.isArray(vnos.items) ? vnos.items : [];
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
    posljiStranki(o.email, o.sector === 'narocilo' ? 'Vaše naročilo je pripravljeno na prevzem' : 'Vaša oblačila so pripravljena na prevzem', sporocilo('ready', o));
    o.readyNotified = danes();
  }
  zapisi(sh, v.vrstica, o);
  return o;
}

/* ---------- Prenos podatkov z naprave (pred povezavo s preglednico) ---------- */

function uvoziVse(sh, data) {
  const tel = telefon_;
  // Stranke: brez podvajanja (po ID ali telefonu).
  let stStrank = 0;
  const stranke = preberiStranke();
  (data.customers || []).forEach((c) => {
    if (!c.name || !c.phone || stranke.some((x) => x.id === c.id || tel(x.phone) === tel(c.phone))) return;
    stranke.push(shraniStranko(Object.assign({}, c, { id: c.id || '' })));
    stStrank++;
  });
  // Naročila: brez podvajanja po ID; zasedena številka dobi novo.
  let stNarocil = 0;
  const obstojeca = vsa(sh).map((v) => v.o);
  const ids = new Set(obstojeca.map((o) => o.id));
  const stevilke = new Set(obstojeca.map((o) => o.num));
  const zadnja = {};
  const naslednja = (pred) => {
    if (zadnja[pred] === undefined) zadnja[pred] = obstojeca.filter((o) => String(o.num).startsWith(pred)).reduce((m, o) => Math.max(m, Number(String(o.num).slice(2)) || 0), 0);
    let num;
    do { num = pred + String(++zadnja[pred]).padStart(4, '0'); } while (stevilke.has(num));
    return num;
  };
  (data.orders || []).forEach((vnos) => {
    if (!vnos.id || ids.has(vnos.id)) return;
    const o = {};
    KLJUCI.forEach((k) => { o[k] = vnos[k] == null ? '' : vnos[k]; });
    JSON_POLJA.forEach((k) => { o[k] = Array.isArray(vnos[k]) ? vnos[k] : []; });
    const pred = o.sector === 'narocilo' ? 'N-' : 'P-';
    if (!o.num || stevilke.has(o.num)) o.num = naslednja(pred);
    o.updatedAt = new Date().toISOString();
    const r = sh.getLastRow() + 1;
    zapisi(sh, r, o);
    ids.add(o.id); stevilke.add(o.num); stNarocil++;
  });
  if (Array.isArray(data.absences) && data.absences.length) {
    shraniOdsotnosti([...new Set(odsotnosti().concat(data.absences))]);
  }
  return { orders: stNarocil, customers: stStrank };
}

/* ---------- Dnevni pregled rokov ---------- */

/** Sproži se vsak dan: strankam z e-pošto pošlje opomnike in obvestila, poslovalnici povzetek. */
function dnevniPregled() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST);
  const t = danes();
  if (!jeDelovniDan(t)) return; // obvestila pošiljamo samo na dneve, ko je poslovalnica odprta
  const poslano = [];
  const rocno = [];
  const VRSTE = {
    opomnik: { polje: 'reminderDate', sporocilo: 'reminder', zadeva: 'Prvi opomnik: rok za prevzem', ime: 'PRVI OPOMNIK' },
    opozorilo: { polje: 'warnDate', sporocilo: 'warning', zadeva: 'Drugi opomnik: rok za prevzem je potekel', ime: 'DRUGI OPOMNIK' },
  };
  vsa(sh).forEach((v) => {
    const o = v.o;
    if (o.status === 'gotovo' && o.readyDate) o.deadline = dodajDelovneDni(o.readyDate, NASTAVITVE.rokPrevzemaDelovnihDni);
    const faza = faza_(o, t);
    const vrsta = VRSTE[faza];
    if (vrsta) {
      if (o.email) {
        o[vrsta.polje] = t;
        // Opozorilo vsebuje tudi podatek o zamudnini.
        o.updatedAt = new Date().toISOString();
        posljiStranki(o.email, vrsta.zadeva, sporocilo(vrsta.sporocilo, o, t));
        zapisi(sh, v.vrstica, o);
        poslano.push(`${vrsta.ime} (e-pošta): ${o.num} – ${o.name}`);
      } else {
        rocno.push(`${vrsta.ime} (SMS): ${o.num} – ${o.name}, ${o.phone}`);
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
  if (o.status !== 'gotovo' || !o.deadline || !o.readyDate) return null;
  if (t >= oddajaOd(o)) return 'humana';
  // Drugi opomnik: prvi delovni dan po roku za prevzem.
  if (!o.warnDate && t >= odprtOdDne(dodajDni(o.deadline, 1))) return 'opozorilo';
  if (t > o.deadline) return null;
  if (!o.reminderDate && t >= prejsnjiDelovniDan(o.deadline)) return 'opomnik';
  return null;
}

function oddajaOd(o) {
  const d = razcleni(o.readyDate);
  const dan = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + NASTAVITVE.oddajaPoMesecih);
  d.setDate(Math.min(dan, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return najkasnejsi(odprtOdDne(iso(d)), dodajDelovneDni(o.deadline, NASTAVITVE.najmanjDniPoRoku));
}

function najkasnejsi(a, b) { return a > b ? a : b; }

// Prvi dan od s naprej, ko je poslovalnica odprta.
function odprtOdDne(s) {
  let x = s;
  while (!jeDelovniDan(x)) x = dodajDni(x, 1);
  return x;
}

function prejsnjiDelovniDan(s) {
  let x = dodajDni(s, -1);
  while (!jeDelovniDan(x)) x = dodajDni(x, -1);
  return x;
}

/* ---------- Sporočila ---------- */

function sporocilo(vrsta, o, t) {
  const konec = `\n\nDelovni čas: ${NASTAVITVE.delovniCas}.\n${NASTAVITVE.imeDelavnice}, ${NASTAVITVE.naslov}, tel. ${NASTAVITVE.telefon}`;
  const evri = (x) => `${x.toFixed(2).replace('.', ',')} €`;
  // Enako kot message() v aplikaciji: popravila (oblačila) ali naročila (naročilo).
  const W = o.sector === 'narocilo'
    ? { your: `vaše naročilo (št. ${o.num})`, yours: `vašega naročila (št. ${o.num})`, isReady: 'je pripravljeno', them: 'ga', waits: 'še vedno čaka', left: 'Izdelke, ki niso prevzeti', leftLow: 'izdelke, ki niso prevzeti' }
    : { your: `vaša oblačila (št. ${o.num})`, yours: `vaših oblačil (št. ${o.num})`, isReady: 'so pripravljena', them: 'jih', waits: 'še vedno čakajo', left: 'Oblačila, ki niso prevzeta', leftLow: 'oblačila, ki niso prevzeta' };
  if (vrsta === 'ready') {
    return `Pozdravljeni, ${W.your} ${W.isReady} na prevzem. Prevzamete ${W.them} lahko do ${fmt(o.deadline)}. ` +
      `Po preteku roka se za vsak delovni dan zaračuna zamudnina v višini ${String(NASTAVITVE.zamudninaNaDan).replace('.', ',')} €. ` +
      `${o.sector === 'narocilo' ? 'Naročilo, ki ga' : 'Oblačila, ki jih'} ne boste prevzeli v enem mesecu od prejema obvestila (${fmt(oddajaOd(o))}), ` +
      `bomo podarili v dobrodelne namene.` + konec;
  }
  const zamudninaBesedilo = `za vsak delovni dan zaračuna zamudnina v višini ${String(NASTAVITVE.zamudninaNaDan).replace('.', ',')} €`;
  if (vrsta === 'reminder') {
    const kdaj = dodajDni(t || danes(), 1) === o.deadline ? `jutri (${fmt(o.deadline)})` : fmt(o.deadline);
    return `Pozdravljeni, opominjamo vas, da je ${kdaj} zadnji dan za prevzem ${W.yours} brez zamudnine. ` +
      `Po preteku roka se ${zamudninaBesedilo}.` + konec;
  }
  // Drugi opomnik (enako kot message('warning') v aplikaciji).
  const dni = dniZamude(o, t || danes());
  return (dni && !o.feeWaived
    ? `Pozdravljeni, rok za prevzem ${W.yours} je potekel ${fmt(o.deadline)}, zato se ${zamudninaBesedilo}; do danes znaša ${evri(dni * NASTAVITVE.zamudninaNaDan)}. `
    : `Pozdravljeni, ${W.your} ${W.waits} na prevzem. `) +
    `${o.sector === 'narocilo' ? 'Naročilo, ki ga' : 'Oblačila, ki jih'} ne boste prevzeli do ${fmt(oddajaOd(o))}, bomo podarili v dobrodelne namene.` + konec;
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
      JSON_POLJA.forEach((k) => { try { o[k] = o[k] ? JSON.parse(o[k]) : []; } catch (e) { o[k] = []; } });
      return { vrstica: i + 2, o };
    })
    .filter((v) => v.o.id);
}

// Vrednosti za zapis v vrstico: storitve kot JSON, vse ostalo kot besedilo.
function vrsticaIz(o) {
  return KLJUCI.map((k) => (JSON_POLJA.includes(k) ? JSON.stringify(o[k] || []) : o[k] == null ? '' : String(o[k])));
}

function preberiStoritve() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_STORITVE);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues()
    .filter((r) => r[0] && r[1])
    .map((r) => ({ group: String(r[0]), name: String(r[1]) }));
}

function listStranke() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_STRANKE);
  if (!sh) throw new Error('Ni lista Stranke – zaženite funkcijo nastavi');
  pripraviStranke_(sh);
  return sh;
}

const telefon_ = (x) => String(x || '').replace(/\D/g, '').replace(/^386/, '0');

/** Naslovi stolpcev lista Stranke → številka stolpca (od 1). */
function glavaStrank_(sh) {
  const glava = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  const stolpec = {};
  POLJA_STRANKE.forEach(([k, naslov]) => { const i = glava.indexOf(naslov); if (i >= 0) stolpec[k] = i + 1; });
  const n = glava.indexOf(STOLPEC_NAROCILA);
  if (n >= 0) stolpec.orders = n + 1;
  return stolpec;
}

/** Enkratna posodobitev lista Stranke: stolpec »Naročila« na začetku, skrit ID, datum »Ustvarjeno«. */
function pripraviStranke_(sh) {
  let stolpec = glavaStrank_(sh);
  if (stolpec.orders && POLJA_STRANKE.every(([k]) => stolpec[k])) return;
  if (!stolpec.orders) {
    sh.insertColumnBefore(1);
    sh.getRange(1, 1).setValue(STOLPEC_NAROCILA).setFontWeight('bold').setBackground('#e5eeea');
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat('@');
  }
  POLJA_STRANKE.forEach(([k, naslov]) => {
    if (glavaStrank_(sh)[k]) return;
    const c = sh.getLastColumn() + 1;
    sh.getRange(1, c).setValue(naslov).setFontWeight('bold').setBackground('#e5eeea');
    sh.getRange(2, c, sh.getMaxRows() - 1, 1).setNumberFormat('@');
  });
  stolpec = glavaStrank_(sh);
  sh.hideColumns(stolpec.id); // ID potrebuje samo aplikacija
  SpreadsheetApp.getActive().setSpreadsheetTimeZone(CASOVNI_PAS);
  // Obstoječi zapisi »Ustvarjeno« (besedilo ISO) → datum in čas.
  const st = stolpec.createdAt;
  if (sh.getLastRow() > 1) {
    const obseg = sh.getRange(2, st, sh.getLastRow() - 1, 1);
    obseg.setValues(obseg.getValues().map(([v]) => [v instanceof Date ? v : v && !isNaN(new Date(v)) ? new Date(v) : v]));
  }
  sh.getRange(2, st, sh.getMaxRows() - 1, 1).setNumberFormat(FORMAT_CASA);
  osveziNarocilaStrank_();
}

function preberiStranke() {
  const sh = listStranke();
  if (sh.getLastRow() < 2) return [];
  const stolpec = glavaStrank_(sh);
  const obseg = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn());
  const prikaz = obseg.getDisplayValues();
  const vrednosti = obseg.getValues();
  return prikaz
    .map((r, i) => {
      const c = {};
      POLJA_STRANKE.forEach(([k]) => { c[k] = r[stolpec[k] - 1]; });
      const ust = vrednosti[i][stolpec.createdAt - 1];
      c.createdAt = ust instanceof Date ? ust.toISOString() : String(ust || '');
      try { c.measures = c.measures ? JSON.parse(c.measures) : null; } catch (e) { c.measures = null; }
      if (!c.measures) delete c.measures;
      return c;
    })
    .filter((c) => c.id);
}

function shraniStranko(vnos) {
  if (!vnos.name || !vnos.phone) throw new Error('Ime in telefon sta obvezna');
  const sh = listStranke();
  const vse = preberiStranke();
  if (vse.some((c) => telefon_(c.phone) === telefon_(vnos.phone) && c.id !== vnos.id)) throw new Error('Stranka s to številko že obstaja');
  const c = {
    id: vnos.id || Utilities.getUuid(),
    name: String(vnos.name), phone: String(vnos.phone), email: String(vnos.email || ''), note: String(vnos.note || ''),
    createdAt: vnos.createdAt || new Date().toISOString(),
  };
  if (vnos.measures) c.measures = vnos.measures;
  const i = vse.findIndex((x) => x.id === c.id);
  const vrstica = i >= 0 ? i + 2 : sh.getLastRow() + 1;
  const stolpec = glavaStrank_(sh);
  POLJA_STRANKE.forEach(([k]) => {
    const celica = sh.getRange(vrstica, stolpec[k]);
    if (k === 'createdAt') celica.setNumberFormat(FORMAT_CASA).setValue(isNaN(new Date(c.createdAt)) ? c.createdAt : new Date(c.createdAt));
    else celica.setNumberFormat('@').setValue(k === 'measures' ? (c.measures ? JSON.stringify(c.measures) : '') : c[k]);
  });
  return c;
}

/** Naslove stolpcev na listu Naročila uskladi s POLJA (npr. po preimenovanju »Datum prevzema« → »Datum oddaje«). */
function uskladiGlavo_(sh) {
  const glava = sh.getRange(1, 1, 1, POLJA.length).getDisplayValues()[0];
  if (POLJA.some((p, i) => glava[i] !== p[1])) sh.getRange(1, 1, 1, POLJA.length).setValues([POLJA.map((p) => p[1])]);
}

/** Izbriše stranko (po ID) in njena zaključena naročila; odprtih naročil ne izbriše. */
function odstraniStranko(sh, id, orderIds) {
  const ids = new Set(orderIds || []);
  const narocila = vsa(sh).filter((v) => ids.has(v.o.id));
  const odprta = narocila.filter((v) => v.o.status === 'sprejeto' || v.o.status === 'gotovo');
  if (odprta.length) throw new Error('Stranka ima odprta naročila: ' + odprta.map((v) => v.o.num).join(', '));
  narocila.map((v) => v.vrstica).sort((a, b) => b - a).forEach((r) => sh.deleteRow(r));
  const st = listStranke();
  if (id && st.getLastRow() > 1) {
    const idji = st.getRange(2, glavaStrank_(st).id, st.getLastRow() - 1, 1).getDisplayValues().map((r) => r[0]);
    const i = idji.indexOf(id);
    if (i >= 0) st.deleteRow(i + 2);
  }
  return { orders: narocila.length };
}

/** V stolpec »Naročila« zapiše številke naročil vsake stranke (po telefonski številki), npr. »P-0001, N-0002«. */
function osveziNarocilaStrank_() {
  const sh = listStranke();
  if (sh.getLastRow() < 2) return;
  const stolpec = glavaStrank_(sh);
  const poTelefonu = {};
  vsa(SpreadsheetApp.getActive().getSheetByName(LIST)).forEach(({ o }) => {
    const t = telefon_(o.phone);
    if (t && o.num) (poTelefonu[t] = poTelefonu[t] || []).push(String(o.num));
  });
  const telefoni = sh.getRange(2, stolpec.phone, sh.getLastRow() - 1, 1).getDisplayValues();
  sh.getRange(2, stolpec.orders, telefoni.length, 1).setNumberFormat('@')
    .setValues(telefoni.map(([t]) => [(poTelefonu[telefon_(t)] || []).sort().join(', ')]));
}

function shraniStoritve(list) {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_STORITVE);
  if (!sh) throw new Error('Ni lista Storitve – zaženite funkcijo nastavi');
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).clearContent();
  const vrstice = list.filter((x) => x.group && x.name).map((x) => [String(x.group), String(x.name)]);
  if (vrstice.length) sh.getRange(2, 1, vrstice.length, 2).setValues(vrstice);
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
  return NASTAVITVE.delovniDnevi.includes(razcleni(s).getDay()) && !jePraznik_(s) && !odsotnosti().includes(s);
}

// Slovenski dela prosti dnevi (enako kot holidaysOf v aplikaciji).
function jePraznik_(s) {
  const y = Number(s.slice(0, 4));
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const dvo = (n) => String(n).padStart(2, '0');
  const veNoc = `${y}-${dvo(Math.floor((h + l - 7 * m + 114) / 31))}-${dvo(((h + l - 7 * m + 114) % 31) + 1)}`;
  const fiksni = ['01-01', '01-02', '02-08', '04-27', '05-01', '05-02', '06-25', '08-15', '10-31', '11-01', '12-25', '12-26'];
  return fiksni.includes(s.slice(5)) || [veNoc, dodajDni(veNoc, 1), dodajDni(veNoc, 49)].includes(s) || NASTAVITVE.prazniki.includes(s);
}

/* ---------- Odsotnosti (dnevi, ko je poslovalnica zaprta) ---------- */

let odsotnostiCache = null;
function odsotnosti() {
  if (odsotnostiCache) return odsotnostiCache;
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_ODSOTNOSTI);
  odsotnostiCache = !sh || sh.getLastRow() < 2 ? []
    : sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().map((r) => r[0]).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  return odsotnostiCache;
}
/* ---------- Zapiski (lastni opomniki v »Uredi danes«) ---------- */

function listZapiskov_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(LIST_ZAPISKI);
  if (!sh) {
    sh = ss.insertSheet(LIST_ZAPISKI);
    sh.getRange(1, 1, 1, POLJA_ZAPISKI.length).setValues([POLJA_ZAPISKI.map((p) => p[1])]).setFontWeight('bold').setBackground('#e5eeea');
    sh.setFrozenRows(1);
    sh.getRange(2, 1, sh.getMaxRows() - 1, POLJA_ZAPISKI.length).setNumberFormat('@');
  }
  return sh;
}

function preberiZapiske() {
  const sh = listZapiskov_();
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, POLJA_ZAPISKI.length).getDisplayValues()
    .map((r) => Object.fromEntries(POLJA_ZAPISKI.map((p, i) => [p[0], r[i]])))
    .filter((n) => n.id);
}

function shraniZapisek(vnos) {
  if (!String(vnos.text || '').trim()) throw new Error('Zapisek je prazen');
  const sh = listZapiskov_();
  const n = { id: vnos.id || Utilities.getUuid(), text: String(vnos.text), date: String(vnos.date || ''), createdAt: vnos.createdAt || new Date().toISOString() };
  const i = preberiZapiske().findIndex((x) => x.id === n.id);
  const obseg = sh.getRange(i >= 0 ? i + 2 : sh.getLastRow() + 1, 1, 1, POLJA_ZAPISKI.length);
  obseg.setNumberFormat('@');
  obseg.setValues([POLJA_ZAPISKI.map((p) => n[p[0]])]);
  return n;
}

function izbrisiZapisek(id) {
  const i = preberiZapiske().findIndex((x) => x.id === id);
  if (i >= 0) listZapiskov_().deleteRow(i + 2);
}

function shraniOdsotnosti(list) {
  const sh = SpreadsheetApp.getActive().getSheetByName(LIST_ODSOTNOSTI);
  if (!sh) throw new Error('Ni lista Odsotnosti – zaženite funkcijo nastavi');
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).clearContent();
  const vrstice = list.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().map((d) => [d]);
  if (vrstice.length) { const r = sh.getRange(2, 1, vrstice.length, 1); r.setNumberFormat('@'); r.setValues(vrstice); }
  odsotnostiCache = null;
}

// Delovni dnevi zamude po roku (do t).
function dniZamude(o, t) {
  let n = 0;
  for (let d = dodajDni(o.deadline, 1); d <= t; d = dodajDni(d, 1)) if (jeDelovniDan(d)) n++;
  return n;
}
function dodajDelovneDni(s, n) {
  let x = s;
  while (n > 0) { x = dodajDni(x, 1); if (jeDelovniDan(x)) n--; }
  return x;
}
function fmt(s) { if (!s) return ''; const d = razcleni(s); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; }
