# Tasks: Kalkulator harmonogramu POLSTR/WIBOR

**Input**: Design documents from `/specs/001-harmonogram-polstr/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Testy są wymagane dla domeny i danych, zgodnie z BRIEF.md i konstytucją.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Szkielet projektu już istnieje; ta faza tylko potwierdza gotowość repo.

- [X] T001 Uruchom `npm install`, `npm test`, `npm run typecheck` i `npm run build` z katalogu repozytorium

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Typy i kontrakty domenowe wymagane przez wszystkie historie.

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Zdefiniuj typy domenowe parametrów, rat, nadpłat, serii wskaźnika i wyniku w `src/domena/harmonogram.ts`
- [X] T003 [P] Zweryfikuj eksport serii POLSTR 1M i WIBOR 3M w `src/dane/wskazniki.ts` bez edycji plików `dane/*.json`
- [X] T004 Utwórz pomocnicze funkcje konwersji kwot i zaokrąglania do grosza w `src/domena/harmonogram.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Raty równe przy stałej stopie (Priority: P1) MVP

**Goal**: Policzyć harmonogram rat równych i przejść liczbę kontrolną z BRIEF.md.

**Independent Test**: Dla 400 000 zł, 300 rat i stopy 5,66% pierwsza rata wynosi około 2 494,72 zł, a suma kapitału 400 000 zł.

### Tests for User Story 1

- [X] T005 [P] [US1] Dodaj test liczby kontrolnej rat równych przy stałej stopie w `tests/smoke.test.ts`
- [X] T006 [P] [US1] Dodaj test sumy części kapitałowych po zaokrągleniach w `tests/smoke.test.ts`

### Implementation for User Story 1

- [X] T007 [US1] Zaimplementuj harmonogram rat równych dla stałej stopy w `src/domena/harmonogram.ts`
- [X] T008 [US1] Zaimplementuj wyrównanie ostatniej raty do salda zero w `src/domena/harmonogram.ts`
- [X] T009 [US1] Uruchom `npm test` i popraw tylko błędy związane z US1

**Checkpoint**: Raty równe działają niezależnie od API i frontendu.

---

## Phase 4: User Story 2 - Raty malejące (Priority: P2)

**Goal**: Policzyć harmonogram rat malejących.

**Independent Test**: Część kapitałowa jest stała poza ostatnim wyrównaniem, a saldo spada do zera.

### Tests for User Story 2

- [X] T010 [P] [US2] Dodaj test rat malejących w `tests/harmonogram.test.ts`

### Implementation for User Story 2

- [X] T011 [US2] Zaimplementuj typ rat `malejace` w `src/domena/harmonogram.ts`
- [X] T012 [US2] Uruchom `npm test` i popraw tylko błędy związane z US2

**Checkpoint**: Raty równe i malejące działają w domenie.

---

## Phase 5: User Story 3 - Zmienny wskaźnik w czasie (Priority: P3)

**Goal**: Obsłużyć serie POLSTR 1M i WIBOR 3M oraz ostatnią znaną wartość.

**Independent Test**: Część odsetkowa zmienia się po zmianie wskaźnika, a po końcu serii używana jest ostatnia wartość.

### Tests for User Story 3

- [X] T013 [P] [US3] Dodaj test zmiany wskaźnika w trakcie spłaty w `tests/harmonogram.test.ts`
- [X] T014 [P] [US3] Dodaj test ostatniej znanej wartości wskaźnika w `tests/harmonogram.test.ts`

### Implementation for User Story 3

- [X] T015 [US3] Zaimplementuj wybór wartości wskaźnika dla daty raty w `src/domena/harmonogram.ts`
- [X] T016 [US3] Podłącz serie z `src/dane/wskazniki.ts` do adaptera używanego przez API bez I/O w domenie
- [X] T017 [US3] Uruchom `npm test` i popraw tylko błędy związane z US3

**Checkpoint**: Harmonogram używa zmiennych wskaźników zgodnie z wymaganiami.

---

## Phase 6: User Story 4 - Nadpłaty (Priority: P4)

**Goal**: Obsłużyć nadpłaty w trybach `obnizRate` i `skrocOkres`.

**Independent Test**: Nadpłata zmniejsza saldo, a tryby dają odmienne zachowanie raty albo okresu.

### Tests for User Story 4

- [X] T018 [P] [US4] Dodaj test nadpłaty w trybie `obnizRate` w `tests/harmonogram.test.ts`
- [X] T019 [P] [US4] Dodaj test nadpłaty w trybie `skrocOkres` w `tests/harmonogram.test.ts`

### Implementation for User Story 4

- [X] T020 [US4] Zaimplementuj zastosowanie nadpłaty do salda w `src/domena/harmonogram.ts`
- [X] T021 [US4] Zaimplementuj przeliczenie dalszej raty dla trybu `obnizRate` w `src/domena/harmonogram.ts`
- [X] T022 [US4] Zaimplementuj wcześniejsze zakończenie harmonogramu dla trybu `skrocOkres` w `src/domena/harmonogram.ts`
- [X] T023 [US4] Uruchom `npm test` i popraw tylko błędy związane z US4

**Checkpoint**: Domena spełnia wymagany zakres obliczeń MVP.

---

## Phase 7: User Story 5 - API harmonogramu (Priority: P5)

**Goal**: Udostępnić `GET /api/harmonogram` zgodny z kontraktem.

**Independent Test**: Zapytanie z poprawnymi parametrami zwraca JSON z ratami i sumą odsetek.

### Tests for User Story 5

- [ ] T024 [P] [US5] Dodaj test parsowania albo walidacji parametrów API, jeśli funkcje pomocnicze trafią do czystego modułu w `tests/harmonogram.test.ts`

### Implementation for User Story 5

- [X] T025 [US5] Zaimplementuj parsowanie query string w `app/api/harmonogram/route.ts`
- [X] T026 [US5] Wywołaj domenę z route handlera i zwróć JSON z `raty` oraz `sumaOdsetek` w `app/api/harmonogram/route.ts`
- [X] T027 [US5] Dodaj odpowiedź 400 dla błędnych parametrów w `app/api/harmonogram/route.ts`
- [X] T028 [US5] Uruchom `npm test`, `npm run typecheck` i `npm run build`

**Checkpoint**: API działa bez logiki obliczeniowej w route handlerze.

---

## Phase 8: User Story 6 - Ekran kalkulatora i CSV (Priority: P6)

**Goal**: Podłączyć ekran z Claude Design do API i dodać eksport CSV po stronie przeglądarki.

**Independent Test**: Użytkownik liczy harmonogram z formularza i pobiera CSV.

### Implementation for User Story 6

- [X] T029 [US6] Wklej komponent z Claude Design do `app/page.tsx` z dyrektywą `'use client'`
- [X] T030 [US6] Podłącz formularz w `app/page.tsx` do `GET /api/harmonogram`
- [X] T031 [US6] Wyświetl pierwszą ratę, ostatnią ratę, sumę odsetek i tabelę rat w `app/page.tsx`
- [X] T032 [US6] Zaimplementuj eksport CSV po stronie przeglądarki w `app/page.tsx`
- [X] T033 [US6] Uruchom `npm run typecheck` i `npm run build`

**Checkpoint**: MVP jest dostępne z ekranu www.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Finalna walidacja i przygotowanie wydania.

- [X] T034 Uruchom `npm test`, `npm run typecheck` i `npm run build`
- [X] T035 Zweryfikuj ręcznie liczbę kontrolną z BRIEF.md przez ekran albo API
- [ ] T036 Przygotuj PR końcowy i poproś Copilota o review
- [ ] T037 Po scaleniu do `main` utwórz tag `v0.1.0` i wypchnij tagi

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 9)**: Depends on selected MVP stories completion.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational.
- **User Story 2 (P2)**: Starts after US1 because it reuses shared schedule output.
- **User Story 3 (P3)**: Starts after US1 because variable rates affect interest calculation.
- **User Story 4 (P4)**: Starts after US1 and preferably after US2/US3.
- **User Story 5 (P5)**: Starts after domain stories needed by MVP.
- **User Story 6 (P6)**: Starts after API contract is stable.

### Within Each User Story

- Tests MUST be written and fail before implementation for domain logic.
- Domain changes precede API and frontend integration.
- A story is complete only after its focused validation passes.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- Tests within each user story marked [P] can be written in parallel.
- Claude Design can prepare the visual component while domain phases are implemented.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 and validate the control number.
3. Add remaining domain stories incrementally.
4. Add API after domain behavior is stable.
5. Add frontend as the final story.

### Incremental Delivery

Each phase goes through a branch, local validation, PR, Copilot review and merge before starting the next phase, unless the user explicitly asks to batch phases.

## Notes

- Keep route handler thin.
- Keep frontend free of calculation logic.
- Do not edit files in `dane/` without explicit instruction.
- Do not add dependencies without asking first.