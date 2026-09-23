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
}

export interface WpisSerii {
  od: string;
  stopa: number;
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
  const pierwszyWpisSerii = parametry.seria?.[0];
  if (!pierwszyWpisSerii) {
    throw new Error('brak serii wskaźnika');
  }
  if (parametry.typRat !== 'rowne') {
    throw new Error(`nie zaimplementowano: typ rat ${parametry.typRat}`);
  }

  const stopaRoczna = pierwszyWpisSerii.stopa + parametry.marza;
  const stopaMiesieczna = stopaRoczna / 12;
  const rataBazowa = obliczRateRowna(parametry.kwotaGr, stopaMiesieczna, parametry.liczbaRat);

  const raty: RataHarmonogramu[] = [];
  let saldo = parametry.kwotaGr;

  for (let indeksRaty = 0; indeksRaty < parametry.liczbaRat && saldo > 0; indeksRaty++) {
    const numer = indeksRaty + 1;
    const data = dodajMiesiace(parametry.pierwszaRata, indeksRaty);
    const czescOdsetkowa = zaokraglijDoGroszy(saldo * stopaMiesieczna);
    const ostatniaRata = numer === parametry.liczbaRat;
    const czescKapitalowa = ostatniaRata ? saldo : Math.min(saldo, rataBazowa - czescOdsetkowa);
    saldo -= czescKapitalowa;
    const rata = czescKapitalowa + czescOdsetkowa;

    raty.push({ numer, data, czescKapitalowa, czescOdsetkowa, rata, saldoPoSplacie: saldo });
  }

  return {
    raty,
    sumaOdsetek: raty.reduce((suma, rata) => suma + rata.czescOdsetkowa, 0),
  };
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
