# Plan działania

## Cel

Budujemy aplikację webową kalkulatora harmonogramu spłat kredytu hipotecznego dla wskaźników POLSTR 1M i WIBOR 3M. Pracujemy metodyką spec-kit, implementujemy fazami, a projekt ekranu przygotowujemy równolegle w Claude Design.

## Zasady prowadzące

- Logika obliczeń mieszka w `src/domena/` i pozostaje czysta: bez React, bez I/O, bez `Date.now()`.
- Dane wskaźników są wczytywane przez `src/dane/wskazniki.ts` z plików w `dane/`.
- Route handler `app/api/harmonogram/route.ts` jest cienki: parsuje query string, woła domenę i zwraca JSON.
- Frontend w `app/page.tsx` jest komponentem `'use client'` z Tailwind, bez bibliotek UI.
- Testy piszemy w vitest, w katalogu `tests/`, tylko dla domeny i danych.
- Każda zmiana logiki obliczeń ma test z konkretną liczbą kontrolną.
- Nie dodajemy zależności bez uzasadnienia i decyzji.
- Komentarze, dokumenty, nazwy domenowe i komunikaty commitów piszemy po polsku.

## Faza 0: sprawdzenie startowe

Sprawdzamy, czy szkielet projektu działa lokalnie i jest wypchnięty do GitHuba.

Komendy:

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Oczekiwany stan:

- testy i typecheck przechodzą,
- build produkcyjny przechodzi,
- aplikacja działa lokalnie na `http://localhost:3000`,
- repo jest wypchnięte do GitHuba,
- Vercel ma pierwszy deploy szkieletu albo mamy świadomą decyzję, że do czasu MVP pracujemy lokalnie.

## Faza 1: artefakty spec-kit

Tworzymy gałąź na artefakty:

```powershell
git switch -c spec-mvp
```

Kolejność skilli:

1. `/speckit-constitution`
2. `/speckit-specify`
3. `/speckit-clarify`, tylko jeśli specyfikacja zostawi istotne pytania
4. `/speckit-plan`
5. `/speckit-analyze`, opcjonalnie do sprawdzenia spójności specyfikacji, planu i zadań
6. `/speckit-tasks`

Prompt do `/speckit-constitution`:

```text
Zasady projektu: Next.js App Router, domena w src/domena/ w czystym TypeScript bez React i bez I/O, TypeScript strict, testy vitest tylko dla domeny i danych, TDD: najpierw test, potem kod, Tailwind do stylów, brak nowych zależności bez uzasadnienia w PR, kwoty w groszach jako liczby całkowite albo jedna jawna decyzja o miejscu zaokrąglania, dokumenty i komunikaty commitów po polsku.
```

Prompt do `/speckit-specify`:

```text
Na podstawie BRIEF.md przygotuj specyfikację MVP kalkulatora harmonogramu spłat kredytu hipotecznego na POLSTR 1M i WIBOR 3M.

Uwzględnij wejście: kwota kredytu, liczba rat, data pierwszej raty, marża banku w punktach procentowych, typ rat równe/malejące, wskaźnik POLSTR 1M/WIBOR 3M, lista nadpłat: miesiąc, kwota, tryb obniż ratę albo skróć okres.

Uwzględnij wyjście: GET /api/harmonogram zwraca JSON z tabelą rat: numer, data, część kapitałowa, część odsetkowa, rata, saldo po spłacie oraz suma odsetek za cały okres.

Uwzględnij ekran www: formularz parametrów, przycisk Policz, rata pierwsza i ostatnia, suma odsetek, tabela rat, eksport CSV po stronie przeglądarki.

Liczba kontrolna z BRIEF.md jest kryterium akceptacji: 400 000 zł, 300 rat równych, POLSTR 1M 3,55% + marża 2,11 pp = 5,66% rocznie, rata równa około 2 494,72 zł, ostatnia rata wyrównująca około 2 492,53 zł.

Ekran www jest ostatnią historią użytkownika; wygląd dostarczymy jako gotowy komponent React z Claude Design.
```

Prompt do `/speckit-plan`:

