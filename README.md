# Zdravje+

Mobilna zdravstvena aplikacija za študente in starejše, zgrajena s [Capacitor](https://capacitorjs.com/).

- **Študijski način** – Pomodoro z izbiro ritma (25/5, 45/15, 50/10 min), samodejnim odštevanjem odmora,
  piskom in navodilom za odmor ter števcem današnjih intervalov.
- **Študijski način** ima tudi vodene vaje za vratno in ledveno hrbtenico, vodeno dihanje (4-7-8 in
  škatlasto) ter kalkulator spanca po 90-minutnih ciklih z neobveznim večernim opomnikom.
- **Vitalni način** – velik tekst in visok kontrast; opomnik za zdravila (vsakodnevna obvestila ob izbranih
  urah, oznaka »Vzel/a sem« v oknu ±1 ura, zgodovina zadnjih 30 dni), števec popite vode in opomnik za
  gibanje vsaki 2 uri.
- **Sistemska obvestila** (`@capacitor/local-notifications`) – konec intervala učenja, opomnik za gibanje
  in zdravila se prikažejo tudi, ko je aplikacija v ozadju ali zaprta.

Celotna spletna aplikacija je v eni datoteki: [`www/index.html`](www/index.html).
Poleg nje je v `www/` še `capacitor.js` – knjižnica `@capacitor/core`, ki jo `npm install` samodejno
skopira iz `node_modules` (potrebna je, da aplikacija na telefonu doseže vtičnike).

## Zahteve

- Node.js 22 ali novejši (`node -v`; starejše različice Capacitor 8 ne podpira)
- **Android:** Android Studio (z Android SDK)
- **iOS:** macOS z Xcode in posodobljenim simulatorjem/iOS (na zastarelem simulatorju iOS 17.0
  aplikacija ni sprejemala dotikov)

## Zagon

```bash
npm install          # namesti Capacitor in vtičnike
npm run android      # kopira www/ v Android projekt in odpre Android Studio
npm run ios          # kopira www/ v iOS projekt in odpre Xcode (samo macOS)
```

V Android Studiu ali Xcodu izberite napravo ali emulator in pritisnite **Run**.

Po vsaki spremembi `www/index.html` zaženite `npm run sync` (ali `npm run android` / `npm run ios`),
da se nova različica kopira v mobilna projekta.

V navadnem brskalniku lahko `www/index.html` odprete neposredno – vse deluje, le sistemskih obvestil ni
(namesto njih se predvaja pisk in prikaže sporočilo v aplikaciji).

## Obvestila

- Ob prvem zagonu časovnika aplikacija vpraša za dovoljenje za obvestila.
- **Android 14+:** dovoljenje »Alarmi in opomniki« je privzeto izklopljeno. Aplikacija zanj ne sprašuje
  (vtičnik bi sicer ob vsakem zagonu časovnika odprl sistemske nastavitve), zato lahko sistem obvestilo
  zamakne za nekaj minut. Za točna obvestila ga vklopite ročno: Nastavitve → Aplikacije → Zdravje+ →
  Alarmi in opomniki.
- Pisk v aplikaciji deluje le, ko je aplikacija odprta; sistemsko obvestilo uporablja privzeti zvok telefona.

## Struktura

| Pot | Opis |
| --- | --- |
| `www/index.html` | Celotna spletna aplikacija (HTML, CSS, JS) |
| `capacitor.config.json` | Nastavitve Capacitorja (ID aplikacije `si.zdravjeplus.app`) |
| `android/` | Android projekt (Android Studio) |
| `ios/` | iOS projekt (Xcode) |
