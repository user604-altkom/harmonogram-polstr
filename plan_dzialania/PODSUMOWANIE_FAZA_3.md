# Podsumowanie fazy 3

Data wykonania: 2026-09-23

Gałąź robocza: `spec-mvp`

## Cel fazy

Faza 3 obejmowała pierwszą historię użytkownika z `tasks.md`: obliczenie harmonogramu rat równych przy stałej stopie, z testem na liczbie kontrolnej z `BRIEF.md`.

## Wykonane prace

Zmieniono `src/domena/harmonogram.ts`:

- dodano typ `WpisSerii`,
- dodano typ `RataHarmonogramu`,
- dodano typ `WynikHarmonogramu`,
- rozszerzono `ParametryKredytu` o opcjonalną serię wskaźnika,
- zaimplementowano `policzHarmonogram` dla rat równych,
- dodano wyliczanie raty równej przy stałej stopie,
- dodano wybór stopy obowiązującej dla daty raty,
- dodano generowanie kolejnych dat rat,
- dodano zaokrąglanie do groszy,
- dodano wyrównanie ostatniej raty tak, aby saldo po spłacie wynosiło zero.

Zmieniono `tests/smoke.test.ts`:

- usunięto oczekiwanie, że `policzHarmonogram` jest szkieletem rzucającym błąd,
- dodano test liczby kontrolnej dla rat równych:
  - kwota: 400 000 zł,
  - liczba rat: 300,
  - stopa wskaźnika: 3,55%,
  - marża: 2,11 pp,
  - oczekiwana pierwsza rata: około 2 494,72 zł,
  - oczekiwana ostatnia rata wyrównująca: około 2 492,53 zł,
- dodano test sumy części kapitałowych po zaokrągleniach.

Zmieniono `specs/001-harmonogram-polstr/tasks.md`:

- oznaczono jako wykonane `T001`,
- oznaczono jako wykonane `T003`,
- oznaczono jako wykonane `T005`-`T009`,
- pozostawiono `T002` i `T004` jako niewykonane, bo pełne typy nadpłat oraz pełny zestaw pomocniczych funkcji konwersji kwot nie są jeszcze domknięte.

## Przebieg TDD

1. Dodano testy dla rat równych i sumy kapitału.
2. Uruchomiono `npm test`.
3. Testy początkowo były czerwone, ponieważ `policzHarmonogram` rzucał błąd `nie zaimplementowano`.
4. Zaimplementowano raty równe w module domenowym.
5. Pierwsza implementacja przechodziła część testów, ale ostatnia rata była zbyt wysoka, bo rata bazowa była przeliczana w każdym miesiącu.
6. Poprawiono algorytm tak, aby rata bazowa pozostawała stała przy niezmienionej stopie, a ostatnia rata wyrównywała saldo.
7. Testy przeszły po poprawce.

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

Wystąpiło jedynie ostrzeżenie konfiguracyjne Vite dotyczące ESM/CommonJS, bez wpływu na wynik.

## Stan po fazie

Faza 3 jest wykonana w zakresie rat równych przy stałej stopie. Domena potrafi zwrócić harmonogram rat równych, sumę odsetek i saldo po spłacie, a ostatnia rata wyrównuje kapitał do zera.

Nie wykonano commita ani PR-a.

## Następny krok

Kolejna faza powinna objąć `User Story 2 - Raty malejące`, czyli zadania `T010`-`T012` z `specs/001-harmonogram-polstr/tasks.md`.