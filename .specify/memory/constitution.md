<!--
Sync Impact Report
Version change: initial template -> 1.0.0
Modified principles: placeholder principles -> project governance principles
Added sections: Ograniczenia techniczne, Proces pracy
Removed sections: none
Follow-up TODOs: none
-->

# Konstytucja projektu Harmonogram POLSTR

## Core Principles

### I. Czysta domena obliczeniowa
Cała logika obliczania harmonogramu MUST znajdować się w `src/domena/` jako czyste
funkcje TypeScript. Kod domenowy MUST NOT zależeć od React, Next.js, I/O, zegara systemowego
ani efektów ubocznych. Route handler i ekran mogą tylko przekazywać dane do domeny i prezentować
wynik.

### II. Testy przed logiką obliczeń
Każda zmiana logiki obliczeń MUST mieć test vitest z konkretną liczbą kontrolną. Testy domeny
i danych MUST mieszkać w `tests/`. Dla nowych reguł obliczeniowych najpierw powstaje test,
potem implementacja, a brak testu dla zmiany obliczeń jest błędem procesu.

### III. Jawne pieniądze i zaokrąglenia
Kwoty MUST być przetwarzane jako grosze albo w innym jawnie opisanym modelu z jednym miejscem
zaokrąglania do grosza. Ostatnia rata MUST wyrównać kapitał tak, aby suma części kapitałowych
była równa kwocie kredytu. Dodatkowe zaokrąglenia tej samej wielkości są niedopuszczalne.

### IV. Cienkie granice aplikacji
`app/api/harmonogram/route.ts` MUST tylko parsować query string, walidować podstawowy kształt
danych, wywoływać funkcje z domeny i zwracać JSON. `app/page.tsx` MUST być komponentem
`'use client'`, używać Tailwind i pobierać dane przez `/api/harmonogram`. Żadna z tych warstw
nie może liczyć harmonogramu.

### V. Prostota i zgodność ze szkieletem
Projekt MUST używać Next.js App Router, TypeScript strict, vitest i Tailwind zgodnie z istniejącym
szkieletem. Nowe zależności są zabronione bez wcześniejszego uzasadnienia i decyzji. Nazwy
domenowe, dokumenty, komentarze i komunikaty commitów piszemy po polsku, bez skrótów w nazwach.

## Ograniczenia techniczne

- Dane wskaźników są w `dane/` i są wczytywane przez `src/dane/wskazniki.ts`.
- Plików w `dane/` nie edytujemy bez wyraźnego polecenia.
- POLSTR 1M zmienia się co miesiąc, WIBOR 3M co kwartał.
- Po ostatnim wpisie serii obowiązuje ostatnia znana wartość.
- MVP używa wartości wskaźnika wprost z danych i nie składa dziennych stawek POLSTR.
- Odsetki są proste w okresie: saldo razy stopa roczna dzielona przez 12.

## Proces pracy

- Pracujemy fazami według `tasks.md`.
- Każda faza implementacji trafia do osobnej gałęzi i osobnego PR.
- Po zakończeniu fazy uruchamiamy `npm test`, `npm run typecheck` i `npm run build`.
- PR powinien przejść review Copilota albo rutynę review z `skrypty/review-pr.ps1`.
- Po zakończeniu fazy agent zatrzymuje się i pokazuje diff zamiast zaczynać kolejną fazę.

## Governance

Konstytucja jest nadrzędna wobec decyzji implementacyjnych dla tego projektu. Zmiana zasad
wymaga aktualizacji tego pliku, wskazania wpływu na istniejące artefakty spec-kit oraz ponownej
walidacji planu i zadań. Zgodność z konstytucją sprawdzamy przy generowaniu planu, tasks.md,
implementacji i review PR.

Wersjonowanie konstytucji używa semver: MAJOR dla zmian niezgodnych, MINOR dla nowych zasad,
PATCH dla doprecyzowań bez zmiany znaczenia.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
