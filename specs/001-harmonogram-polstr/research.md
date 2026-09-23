# Research: Kalkulator harmonogramu POLSTR/WIBOR

## Decyzja: czysta domena jako jedyne miejsce obliczeń

Logika harmonogramu będzie w `src/domena/harmonogram.ts`. Funkcje domenowe przyjmą parametry,
serie wskaźników i listę nadpłat jako dane wejściowe oraz zwrócą wynik bez efektów ubocznych.

**Rationale**: Konstytucja projektu i AGENTS.md wymagają czystej domeny. Ułatwia to testowanie
liczb kontrolnych i chroni API oraz frontend przed duplikacją obliczeń.

**Alternatives considered**: Liczenie w route handlerze albo w komponencie React odrzucono,
bo łamie granice aplikacji i utrudnia testy.

## Decyzja: kwoty w groszach

Kwoty w domenie powinny być reprezentowane jako liczby całkowite w groszach. Wejście użytkownika
w złotych zostanie przeliczone w adapterze API albo na granicy domeny.

**Rationale**: Minimalizuje błędy zmiennoprzecinkowe i daje jednoznaczne porównania w testach.

**Alternatives considered**: Liczby zmiennoprzecinkowe w złotych odrzucono ze względu na ryzyko
rozjechania groszy w sumie kapitału.

## Decyzja: jeden punkt zaokrąglania

Część odsetkowa, kapitałowa i rata będą zaokrąglane do grosza w kontrolowanym miejscu domeny.
Ostatnia rata wyrówna saldo, aby suma kapitału była równa kwocie kredytu.

**Rationale**: To wymaganie BRIEF.md i reguł review. Ułatwia test na sumę części kapitałowych.

**Alternatives considered**: Zaokrąglanie w API albo w UI odrzucono, bo wynik domeny przestałby
być kompletnym kontraktem obliczeniowym.

## Decyzja: serie wskaźników jako dane wejściowe domeny

Moduł `src/dane/wskazniki.ts` udostępni serie z JSON, a domena dostanie serię jako parametr.
Domena wybierze wartość obowiązującą dla daty raty.

**Rationale**: Dane pozostają poza domeną, ale algorytm wyboru stopy jest testowalny na małych,
sztucznych seriach.

**Alternatives considered**: Bezpośredni import JSON w domenie odrzucono, bo byłby I/O i wiązałby
domenę z konkretnym źródłem danych.

## Decyzja: frontend z Claude Design jako ostatnia historia

Ekran zostanie przygotowany jako jeden komponent React z Tailwind i wklejony do `app/page.tsx`.
Agent podłączy go do `/api/harmonogram` po stabilizacji kontraktu API.

**Rationale**: Pozwala równolegle pracować nad domeną i UI bez blokowania obliczeń.

**Alternatives considered**: Projektowanie UI przed kontraktem API odrzucono jako ryzykowne;
komponent może powstać wcześniej, ale podłączenie nastąpi po API.