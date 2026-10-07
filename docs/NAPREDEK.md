# Napredek projekta Zdravje+

Zadnja posodobitev: 7. 10. 2026 · različica aplikacije **1.0.0 (build 1)**

## Narejeno

- **Študijski način:** Pomodoro z ritmom 25/5, 45/15, 50/10 in samodejnim odmorom, števec intervalov,
  vaje za vratno in ledveno hrbtenico, vodeno dihanje (4-7-8, škatlasto), kalkulator spanca
  z večernim opomnikom.
- **Vitalni način:** klic svojcem (do 4 stiki) in 112 s potrditvijo, zdravila (okno ±1 ura,
  zgodovina 30 dni), voda, opomnik za gibanje vsaki 2 uri.
- **Obvestila:** `@capacitor/local-notifications` (tudi pri zaprti aplikaciji).
- **Priprava na objavo:** odstranjeni testni gumbi in okvir z napakami, zaslon
  »O aplikaciji in zasebnost« (zdravstvena izjava, zasebnost, brisanje podatkov), ikona in začetni
  zaslon, `docs/zasebnost.html`, `ITSAppUsesNonExemptEncryption = false`, Android targetSdk 36.
- **iOS na Macu:** projekt se zgradi, podpisovanje v Xcodu deluje (geslo za obesek za ključe vpisano).

## Odločitve

- **Apple Developer Program:** plačilo članstva je zaenkrat odloženo. Do takrat je možno brezplačno
  preizkušanje na lastnem iPhonu (osebna ekipa, iPhone priključen s kablom, namestitev velja 7 dni).
- **Politika zasebnosti:** po včlanitvi bo `docs/zasebnost.html` objavljena na **GitHub Pages** in
  **Google Sites**. V App Store Connect se vpiše ena povezava; ob spremembah je treba posodobiti obe strani.

## Naslednji koraki (TestFlight)

1. Apple Developer Program – plačljivo članstvo (če še ni urejeno); v Xcodu izbrati ekipo brez
   pripisa »Personal Team«.
2. App Store Connect → nova aplikacija (`si.zdravjeplus.app`, ime »Zdravje+«, jezik slovenščina).
3. Xcode: »Any iOS Device (arm64)« → Product → Archive → Distribute App → TestFlight & App Store.
4. TestFlight: notranja skupina (do 100), nato zunanja skupina + Test Information + Beta App Review.
5. V `docs/zasebnost.html` vpisati ime in e-naslov za stik ter stran objaviti javno
   (GitHub Pages ali Google Sites) – povezava je potrebna za zunanje preizkuševalce.

## Kasneje

- Google Play: notranje / zaprto testiranje (nov osebni račun: 12 preizkuševalcev, 14 dni),
  izjava »Health apps« in »Data safety«.
- Ideje: pravilo 20-20-20 za oči, tedenski pregled, dnevno počutje, zavihki na študijskem zaslonu.

## Pred vsakim nalaganjem nove gradnje

Povečati build (Xcode → App → General → Build; Android `versionCode`) in posodobiti napis
»Različica« na dnu začetnega zaslona v `www/index.html`.
