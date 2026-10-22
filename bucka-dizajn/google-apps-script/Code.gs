/**
 * Bucka Dizajn Pick&Collect – zaledje v Google preglednici.
 *
 * - shranjuje naročila, ki jih zaposleni vnesejo v aplikaciji (list »Naročila«),
 *   tako da vse naprave v poslovalnici vidijo iste podatke
 * - ko je naročilo označeno kot gotovo, stranki z e-pošto samodejno pošlje obvestilo z rokom za prevzem
 * - vsak dan strankam z e-pošto samodejno pošlje opomnik (delovni dan pred rokom), obvestilo o
 *   zamudnini (dan po roku) in opozorilo pred oddajo v zabojnik (po 21 delovnih dneh),
 *   poslovalnici pa povzetek, koga je treba obvestiti po SMS/telefonu in kaj odnesti v zabojnik
 *
 * Namestitev: glej NAVODILA.md.
 */

/* ======================= NASTAVITVE ======================= */

const NASTAVITVE = {
  // Ključ, ki ga vpišete tudi v aplikaciji (Nastavitve → Ključ za dostop). Izberite svojega!
  kljuc: 'SPREMENI-ME',

  imeDelavnice: 'Bucka Dizajn',
  emailDelavnice: 'info@bucka-dizajn.si', // sem pride dnevni povzetek
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
  ['services', 'Storitve'], // nove stolpce dodajajte samo na konec
  ['feeWaived', 'Brez zamudnine'], ['lateFee', 'Zamudnina (€)'],
  ['lateNoticeDate', 'Obvestilo o zamudnini'], ['warnDate', 'Opozorilo pred oddajo'],
  ['items', 'Kosi'], ['measures', 'Mere ob naročilu'],
];
const LIST_STORITVE = 'Storitve';
const LIST_STRANKE = 'Stranke';
const LIST_ODSOTNOSTI = 'Odsotnosti';
const JSON_POLJA = ['services', 'items'];
const POLJA_STRANKE = [['id', 'ID'], ['name', 'Ime in priimek'], ['phone', 'Telefon'], ['email', 'E-pošta'], ['note', 'Opomba'], ['createdAt', 'Ustvarjeno'],
  ['measures', 'Mere']]; // mere so shranjene kot JSON; nove stolpce dodajajte samo na konec
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
  const stranke = ss.getSheetByName(LIST_STRANKE) || ss.insertSheet(LIST_STRANKE);
  stranke.getRange(1, 1, 1, POLJA_STRANKE.length).setValues([POLJA_STRANKE.map((p) => p[1])]).setFontWeight('bold').setBackground('#e5eeea');
  stranke.setFrozenRows(1);
  stranke.getRange(2, 1, stranke.getMaxRows() - 1, POLJA_STRANKE.length).setNumberFormat('@');
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
    if (req.action === 'list') return json({ ok: true, orders: vsa(sh).map((v) => v.o), services: preberiStoritve(), customers: preberiStranke(), absences: odsotnosti() });
    if (req.action === 'importAll') return json(Object.assign({ ok: true }, uvoziVse(sh, req)));
    if (req.action === 'saveAbsences') { shraniOdsotnosti(req.absences || []); return json({ ok: true }); }
    if (req.action === 'saveCustomer') return json({ ok: true, customer: shraniStranko(req.customer || {}) });
    if (req.action === 'saveServices') { shraniStoritve(req.services || []); return json({ ok: true }); }
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
  const tel = (x) => String(x || '').replace(/\D/g, '').replace(/^386/, '0');
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
    opomnik: { polje: 'reminderDate', sporocilo: 'reminder', zadeva: 'Opomnik: rok za prevzem oblačil', ime: 'OPOMNIK' },
    zamudnina: { polje: 'lateNoticeDate', sporocilo: 'late', zadeva: 'Rok za prevzem oblačil je potekel', ime: 'OBVESTILO O ZAMUDNINI' },
    opozorilo: { polje: 'warnDate', sporocilo: 'warning', zadeva: `Oblačila bomo oddali v zabojnik ${NASTAVITVE.zabojnik}`, ime: 'OPOZORILO PRED ODDAJO' },
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
        if (faza === 'opozorilo' && !o.lateNoticeDate && t > o.deadline) o.lateNoticeDate = t;
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
  const zamudninaOd = odprtOdDne(dodajDni(o.deadline, 1));
  const opozoriloOd = najkasnejsi(prejsnjiDelovniDan(oddajaOd(o)), zamudninaOd);
  if (!o.warnDate && t >= opozoriloOd) return 'opozorilo';
  if (t > o.deadline) return o.lateNoticeDate || t < zamudninaOd ? null : 'zamudnina';
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
  const zamudnina = `${evri(NASTAVITVE.zamudninaNaDan)} za vsak delovni dan`;
  // Enako kot message() v aplikaciji: popravila (oblačila) ali naročila (naročilo).
  const W = o.sector === 'narocilo'
    ? { your: `vaše naročilo (št. ${o.num})`, yours: `vašega naročila (št. ${o.num})`, isReady: 'je pripravljeno', them: 'ga', waits: 'še vedno čaka', left: 'Izdelke, ki niso prevzeti', leftLow: 'izdelke, ki niso prevzeti' }
    : { your: `vaša oblačila (št. ${o.num})`, yours: `vaših oblačil (št. ${o.num})`, isReady: 'so pripravljena', them: 'jih', waits: 'še vedno čakajo', left: 'Oblačila, ki niso prevzeta', leftLow: 'oblačila, ki niso prevzeta' };
  if (vrsta === 'ready') {
    return `Pozdravljeni, ${W.your} ${W.isReady} na prevzem. Prevzamete ${W.them} lahko do ${fmt(o.deadline)}. ` +
      `Po tem roku zaračunamo zamudnino ${zamudnina}, ${W.leftLow} v enem mesecu ` +
      `(do ${fmt(oddajaOd(o))}), pa oddamo v zabojnik ${NASTAVITVE.zabojnik}.` + konec;
  }
  if (vrsta === 'reminder') {
    const kdaj = dodajDni(t || danes(), 1) === o.deadline ? `jutri (${fmt(o.deadline)})` : fmt(o.deadline);
    return `Pozdravljeni, opominjamo vas, da je ${kdaj} zadnji dan za prevzem ${W.yours} brez zamudnine. ` +
      `Po tem roku zaračunamo zamudnino ${zamudnina}.` + konec;
  }
  if (vrsta === 'late') {
    return `Pozdravljeni, rok za prevzem ${W.yours} je potekel ${fmt(o.deadline)}. ` +
      `Od ${fmt(odprtOdDne(dodajDni(o.deadline, 1)))} zaračunavamo zamudnino ${zamudnina}. ` +
      `${W.left} do ${fmt(oddajaOd(o))}, oddamo v zabojnik ${NASTAVITVE.zabojnik}.` + konec;
  }
  const dni = dniZamude(o, t || danes());
  return `Pozdravljeni, ${W.your} ${W.waits} na prevzem. Če ${W.them} ne prevzamete do ${fmt(oddajaOd(o))}, ` +
    `${W.them} bomo oddali v zabojnik ${NASTAVITVE.zabojnik}.` +
    (dni && !o.feeWaived ? ` Rok za prevzem je potekel ${fmt(o.deadline)}, zato zaračunavamo zamudnino ${zamudnina}; ` +
      `do danes znaša ${evri(dni * NASTAVITVE.zamudninaNaDan)}.` : '') + konec;
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
  return sh;
}

