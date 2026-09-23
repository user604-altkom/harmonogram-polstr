# Quickstart: walidacja MVP

## Wymagania

- Node.js 22-26
- Zainstalowane zależności npm
- Repozytorium na gałęzi implementowanej fazy

## Walidacja lokalna

```powershell
npm install
npm test
npm run typecheck
npm run build
```

Wszystkie komendy muszą przejść przed zgłoszeniem gotowości fazy.

## Scenariusz liczby kontrolnej

Dane:

- kwota kredytu: 400 000 zł,
- liczba rat: 300,
- typ rat: równe,
- stopa wskaźnika: 3,55%,
- marża: 2,11 pp,
- stopa roczna: 5,66%,
- konwencja odsetek: saldo razy stopa roczna dzielona przez 12.

Oczekiwane wyniki:

- pierwsza rata: około 2 494,72 zł,
- ostatnia rata wyrównująca: około 2 492,53 zł,
- suma części kapitałowych: 400 000 zł.

## Scenariusz API

Po uruchomieniu aplikacji:

```powershell
npm run dev
```

Wywołanie `GET /api/harmonogram` z poprawnymi parametrami powinno zwrócić JSON z listą rat
i `sumaOdsetek`. Niepoprawne parametry powinny zwrócić status 400 z polem `error`.

## Scenariusz ekranu

Na `http://localhost:3000` użytkownik powinien:

1. Wypełnić formularz parametrów.
2. Kliknąć Policz.
3. Zobaczyć pierwszą ratę, ostatnią ratę, sumę odsetek i tabelę rat.
4. Pobrać CSV po stronie przeglądarki.