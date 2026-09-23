# Contract: GET /api/harmonogram

## Endpoint

`GET /api/harmonogram`

## Query string

Wymagane parametry:

- `kwota`: kwota kredytu w złotych, np. `400000`.
- `liczbaRat`: liczba rat, np. `300`.
- `pierwszaRata`: data pierwszej raty `YYYY-MM-DD`.
- `marza`: marża w punktach procentowych, np. `2.11`.
- `wskaznik`: `POLSTR_1M` albo `WIBOR_3M`.
- `typRat`: `rowne` albo `malejace`.

Opcjonalne parametry:

- `nadplaty`: zakodowany JSON albo stabilny format tekstowy ustalony w implementacji ekranu;
  każda nadpłata zawiera miesiąc, kwotę w złotych i tryb `obnizRate` albo `skrocOkres`.

## Odpowiedź 200

```json
{
  "raty": [
    {
      "numer": 1,
      "data": "2026-09-30",
      "czescKapitalowa": 60858,
      "czescOdsetkowa": 188667,
      "rata": 249525,
      "saldoPoSplacie": 39939142
    }
  ],
  "sumaOdsetek": 34841600
}
```

Kwoty w JSON są w groszach jako liczby całkowite. Frontend odpowiada za formatowanie do złotych.

## Odpowiedź błędu

```json
{
  "error": "Nieprawidłowe parametry harmonogramu"
}
```

Dla błędów walidacji endpoint zwraca status 400. Route handler nie liczy harmonogramu samodzielnie.