function preberiStranke() {
  const sh = listStranke();
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, POLJA_STRANKE.length).getDisplayValues()
    .map((r) => {
      const c = Object.fromEntries(POLJA_STRANKE.map((p, i) => [p[0], r[i]]));
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
  const tel = (x) => String(x || '').replace(/\D/g, '').replace(/^386/, '0');
  if (vse.some((c) => tel(c.phone) === tel(vnos.phone) && c.id !== vnos.id)) throw new Error('Stranka s to številko že obstaja');
  const c = {
    id: vnos.id || Utilities.getUuid(),
    name: String(vnos.name), phone: String(vnos.phone), email: String(vnos.email || ''), note: String(vnos.note || ''),
    createdAt: vnos.createdAt || new Date().toISOString(),
  };
  if (vnos.measures) c.measures = vnos.measures;
  const i = vse.findIndex((x) => x.id === c.id);
  const vrstica = i >= 0 ? i + 2 : sh.getLastRow() + 1;
  const obseg = sh.getRange(vrstica, 1, 1, POLJA_STRANKE.length);
  obseg.setNumberFormat('@');
  obseg.setValues([POLJA_STRANKE.map((p) => (p[0] === 'measures' ? (c.measures ? JSON.stringify(c.measures) : '') : c[p[0]]))]);
  return c;
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
  return NASTAVITVE.delovniDnevi.includes(razcleni(s).getDay()) && !NASTAVITVE.prazniki.includes(s) && !odsotnosti().includes(s);
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
