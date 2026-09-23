# Data Model: Kalkulator harmonogramu POLSTR/WIBOR

## ParametryHarmonogramu

- `kwotaKredytu`: kwota kredytu w groszach, liczba całkowita większa od zera.
- `liczbaRat`: liczba rat, liczba całkowita większa od zera.
- `dataPierwszejRaty`: data w formacie `YYYY-MM-DD`.
- `marza`: marża roczna jako ułamek, np. 0,0211 dla 2,11 pp.
- `typRat`: `rowne` albo `malejace`.
- `wskaznik`: `POLSTR_1M` albo `WIBOR_3M`.
- `nadplaty`: lista nadpłat.

## WartoscWskaznika

- `od`: data początku obowiązywania wartości w formacie `YYYY-MM-DD`.
- `stopa`: roczna stopa jako ułamek, np. 0,0355.

Reguły:

- Dla daty raty obowiązuje ostatnia wartość, której `od` jest mniejsze lub równe dacie raty.
- Po ostatnim wpisie obowiązuje ostatnia znana wartość.
- POLSTR 1M zmienia się co miesiąc w dniu raty.
- WIBOR 3M zmienia się co kwartał.

## Nadplata

- `miesiac`: numer miesiąca albo raty, po której stosowana jest nadpłata; liczba całkowita większa od zera.
- `kwota`: kwota nadpłaty w groszach, liczba całkowita większa od zera.
- `tryb`: `obnizRate` albo `skrocOkres`.

Reguły:

- Nadpłata zmniejsza saldo kapitału.
- Nadpłata nie może obniżyć salda poniżej zera.
- Tryb `obnizRate` przelicza dalszą ratę przy zachowaniu pozostałej liczby rat.
- Tryb `skrocOkres` utrzymuje logikę raty bazowej i kończy harmonogram wcześniej, gdy saldo spadnie do zera.

## RataHarmonogramu

- `numer`: numer raty od 1.
- `data`: data raty w formacie `YYYY-MM-DD`.
- `czescKapitalowa`: część kapitałowa w groszach.
- `czescOdsetkowa`: część odsetkowa w groszach.
- `rata`: suma części kapitałowej i odsetkowej w groszach.
- `saldoPoSplacie`: saldo po spłacie w groszach.

## WynikHarmonogramu

- `raty`: lista `RataHarmonogramu`.
- `sumaOdsetek`: suma części odsetkowych w groszach.

## Relacje

- `ParametryHarmonogramu` wybierają jedną serię `WartoscWskaznika`.
- `ParametryHarmonogramu` mają zero lub więcej `Nadplata`.
- `WynikHarmonogramu` składa się z wielu `RataHarmonogramu`.