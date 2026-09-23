# Podsumowanie deployu Vercel

Data wykonania: 2026-09-23

Gałąź robocza: `spec-mvp`

## Cel

Celem było wdrożenie aktualnej aplikacji na Vercel i sprawdzenie, czy publiczny adres oraz endpoint API działają po deployu.

## Przygotowanie

Lokalne polecenie `vercel` nie było dostępne globalnie, dlatego użyto tymczasowo Vercel CLI przez `npx`:

```powershell
npx --yes vercel@latest
```

Sprawdzona wersja CLI:

```text
Vercel CLI 59.25.4
```

Próba sprawdzenia konta przez `whoami` początkowo pokazała stan niezalogowany i device login. Następnie wykonano deployment przez CLI `npx`, który utworzył projekt Vercel w zespole `akademia2`.

## Deployment tymczasowy

Uruchomiono:

```powershell
npx --yes vercel@latest deploy --temporary --yes
```

Wynik:

- deployment zakończony sukcesem,
- utworzono projekt Vercel: `akademia2/harmonogram-polstr-szablon-main`,
- URL deploymentu: `https://harmonogram-polstr-szablon-main-naze219fn-akademia2.vercel.app`,
- alias: `https://harmonogram-polstr-szablon-main-five.vercel.app`,
- Vercel zgłosił, że nie udało się połączyć repozytorium GitHub z projektem,
- komenda nie zgłosiła lokalnych zmian w plikach.

## Deployment produkcyjny

Uruchomiono:

```powershell
npx --yes vercel@latest --prod --yes
```

Wynik:

- deployment produkcyjny zakończony sukcesem,
- produkcyjny adres aplikacji: `https://harmonogram-polstr-szablon-main-five.vercel.app`,
- adres konkretnego deploymentu: `https://harmonogram-polstr-szablon-main-5wd9iukjh-akademia2.vercel.app`,
- build Vercel przeszedł poprawnie,
- wystąpiły tylko ostrzeżenia dotyczące wersji Node.js i skryptu instalacyjnego `unrs-resolver`, bez błędów blokujących,
- komenda nie zgłosiła utworzenia ani modyfikacji lokalnych plików.

## Sprawdzenie produkcji

Sprawdzono stronę:

```text
https://harmonogram-polstr-szablon-main-five.vercel.app
```

Wynik:

```text
HTTP 200
```

Sprawdzono endpoint API:

```text
https://harmonogram-polstr-szablon-main-five.vercel.app/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01
```

Wynik:

- status HTTP: `200`,
- liczba rat: 300,
- pierwsza rata: data `2026-10-01`, kwota `249585` gr,
- ostatnia rata: data `2051-09-01`, kwota `249775` gr.

## Uwagi

Deployment został wykonany z aktualnego lokalnego stanu gałęzi `spec-mvp`. W repozytorium nadal są niezatwierdzone zmiany, więc stan Vercel może wyprzedzać stan zapisany w GitHubie.

Vercel zgłosił problem z połączeniem projektu z repozytorium GitHub podczas deploymentu tymczasowego. Oznacza to, że automatyczne deploye z pushy do GitHuba mogą wymagać ręcznego podłączenia repozytorium w panelu Vercel.

Nie wykonano commita, PR-a ani tagu `v0.1.0`.