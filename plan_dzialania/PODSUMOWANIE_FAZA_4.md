# Podsumowanie fazy 4

Data wykonania: 2026-09-23

Gałąź robocza: `spec-mvp`

## Cel fazy

Faza 4 obejmowała obsłużenie eksportu z Claude Design przygotowanego jako `Export HTML` / `Project Archive` oraz przeniesienie projektu frontendu do istniejącej aplikacji Next.js.

## Archiwum Claude Design

Znaleziono archiwum:

- `Kalkulator harmonogramu spłat.zip`

Archiwum rozpakowano roboczo do katalogu:

- `.work/claude-design-faza-4`

Katalog `.work/` jest ignorowany przez git, więc rozpakowane pliki eksportu nie powinny trafić do commita.

W rozpakowanym projekcie znaleziono między innymi:

- `Kalkulator harmonogramu v2.dc.html`,
- `Kalkulator harmonogramu.dc.html`,
- `support.js`,
- `_ds/nocturne-.../styles.css`.

Jako źródło aktualnego wariantu ekranu przyjęto `Kalkulator harmonogramu v2.dc.html`.

## Przeniesienie frontendu

Zmieniono `app/page.tsx`.

Przeniesiono z eksportu Claude Design główne elementy interfejsu:

- ciemny układ aplikacyjny,
- nagłówek kalkulatora,
- formularz parametrów kredytu,
- wybór wskaźnika POLSTR 1M albo WIBOR 3M,
- wybór typu rat: równe albo malejące,
- listę nadpłat z możliwością dodawania i usuwania pozycji,
- panel wyniku z ratą pierwszą, ratą ostatnią i sumą odsetek,
- tabelę rat,
- przełącznik widoku miesięcznego i rocznego,
- komunikaty błędów,
- podgląd zapytania `GET`,
- eksport CSV po stronie przeglądarki.

Nie przenoszono runtime Claude Design ani archiwum jako osobnej aplikacji. Frontend został odtworzony jako komponent Next.js w `app/page.tsx` z dyrektywą `'use client'`.

## Podłączenie API

Komponent buduje zapytanie do:

```text
/api/harmonogram
```

Używane parametry query string:

- `kwota`,
- `liczbaRat`,
- `marza`,
- `wskaznik`,
- `typRat`,
- `pierwszaRata`,
- opcjonalnie `nadplaty` jako JSON.

Komponent oczekuje odpowiedzi JSON z polami:

- `raty`,
- `sumaOdsetek`.

Kwoty w odpowiedzi są traktowane jako grosze i formatowane do złotych w interfejsie.

## Eksport CSV

Dodano eksport CSV po stronie przeglądarki.

Plik zawiera kolumny:

- `Nr`,
- `Data`,
- `Kapitał`,
- `Odsetki`,
- `Rata`,
- `Saldo`.

CSV jest generowany z prefiksem BOM i separatorem `;`, aby poprawnie otwierał się w polskim Excelu.

## Walidacja

Uruchomione komendy:

```powershell
npm test
npm run typecheck
npm run build
```

Wynik:

- `npm test`: OK, 5/5 testów,
- `npm run typecheck`: OK,
- `npm run build`: OK.

Wystąpiło jedynie ostrzeżenie Vite dotyczące konfiguracji `configLoader: 'native'`, bez wpływu na wynik.

## Uwagi

Aktualny frontend jest podłączony do route handlera, ale pełna użyteczność wyniku zależy od kolejnych faz domeny i API. Obecny route handler może jeszcze zwracać błąd dla części parametrów, dopóki nie zostaną domknięte fazy zmiennych wskaźników, nadpłat i adaptera API.

Nie wykonano commita ani PR-a.

## Następny krok

Kontynuować implementację kolejnych historii z `specs/001-harmonogram-polstr/tasks.md`, w szczególności rat malejących, zmiennych wskaźników, nadpłat oraz pełnego adaptera API.