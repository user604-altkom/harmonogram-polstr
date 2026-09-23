# Podsumowanie faz 0-2

Data wykonania: 2026-09-23

Gałąź robocza: `spec-mvp`

## Faza 0: sprawdzenie startowe

Wykonano walidację startową projektu.

Uruchomione komendy:

```powershell
npm install
npm test
npm run typecheck
npm run build
```

Wynik:

- `npm install`: OK, zależności zainstalowane, 0 podatności.
- `npm test`: OK, 1 plik testów, 4/4 testy zakończone powodzeniem.
- `npm run typecheck`: OK.
- `npm run build`: OK, build produkcyjny Next.js zakończony powodzeniem.

Dev server nie został zostawiony w tle. Do walidacji fazy 0 wystarczyło potwierdzenie testów,
sprawdzenia typów i builda.

## Faza 1: artefakty spec-kit

Utworzono gałąź roboczą:

```powershell
git switch -c spec-mvp
```

Utworzono strukturę funkcji spec-kit skryptem:

```powershell
.specify\scripts\powershell\create-new-feature.ps1 -Json -ShortName harmonogram-polstr "Kalkulator harmonogramu spłat kredytu hipotecznego na POLSTR 1M i WIBOR 3M"
```

Wynik:

- feature: `001-harmonogram-polstr`,
- katalog: `specs/001-harmonogram-polstr`,
- specyfikacja: `specs/001-harmonogram-polstr/spec.md`.

Zainicjowano plan spec-kit skryptem:

```powershell
.specify\scripts\powershell\setup-plan.ps1 -Json
```

Wypełnione lub utworzone artefakty:

- `.specify/memory/constitution.md`,
- `specs/001-harmonogram-polstr/spec.md`,
- `specs/001-harmonogram-polstr/plan.md`,
- `specs/001-harmonogram-polstr/research.md`,
- `specs/001-harmonogram-polstr/data-model.md`,
- `specs/001-harmonogram-polstr/contracts/harmonogram-api.md`,
- `specs/001-harmonogram-polstr/quickstart.md`,
- `specs/001-harmonogram-polstr/checklists/requirements.md`,
- `specs/001-harmonogram-polstr/tasks.md`.

Zakres artefaktów:

- konstytucja projektu z zasadami czystej domeny, TDD, zaokrągleń, cienkiego API i braku nowych zależności,
- specyfikacja MVP z historiami użytkownika dla rat równych, rat malejących, zmiennych wskaźników, nadpłat, API oraz frontendu,
- plan techniczny zgodny z Next.js App Router, TypeScript strict, vitest i Tailwind,
- research z decyzjami architektonicznymi,
- model danych dla parametrów harmonogramu, wskaźników, nadpłat, rat i wyniku,
- kontrakt `GET /api/harmonogram`,
- quickstart walidacyjny,
- checklistę jakości wymagań,
- zadania implementacyjne fazami od setupu po wydanie `v0.1.0`.

Walidacja artefaktów:

```powershell
.specify\scripts\powershell\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Wynik:

- komenda zakończona kodem 0,
- wykryte dokumenty: `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`,
- nie znaleziono placeholderów szablonowych ani markerów `NEEDS CLARIFICATION`.

## Faza 2: role agentów i narzędzi

Ustalono role narzędzi na dalsze prace:

- Copilot jako główny agent implementujący skille spec-kit, zadania z `tasks.md`, testy i poprawki po review.
- Agent `Explore` jako pomoc read-only do szybkiego rozpoznania wzorców w repo, gdy będzie potrzebne dodatkowe rozeznanie.
- Claude Design jako tor równoległy do przygotowania jednoplikowego komponentu React z Tailwind dla `app/page.tsx`.
- Copilot Review jako recenzent PR-ów według reguł z `.github/instructions/review.instructions.md`.
- Vercel jako środowisko builda produkcyjnego i preview dla PR-ów.

Dalszy zalecany krok:

1. Przejrzeć diff artefaktów spec-kit.
2. Zacommitować fazy 0-2 na gałęzi `spec-mvp`.
3. Otworzyć PR z artefaktami i poprosić Copilota o review.