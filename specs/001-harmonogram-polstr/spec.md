# Feature Specification: Kalkulator harmonogramu POLSTR/WIBOR

**Feature Branch**: `001-harmonogram-polstr`

**Created**: 2026-09-23

**Status**: Draft

**Input**: Zgłoszenie z BRIEF.md: kalkulator harmonogramu spłat kredytu hipotecznego
ze zmiennym oprocentowaniem opartym na POLSTR 1M albo WIBOR 3M, z ratami równymi,
ratami malejącymi, nadpłatami, API i ekranem www.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Raty równe przy stałej stopie (Priority: P1)

Jako doradca chcę policzyć harmonogram rat równych dla kredytu o znanej kwocie, liczbie rat,
dacie pierwszej raty, wskaźniku i marży, aby szybko zweryfikować podstawową ofertę kredytu.

**Why this priority**: To minimalna wartość MVP i podstawa dla pozostałych typów harmonogramu.

**Independent Test**: Dla kwoty 400 000 zł, 300 rat, POLSTR 1M 3,55% i marży 2,11 pp
pierwsza rata równa musi wynieść około 2 494,72 zł, a ostatnia rata wyrównująca około
2 492,53 zł.

**Acceptance Scenarios**:

1. **Given** kredyt 400 000 zł, 300 rat i roczna stopa 5,66%, **When** system liczy raty
   równe, **Then** zwraca pierwszą ratę około 2 494,72 zł i sumę kapitału równą 400 000 zł.
2. **Given** harmonogram z zaokrągleniami do grosza, **When** system liczy ostatnią ratę,
   **Then** ostatnia część kapitałowa wyrównuje saldo do zera.

---

### User Story 2 - Raty malejące (Priority: P2)

Jako doradca chcę policzyć harmonogram rat malejących, aby porównać koszt kredytu z ratami
równymi.

**Why this priority**: Typ rat jest wymagany w MVP i wpływa na koszt oraz prezentację oferty.

**Independent Test**: Dla prostego kredytu o stałej stopie część kapitałowa jest stała poza
ostatnim wyrównaniem, a rata maleje wraz ze spadkiem salda.

**Acceptance Scenarios**:

1. **Given** kredyt z typem rat malejących, **When** system liczy harmonogram, **Then** część
   kapitałowa jest rozłożona proporcjonalnie na raty, a saldo maleje do zera.

---

### User Story 3 - Zmienny wskaźnik w czasie (Priority: P3)

Jako doradca chcę użyć serii POLSTR 1M albo WIBOR 3M, aby harmonogram uwzględniał zmiany
oprocentowania w kolejnych okresach.

**Why this priority**: Obsługa obu wskaźników i ich częstotliwości zmian jest sednem zgłoszenia.

**Independent Test**: Harmonogram z serią zmieniającą stopę w trakcie spłaty pokazuje inną część
odsetkową po zmianie wskaźnika; po ostatnim wpisie obowiązuje ostatnia znana wartość.

**Acceptance Scenarios**:

1. **Given** wskaźnik POLSTR 1M, **When** nadchodzi kolejny miesiąc raty, **Then** system pobiera
   wartość obowiązującą dla daty raty.
2. **Given** wskaźnik WIBOR 3M, **When** raty przypadają w tym samym kwartalnym okresie,
   **Then** system używa tej samej wartości wskaźnika.

---

### User Story 4 - Nadpłaty (Priority: P4)

Jako doradca chcę dodać nadpłaty w trybie obniżenia raty albo skrócenia okresu, aby pokazać
klientowi wpływ wcześniejszej spłaty kapitału.

**Why this priority**: Nadpłaty są w zakresie MVP, ale zależą od poprawnego harmonogramu bazowego.

**Independent Test**: Dwie nadpłaty o tej samej kwocie zmniejszają saldo, a tryb obniżenia raty
utrzymuje okres, podczas gdy tryb skrócenia okresu może zmniejszyć liczbę rat.

**Acceptance Scenarios**:

1. **Given** nadpłata w trybie obniż ratę, **When** system przelicza harmonogram, **Then** saldo
   maleje o nadpłatę, a pozostała liczba rat nie rośnie.
2. **Given** nadpłata w trybie skróć okres, **When** system przelicza harmonogram, **Then** saldo
   maleje o nadpłatę, a harmonogram kończy się wcześniej, jeśli saldo zostanie spłacone.

---

### User Story 5 - API harmonogramu (Priority: P5)

Jako użytkownik aplikacji chcę pobrać harmonogram przez `GET /api/harmonogram`, aby ekran www
mógł prezentować wyniki bez dublowania logiki obliczeń.

**Why this priority**: API jest kontraktem między domeną i ekranem oraz wymaganym wyjściem MVP.

**Independent Test**: Zapytanie z parametrami wejściowymi zwraca JSON z tabelą rat i sumą odsetek,
a błędne parametry zwracają czytelny błąd klienta.

**Acceptance Scenarios**:

1. **Given** poprawne parametry query string, **When** klient wywoła `GET /api/harmonogram`,
   **Then** otrzyma JSON z harmonogramem i sumą odsetek.