```text
Stos: Next.js App Router, TypeScript strict, vitest, Tailwind, bez nowych zależności.

Architektura:
- src/domena/harmonogram.ts: czyste funkcje obliczeniowe, bez React, bez I/O, bez Date.now().
- src/dane/wskazniki.ts: serie wskaźników importowane z dane/*.json.
- app/api/harmonogram/route.ts: cienki route handler, tylko parsuje query string, woła domenę i zwraca JSON.
- app/page.tsx: komponent use client z Tailwind, pobiera dane z /api/harmonogram.
- tests/: testy vitest tylko domeny i danych.

Wymagania obliczeń:
- oprocentowanie okresu = wskaźnik + marża,
- POLSTR 1M zmienia się co miesiąc,
- WIBOR 3M co kwartał,
- po ostatnim wpisie obowiązuje ostatnia znana wartość,
- kwoty zaokrąglane do grosza w jednym miejscu,
- ostatnia rata wyrównuje kapitał,
- odsetki proste: saldo * stopa roczna / 12.
```

Prompt do `/speckit-tasks`:

```text
Wygeneruj zadania fazami. Faza Setup ma być pusta albo minimalna, bo szkielet już istnieje.

Pierwsza historia: obliczenie harmonogramu rat równych przy stałej stopie, z testem na liczbie kontrolnej z BRIEF.md.

Kolejne historie: raty malejące, zmiana wskaźnika w czasie, nadpłaty w trybach obniż ratę i skróć okres, route handler API, ekran app/page.tsx podłączony do API i eksport CSV.

Każda zmiana logiki obliczeń ma test z konkretną liczbą kontrolną. Ostatnia historia to frontend dostarczony z Claude Design i podłączony do route handlera.
```

Po wygenerowaniu artefaktów tworzymy PR:

```powershell
git add -A
git commit -m "spec: konstytucja, specyfikacja, plan, zadania"
git push -u origin spec-mvp
gh pr create --fill --reviewer "@copilot"
```

Po review:

```powershell
gh pr view --web
gh pr merge --squash --delete-branch
git switch main
git pull
```

## Faza 2: role agentów i narzędzi

Główny agent Copilot:

- wykonuje skille spec-kit,
- implementuje zadania z `tasks.md`,
- pilnuje TDD,
- uruchamia `npm test`, `npm run typecheck` i `npm run build`,
- przygotowuje PR-y i reaguje na review.

Agent `Explore`:

- działa tylko read-only,
- służy do szybkiego znalezienia wzorców w repo,
- używamy go wtedy, gdy trzeba rozpoznać istniejący kod przed zmianą.

Claude Design:

- projektuje ekran i eksportuje go jako `Export HTML` / `Project Archive`,
- nie dodaje bibliotek UI,
- archiwum traktujemy jako źródło projektu frontendu, nie jako osobną aplikację do wdrożenia,
- Copilot przenosi właściwy widok, style i logikę interakcji do `app/page.tsx`,
- po przeniesieniu Copilot podłącza ekran do API i poprawia typy.

Copilot Review:

- recenzuje każdy PR,
- stosuje reguły z `.github/instructions/review.instructions.md`,
- szczególnie pilnuje testów z liczbami kontrolnymi, zaokrągleń, braku `any`, czystości domeny i cienkiego route handlera.

Vercel:

- buduje produkcję z gałęzi `main`,
- tworzy preview dla PR,
- służy do końcowej weryfikacji MVP.

## Faza 3: implementacja fazami

Każda faza dostaje osobną gałąź i PR. Przykład:

```powershell
git switch -c faza-3-rowne-raty
```

Polecenie dla agenta:

```text
/speckit-implement Wykonaj tylko wskazaną fazę z tasks.md, zatrzymaj się i pokaż diff.
```

Po każdej fazie:

```powershell
npm test
npm run typecheck
npm run build
git add -A
git commit -m "faza 3: raty równe przy stałej stopie z testem"
git push -u origin faza-3-rowne-raty
gh pr create --fill --reviewer "@copilot"
```

Proponowana kolejność merytoryczna:

1. Domena podstawowa: typy wejścia i wyjścia, kwoty w groszach, rata równa przy stałej stopie, test liczby kontrolnej.
2. Raty malejące: test części kapitałowej i kontroli sumy kapitału.
3. Zmienne wskaźniki: POLSTR miesięcznie, WIBOR kwartalnie, ostatnia znana wartość, test zmiany stopy.
4. Nadpłaty: tryb obniż ratę i tryb skróć okres, z testami obu zachowań.
5. API: `app/api/harmonogram/route.ts`, parsowanie parametrów, walidacja podstawowa, JSON zgodny z kontraktem.
6. Frontend: `app/page.tsx`, formularz, fetch do API, podsumowanie, tabela, eksport CSV.
7. Final polish: formatowanie kwot, obsługa błędów, testy, typecheck, build i tag `v0.1.0`.

