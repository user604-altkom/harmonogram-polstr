# Implementation Plan: Kalkulator harmonogramu POLSTR/WIBOR

**Branch**: `001-harmonogram-polstr` | **Date**: 2026-09-23 | **Spec**: `specs/001-harmonogram-polstr/spec.md`

**Input**: Feature specification from `/specs/001-harmonogram-polstr/spec.md`

## Summary

MVP dostarcza kalkulator harmonogramu spłat kredytu hipotecznego dla POLSTR 1M i WIBOR 3M,
z ratami równymi, ratami malejącymi, nadpłatami, API JSON i ekranem www. Logika obliczeń będzie
w czystym module domenowym, serie wskaźników będą czytane przez warstwę danych, route handler
będzie tylko adapterem HTTP, a frontend będzie klientem API z eksportem CSV.

## Technical Context

**Language/Version**: TypeScript strict, Next.js App Router, Node.js 22-26

**Primary Dependencies**: Next.js, React, Tailwind, vitest; bez nowych zależności

**Storage**: Brak bazy danych; serie wskaźników w `dane/*.json`

**Testing**: vitest dla domeny i danych; `tsc --noEmit`; `next build`

**Target Platform**: Aplikacja webowa Next.js wdrażana na Vercel

**Project Type**: Web application z API route i frontendem w App Router

**Performance Goals**: Harmonogram 300 rat liczony synchronicznie w czasie akceptowalnym dla
interakcji formularza użytkownika

**Constraints**: Czysta domena bez I/O, jeden punkt zaokrąglania do grosza, brak nowych zależności,
route handler bez logiki obliczeń

**Scale/Scope**: MVP dla pojedynczego kalkulatora, typowe kredyty hipoteczne do kilkuset rat,
dane wskaźników z załączonych plików

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Czysta domena: PASS, plan umieszcza obliczenia w `src/domena/harmonogram.ts`.
- Testy przed logiką obliczeń: PASS, tasks.md ma testy przed implementacją każdej historii domenowej.
- Jawne pieniądze i zaokrąglenia: PASS, model wymaga kwot w groszach i jednego miejsca zaokrąglenia.
- Cienkie granice aplikacji: PASS, API i frontend są adapterami.
- Prostota i zgodność ze szkieletem: PASS, brak nowych zależności.

## Project Structure

### Documentation (this feature)

```text
specs/001-harmonogram-polstr/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── harmonogram-api.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── page.tsx
└── api/
    └── harmonogram/
        └── route.ts

src/
├── dane/
│   └── wskazniki.ts
└── domena/
    └── harmonogram.ts

tests/
└── smoke.test.ts
```

**Structure Decision**: Zachowujemy istniejący szkielet Next.js. Domena pozostaje w `src/domena/`,
dane w `src/dane/`, API w `app/api/`, a ekran w `app/page.tsx`. Nie tworzymy dodatkowych warstw
ani bibliotek.

## Complexity Tracking

Brak naruszeń konstytucji wymagających uzasadnienia.