2. **Given** niepoprawne parametry, **When** klient wywoła endpoint, **Then** otrzyma odpowiedź
   z błędem walidacji bez uruchamiania obliczeń.

---

### User Story 6 - Ekran kalkulatora i CSV (Priority: P6)

Jako doradca chcę użyć ekranu z formularzem, tabelą rat i eksportem CSV, aby policzyć i przekazać
wynik klientowi w czytelnej formie.

**Why this priority**: Ekran jest wymagany do pełnego MVP, ale może powstać po stabilizacji API.

**Independent Test**: Użytkownik wypełnia formularz, klika Policz, widzi pierwszą i ostatnią ratę,
sumę odsetek, tabelę rat oraz może pobrać CSV w przeglądarce.

**Acceptance Scenarios**:

1. **Given** wypełniony formularz, **When** użytkownik kliknie Policz, **Then** ekran pobiera dane
   z `/api/harmonogram` i pokazuje podsumowanie oraz tabelę.
2. **Given** policzony harmonogram, **When** użytkownik kliknie Eksport CSV, **Then** przeglądarka
   pobiera plik CSV zawierający widoczne raty.

### Edge Cases

- Liczba rat wynosi 1 i ostatnia rata musi spłacić cały kapitał.
- Seria wskaźnika kończy się przed końcem harmonogramu i trzeba używać ostatniej znanej wartości.
- Nadpłata jest większa niż bieżące saldo i nie może spowodować salda ujemnego.
- Zaokrąglenia groszowe nie mogą zostawić salda różnego od zera po ostatniej racie.
- Brak lub błędny parametr query string musi dać błąd walidacji zamiast niepoprawnego wyniku.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST przyjmować kwotę kredytu, liczbę rat, datę pierwszej raty, marżę,
  typ rat, wskaźnik i listę nadpłat.
- **FR-002**: System MUST obsługiwać typ rat `rowne` i `malejace`.
- **FR-003**: System MUST obsługiwać wskaźniki `POLSTR_1M` i `WIBOR_3M` z serii danych projektu.
- **FR-004**: System MUST liczyć oprocentowanie okresu jako wartość wskaźnika plus marża.
- **FR-005**: System MUST stosować odsetki proste w okresie: saldo razy stopa roczna dzielona
  przez 12.
- **FR-006**: System MUST zaokrąglać kwoty do grosza w jednym jawnie wybranym miejscu.
- **FR-007**: System MUST wyrównać ostatnią ratę tak, aby suma części kapitałowych była równa
  kwocie kredytu.
- **FR-008**: System MUST stosować zmianę POLSTR 1M co miesiąc w dniu raty.
- **FR-009**: System MUST stosować zmianę WIBOR 3M co kwartał.
- **FR-010**: System MUST używać ostatniej znanej wartości wskaźnika po ostatnim wpisie serii.
- **FR-011**: System MUST obsługiwać nadpłaty z trybem obniżenia raty.
- **FR-012**: System MUST obsługiwać nadpłaty z trybem skrócenia okresu.
- **FR-013**: API `GET /api/harmonogram` MUST zwracać JSON z listą rat i sumą odsetek.
- **FR-014**: Każda rata w odpowiedzi MUST zawierać numer, datę, część kapitałową, część
  odsetkową, ratę i saldo po spłacie.
- **FR-015**: Ekran www MUST mieć formularz parametrów, przycisk Policz, podsumowanie, tabelę
  rat i eksport CSV po stronie przeglądarki.

### Key Entities *(include if feature involves data)*

- **Parametry harmonogramu**: kwota kredytu, liczba rat, data pierwszej raty, marża, typ rat,
  wskaźnik i nadpłaty.
- **Seria wskaźnika**: nazwa wskaźnika oraz lista wartości obowiązujących od daty.
- **Nadpłata**: numer miesiąca, kwota i tryb wpływu na harmonogram.
- **Rata harmonogramu**: numer, data, część kapitałowa, część odsetkowa, łączna rata i saldo
  po spłacie.
- **Wynik harmonogramu**: tabela rat i suma odsetek za cały okres.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Liczba kontrolna z BRIEF.md daje pierwszą ratę równą 2 494,72 zł z tolerancją
  plus/minus 0,05 zł.
- **SC-002**: Suma części kapitałowych w każdym harmonogramie testowym jest równa kwocie kredytu.
- **SC-003**: Dla poprawnych parametrów endpoint zwraca harmonogram zawierający co najmniej jedną
  ratę i sumę odsetek.
- **SC-004**: Użytkownik może policzyć harmonogram z ekranu www i pobrać CSV bez odświeżania strony.
- **SC-005**: `npm test`, `npm run typecheck` i `npm run build` przechodzą przed zgłoszeniem MVP.

## Assumptions

- Marża w wejściu użytkownika jest podawana w punktach procentowych, a w domenie przeliczana
  na ułamek roczny.
- Kwota kredytu i nadpłat w formularzu jest podawana w złotych, a domena może operować na groszach.
- MVP nie składa dziennych stawek POLSTR i bierze wartość wskaźnika wprost z danych.
- Ekran z Claude Design może zostać wklejony jako jeden komponent w `app/page.tsx`.
- Brak nowych zależności jest domyślnym ograniczeniem projektu.
