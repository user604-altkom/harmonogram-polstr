# Podsumowanie fazy 5

Data rozpoczęcia: 2026-09-23

Gałąź robocza: `spec-mvp`

## Cel fazy

Faza 5 według `PLAN_DZIALANIA.MD` oznacza walidację końcową MVP:

- uruchomienie `npm test`, `npm run typecheck` i `npm run build`,
- sprawdzenie liczby kontrolnej,
- sprawdzenie API,
- sprawdzenie ekranu i eksportu CSV,
- ocena gotowości do PR, Vercel i tagu `v0.1.0`.

Na tym etapie faza została rozpoczęta jako walidacja stanu bieżącego. Pierwsza walidacja wykryła
bloker w API, który został następnie poprawiony przez przekazanie serii wskaźnika z warstwy danych
do domeny.

## Walidacja techniczna

Uruchomione komendy:

```powershell
npm test
npm run typecheck
npm run build
```

Wynik:

- `npm test`: OK, 1 plik testów, 10/10 testów zaliczonych,
- `npm run typecheck`: OK, brak błędów TypeScript,
- `npm run build`: OK, build Next.js zakończony powodzeniem.

Ostrzeżenia:

- pojawia się ostrzeżenie Vite dotyczące przyszłego `configLoader: 'native'`, bez wpływu na wynik testów.

## Sprawdzenie API na liczbie kontrolnej

Sprawdzony endpoint:

```text
http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

Wynik:

```json
{
  "blad": "brak serii wskaźnika"
}
```

Status HTTP:

```text
400 Bad Request
```

## Poprawka po wykryciu blokera

Zmieniono `app/api/harmonogram/route.ts`:

- dodano import `seriaWskaznika` z `src/dane/wskazniki.ts`,
- podczas parsowania poprawnych parametrów API dodano `seria: seriaWskaznika(wskaznik)`,
- route handler nadal pozostaje cienki: pobiera dane, przekazuje je do domeny i zwraca JSON.

Ponowne sprawdzenie endpointu:

```text
http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

Wynik po poprawce:

- status HTTP: `200 OK`,
- liczba rat: 300,
- pierwsza rata: 2 495,85 zł,
- ostatnia rata: 2 497,75 zł,
- suma odsetek: 348 756,90 zł,
- błąd: brak.

Wartości różnią się od liczby kontrolnej z testu domenowego, ponieważ API używa danych z pliku
`dane/polstr-1m.json`, a liczba kontrolna z `BRIEF.md` wymaga stałej serii 3,55% podanej wprost
w teście.

Dodatkowo sprawdzono endpointy dla rat malejących i nadpłaty `skrocOkres`:

- raty malejące: status `200 OK`, 3 raty, pierwsza rata 40 415,00 zł, ostatnia rata 40 130,00 zł,
- nadpłata `skrocOkres`: status `200 OK`, 270 rat, pierwsza rata 2 495,85 zł, ostatnia rata 1 500,02 zł.

## Wniosek z walidacji

Podstawowa walidacja techniczna przechodzi, a poprzedni bloker API `brak serii wskaźnika` został
usunięty.

Pozostałe ograniczenia po aktualnych poprawkach:

- tag `v0.1.0` i PR nadal wymagają osobnego polecenia,
- pełna weryfikacja wizualna ekranu w przeglądarce pozostaje krokiem ręcznym użytkownika.

## Status kryteriów fazy 5

- `npm test`: spełnione.
- `npm run typecheck`: spełnione.
- `npm run build`: spełnione.
- Liczba kontrolna przez domenę: spełniona w testach fazy 3.
- Liczba kontrolna przez API: częściowo spełniona, endpoint zwraca 200 i harmonogram z danych plikowych POLSTR.
- Ekran pozwala wysłać zapytanie do API: spełnione.
- Ekran pokazuje pełny wynik z API: spełnione dla rat równych, rat malejących i nadpłat obsługiwanych przez API.
- Eksport CSV: zaimplementowany w frontendzie, działa po uzyskaniu wyniku z API.
- Gotowość do tagu `v0.1.0`: technicznie blisko, ale tag nie został utworzony bez osobnego polecenia.

## Rekomendowany następny krok

Domknięto pozostałe historie MVP w kodzie:

1. Raty malejące.
2. Zmienne wskaźniki z testami brzegowymi.
3. Nadpłaty w trybie obniżenia raty i skrócenia okresu.
4. Parsowanie i przekazywanie nadpłat z API do domeny.
5. Pełną walidację fazy 5.

## Stan fazy

Faza 5 została rozpoczęta, a wykryty bloker API został poprawiony. Pozostałe historie domenowe
zostały domknięte w kodzie i testach. Nie utworzono tagu `v0.1.0`, commita ani PR-a.

Nie wykonano commita ani PR-a.