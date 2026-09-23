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

## Publikacja na GitHub i ponowny deploy

Po domknięciu wymagań MVP wykonano lokalną walidację:

```powershell
npm test
npm run typecheck
npm run build
```

Wynik:

- `npm test`: OK, 10/10 testów,
- `npm run typecheck`: OK,
- `npm run build`: OK.

Utworzono commit:

```text
2bd416c mvp: harmonogram kredytu i frontend z deployem
```

Wypchnięto gałąź na GitHub:

```text
origin/spec-mvp
```

Adres utworzenia PR:

```text
https://github.com/user604-altkom/harmonogram-polstr/pull/new/spec-mvp
```

Następnie wykonano ponowny deployment produkcyjny:

```powershell
npx --yes vercel@latest --prod --yes
```

Wynik:

- produkcyjny adres aplikacji: `https://harmonogram-polstr-szablon-main-five.vercel.app`,
- adres konkretnego deploymentu: `https://harmonogram-polstr-szablon-main-cb5fxglgg-akademia2.vercel.app`,
- status builda: `Ready`,
- brak błędów i ostrzeżeń blokujących.

Sprawdzenie produkcji po ponownym deployu:

- strona główna: `HTTP 200`,
- API rat równych: `HTTP 200`, 300 rat, pierwsza rata `249585` gr, ostatnia rata `249775` gr,
- API rat malejących: `HTTP 200`, 3 raty, pierwsza rata `4041500` gr, ostatnia rata `4013000` gr,
- API z nadpłatą `skrocOkres`: `HTTP 200`, 270 rat, pierwsza rata `249585` gr, ostatnia rata `150002` gr.

Nie utworzono tagu `v0.1.0`, bo użytkownik poprosił o commit, push i deploy, bez tagowania wydania.