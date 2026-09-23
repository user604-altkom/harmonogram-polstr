/**
 * Moduł domenowy kalkulatora harmonogramu spłat: czyste funkcje, bez React i bez I/O.
 */

export interface ParametryKredytu {
  /** Kwota kredytu w groszach (liczba całkowita). */
  kwotaGr: number;
  liczbaRat: number;
  /** Marża banku jako ułamek, np. 0.0211 dla 2,11 pp. */
  marza: number;
  typRat: 'rowne' | 'malejace';
  wskaznik: 'POLSTR_1M' | 'WIBOR_3M';
  /** Data pierwszej raty w formacie YYYY-MM-DD. */
  pierwszaRata: string;
  seria?: readonly WpisSerii[];
  nadplaty?: readonly Nadplata[];
}

export interface WpisSerii {
  od: string;
  stopa: number;
}

export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: 'obnizRate' | 'skrocOkres';
}

export interface RataHarmonogramu {
  numer: number;
  data: string;
  czescKapitalowa: number;
  czescOdsetkowa: number;
  rata: number;
  saldoPoSplacie: number;
}

export interface WynikHarmonogramu {
  raty: RataHarmonogramu[];
  sumaOdsetek: number;
}

export function przeliczZloteNaGrosze(kwotaZl: number): number {
  return zaokraglijDoGroszy(kwotaZl * 100);
}

export function policzHarmonogram(parametry: ParametryKredytu): WynikHarmonogramu {
  if (!parametry.seria || parametry.seria.length === 0) {
    throw new Error('brak serii wskaźnika');
  }

  const raty: RataHarmonogramu[] = [];
  let saldo = parametry.kwotaGr;
  let poprzedniaStopaMiesieczna: number | undefined;
  let rataBazowa = 0;
  const kapitalMalejacy = zaokraglijDoGroszy(parametry.kwotaGr / parametry.liczbaRat);

  for (let indeksRaty = 0; indeksRaty < parametry.liczbaRat && saldo > 0; indeksRaty++) {
    const numer = indeksRaty + 1;
    const data = dodajMiesiace(parametry.pierwszaRata, indeksRaty);
    const stopaRoczna = stopaDlaDaty(parametry.seria, data) + parametry.marza;
    const stopaMiesieczna = stopaRoczna / 12;
    const pozostaleRaty = parametry.liczbaRat - indeksRaty;
    if (parametry.typRat === 'rowne' && poprzedniaStopaMiesieczna !== stopaMiesieczna) {
      rataBazowa = obliczRateRowna(saldo, stopaMiesieczna, pozostaleRaty);
      poprzedniaStopaMiesieczna = stopaMiesieczna;
    }
    const czescOdsetkowa = zaokraglijDoGroszy(saldo * stopaMiesieczna);
    const ostatniaRata = numer === parametry.liczbaRat;
    const kapitalBezNadplaty = parametry.typRat === 'rowne'
      ? (ostatniaRata ? saldo : Math.min(saldo, rataBazowa - czescOdsetkowa))
      : (ostatniaRata ? saldo : Math.min(saldo, kapitalMalejacy));
    let czescKapitalowa = kapitalBezNadplaty;
    saldo -= kapitalBezNadplaty;

    for (const nadplata of parametry.nadplaty ?? []) {
      if (nadplata.miesiac !== numer || saldo <= 0) continue;
      const kwotaNadplaty = Math.min(saldo, nadplata.kwotaGr);
      saldo -= kwotaNadplaty;
      czescKapitalowa += kwotaNadplaty;
      if (nadplata.tryb === 'obnizRate') {
        poprzedniaStopaMiesieczna = undefined;
      }
    }

    const rata = czescKapitalowa + czescOdsetkowa;

    raty.push({
      numer,
      data,
      czescKapitalowa,
      czescOdsetkowa,
      rata,
      saldoPoSplacie: saldo,
    });
  }

  return {
    raty,
    sumaOdsetek: raty.reduce((suma, rata) => suma + rata.czescOdsetkowa, 0),
  };
}

function stopaDlaDaty(seria: readonly WpisSerii[], data: string): number {
  const pierwsza = seria[0];
  if (!pierwsza || pierwsza.od > data) {
    throw new Error('brak wartości wskaźnika dla daty');
  }
  let znalezionaStopa = pierwsza.stopa;

  for (const wpis of seria) {
    if (wpis.od > data) {
      break;
    }
    znalezionaStopa = wpis.stopa;
  }

  return znalezionaStopa;
}

function obliczRateRowna(saldo: number, stopaMiesieczna: number, liczbaRat: number): number {
  if (stopaMiesieczna === 0) {
    return zaokraglijDoGroszy(saldo / liczbaRat);
  }

  const czynnik = (1 + stopaMiesieczna) ** liczbaRat;
  return zaokraglijDoGroszy((saldo * stopaMiesieczna * czynnik) / (czynnik - 1));
}

function zaokraglijDoGroszy(kwota: number): number {
  return Math.round(kwota);
}

function dodajMiesiace(data: string, liczbaMiesiecy: number): string {
  const [rokTekst, miesiacTekst, dzienTekst] = data.split('-');
  const rok = Number(rokTekst);
  const miesiac = Number(miesiacTekst);
  const dzien = Number(dzienTekst);
  const miesiacOdZera = miesiac - 1 + liczbaMiesiecy;
  const nowyRok = rok + Math.floor(miesiacOdZera / 12);
  const nowyMiesiacOdZera = ((miesiacOdZera % 12) + 12) % 12;
  const ostatniDzienMiesiaca = new Date(Date.UTC(nowyRok, nowyMiesiacOdZera + 1, 0)).getUTCDate();
  const nowyDzien = Math.min(dzien, ostatniDzienMiesiaca);

  return `${nowyRok}-${String(nowyMiesiacOdZera + 1).padStart(2, '0')}-${String(nowyDzien).padStart(2, '0')}`;
}