## Faza 4: tor równoległy Claude Design

Gdy Copilot implementuje domenę, przygotowujemy ekran w Claude Design. Efektem tej fazy ma być
eksport `Export HTML` / `Project Archive`, a nie ręcznie wklejony komponent. Archiwum służy jako
materiał źródłowy do przeniesienia frontendu do istniejącej aplikacji Next.js.

Prompt startowy:

```text
Projekt frontendu do eksportu jako Export HTML / Project Archive: ekran kalkulatora harmonogramu spłat kredytu hipotecznego dla doradcy w oddziale banku. Formularz: kwota kredytu (PLN), liczba rat, data pierwszej raty, marża (pp), wskaźnik (POLSTR 1M albo WIBOR 3M), typ rat (równe albo malejące), lista nadpłat (miesiąc, kwota, tryb: obniż ratę albo skróć okres), przycisk „Policz”. Ekran ma zakładać pobieranie danych z GET /api/harmonogram z parametrami formularza w query string i wyświetlać rata pierwsza, rata ostatnia, suma odsetek, tabela rat: nr, data, kapitał, odsetki, rata, saldo. Dodaj przycisk „Eksport CSV”, który buduje plik w przeglądarce. Kwoty z separatorem tysięcy i dwoma miejscami po przecinku. Styl prosty, czytelny, profesjonalny, dla pracy doradcy w oddziale banku. Bez logotypów, bez bibliotek UI. Projekt ma być łatwy do przeniesienia do jednego komponentu Next.js `app/page.tsx`.
```

Prompt na poprawkę po pierwszej wersji:

```text
Uczyń ekran bardziej ergonomiczny dla długiej tabeli: zwarte pola formularza, czytelne podsumowanie nad tabelą, responsywna tabela i lepsze stany ładowania oraz błędu. Nadal bez bibliotek UI, z kodem łatwym do przeniesienia do komponentu Next.js `app/page.tsx`.
```

Kroki po zakończeniu pracy w Claude Design:

1. W Claude Design wybierz `Export HTML`.
2. Pobierz `Project Archive`.
3. Rozpakuj archiwum roboczo poza kodem aplikacji albo w katalogu tymczasowym, którego nie commitujemy.
4. Obejrzyj strukturę archiwum: HTML, komponenty, style i ewentualne dane przykładowe.
5. Nie instaluj zależności z archiwum i nie przenoś go jako osobnej aplikacji.
6. Przenieś tylko potrzebny widok, klasy Tailwind, stan formularza, obsługę fetch i eksport CSV do `app/page.tsx`.
7. Dodaj dyrektywę `'use client'` jako pierwszą linię `app/page.tsx`.
8. Usuń albo zastąp dane przykładowe z archiwum wywołaniem `/api/harmonogram`.

Zadanie dla Copilota po rozpakowaniu archiwum:

```text
Na podstawie eksportu Claude Design `Export HTML` / `Project Archive` przenieś frontend do app/page.tsx jako komponent `'use client'`, zachowaj wygląd, nie dodawaj zależności, nie przenoś archiwum jako osobnej aplikacji i podłącz ekran do route handlera /api/harmonogram.
```

## Faza 5: walidacja końcowa MVP

Przed zgłoszeniem gotowości uruchamiamy:

```powershell
npm test
npm run typecheck
npm run build
```

Sprawdzamy ręcznie:

- liczba kontrolna daje ratę około `2 494,72 zł`,
- ostatnia rata wyrównuje kapitał,
- suma części kapitałowych równa się kwocie kredytu,
- API zwraca pełny harmonogram i sumę odsetek,
- ekran pozwala policzyć harmonogram,
- eksport CSV działa po stronie przeglądarki,
- PR po review jest scalony do `main`,
- Vercel pokazuje działającą aplikację.

Po MVP tagujemy wersję:

```powershell
git tag v0.1.0
git push --tags
```

## Definicja gotowości

MVP jest gotowe, gdy:

- artefakty spec-kit są w repo,
- zadania z MVP są wykonane i oznaczone w `tasks.md`,
- domena ma testy dla wymaganych przypadków,
- route handler nie zawiera logiki obliczeń,
- frontend jest podłączony do API,
- `npm test`, `npm run typecheck` i `npm run build` przechodzą,
- aplikacja działa na produkcji Vercel,
- repo ma tag `v0.1.0`.