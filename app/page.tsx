'use client';

import { useState } from 'react';

type TypRat = 'rowne' | 'malejace';
type Wskaznik = 'POLSTR_1M' | 'WIBOR_3M';
type TrybNadplaty = 'obnizRate' | 'skrocOkres';
type WidokTabeli = 'miesieczny' | 'roczny';

interface NadplataFormularza {
  id: number;
  miesiac: string;
  kwota: string;
  tryb: TrybNadplaty;
}

interface Formularz {
  kwota: string;
  liczbaRat: string;
  pierwszaRata: string;
  marza: string;
  wskaznik: Wskaznik;
  typRat: TypRat;
}

interface RataApi {
  numer: number;
  data: string;
  czescKapitalowa: number;
  czescOdsetkowa: number;
  rata: number;
  saldoPoSplacie: number;
}

interface WynikApi {
  raty: RataApi[];
  sumaOdsetek: number;
}

interface WierszTabeli {
  numer: string;
  data: string;
  kapital: number;
  odsetki: number;
  rata: number;
  saldo: number;
}

const POCZATKOWY_FORMULARZ: Formularz = {
  kwota: '400000',
  liczbaRat: '300',
  pierwszaRata: '2026-10-01',
  marza: '2.11',
  wskaznik: 'POLSTR_1M',
  typRat: 'rowne',
};

const POCZATKOWE_NADPLATY: NadplataFormularza[] = [
  { id: 1, miesiac: '24', kwota: '30000', tryb: 'skrocOkres' },
  { id: 2, miesiac: '60', kwota: '50000', tryb: 'obnizRate' },
];

export default function Strona() {
  const [formularz, ustawFormularz] = useState<Formularz>(POCZATKOWY_FORMULARZ);
  const [nadplaty, ustawNadplaty] = useState<NadplataFormularza[]>(POCZATKOWE_NADPLATY);
  const [nastepneId, ustawNastepneId] = useState(3);
  const [wynik, ustawWynik] = useState<WynikApi | null>(null);
  const [blad, ustawBlad] = useState<string | null>(null);
  const [ladowanie, ustawLadowanie] = useState(false);
  const [zapytanie, ustawZapytanie] = useState('');
  const [widok, ustawWidok] = useState<WidokTabeli>('miesieczny');
  const [zmienionePoPoliczeniu, ustawZmienionePoPoliczeniu] = useState(false);

  function aktualizujFormularz<Klucz extends keyof Formularz>(klucz: Klucz, wartosc: Formularz[Klucz]) {
    ustawFormularz((obecny) => ({ ...obecny, [klucz]: wartosc }));
    if (wynik) ustawZmienionePoPoliczeniu(true);
  }

  function aktualizujNadplate(id: number, zmiana: Partial<NadplataFormularza>) {
    ustawNadplaty((obecne) => obecne.map((nadplata) => (nadplata.id === id ? { ...nadplata, ...zmiana } : nadplata)));
    if (wynik) ustawZmienionePoPoliczeniu(true);
  }

  function dodajNadplate() {
    ustawNadplaty((obecne) => [...obecne, { id: nastepneId, miesiac: '', kwota: '', tryb: 'obnizRate' }]);
    ustawNastepneId((obecne) => obecne + 1);
    if (wynik) ustawZmienionePoPoliczeniu(true);
  }

  function usunNadplate(id: number) {
    ustawNadplaty((obecne) => obecne.filter((nadplata) => nadplata.id !== id));
    if (wynik) ustawZmienionePoPoliczeniu(true);
  }

  async function policz() {
    ustawLadowanie(true);
    ustawBlad(null);

    const parametry = new URLSearchParams({
      kwota: formularz.kwota,
      liczbaRat: formularz.liczbaRat,
      marza: formularz.marza,
      wskaznik: formularz.wskaznik,
      typRat: formularz.typRat,
      pierwszaRata: formularz.pierwszaRata,
    });

    const poprawneNadplaty = nadplaty
      .map((nadplata) => ({
        miesiac: Number(nadplata.miesiac),
        kwota: Number(nadplata.kwota.replace(',', '.')),
        tryb: nadplata.tryb,
      }))
      .filter((nadplata) => Number.isInteger(nadplata.miesiac) && nadplata.miesiac > 0 && nadplata.kwota > 0);

    if (poprawneNadplaty.length > 0) {
      parametry.set('nadplaty', JSON.stringify(poprawneNadplaty));
    }

    const sciezka = `/api/harmonogram?${parametry.toString()}`;
    ustawZapytanie(sciezka);

    try {
      const odpowiedz = await fetch(sciezka, { headers: { Accept: 'application/json' } });
      const dane: unknown = await odpowiedz.json();
      if (!odpowiedz.ok) {
        ustawBlad(odczytajBladApi(dane, odpowiedz.status));
        return;
      }
      if (!czyWynikApi(dane)) {
        ustawBlad('Odpowiedź API nie ma oczekiwanego kształtu harmonogramu.');
        return;
      }
      ustawWynik(dane);
      ustawZmienionePoPoliczeniu(false);
    } catch {
      ustawBlad('Nie udało się połączyć z API harmonogramu.');
    } finally {
      ustawLadowanie(false);
    }
  }

  function eksportujCsv() {
    if (!wynik) return;
    const wierszeCsv = [
      ['Nr', 'Data', 'Kapitał', 'Odsetki', 'Rata', 'Saldo'],
      ...wiersze.map((wiersz) => [
        wiersz.numer,
        wiersz.data,
        formatujKwoteCsv(wiersz.kapital),
        formatujKwoteCsv(wiersz.odsetki),
        formatujKwoteCsv(wiersz.rata),
        formatujKwoteCsv(wiersz.saldo),
      ]),
    ];
    const tresc = `\uFEFF${wierszeCsv.map((wiersz) => wiersz.join(';')).join('\r\n')}`;
    const blob = new Blob([tresc], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `harmonogram_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  const pierwszaRata = wynik?.raty[0];
  const ostatniaRata = wynik?.raty.at(-1);
  const wiersze = wynik ? przygotujWiersze(wynik.raty, widok) : [];
  const sumaKapitalu = wynik?.raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0) ?? 0;
  const sumaRat = wynik?.raty.reduce((suma, rata) => suma + rata.rata, 0) ?? 0;

  return (
    <main className="min-h-screen bg-[#161826] text-[#e9e9ed]">
      <header className="flex flex-wrap items-center gap-3 px-5 py-3">
        <span className="mr-auto text-[15px] font-semibold">Kalkulator harmonogramu spłat</span>
        <span className="rounded-md bg-[#3f424d] px-3 py-1 text-[11px] text-[#f3f5fe]">Kredyt hipoteczny</span>
      </header>
      <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex min-h-[calc(100vh-50px)] flex-col gap-4 p-4 lg:flex-row lg:items-start lg:p-5">
        <form
          className="flex w-full shrink-0 flex-col rounded-lg bg-[#232532] shadow-[0_0_0_1px_rgba(233,233,237,0.12)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-[340px]"
          onSubmit={(zdarzenie) => {
            zdarzenie.preventDefault();
            void policz();
          }}
        >
          <div className="flex items-baseline gap-2 px-4 pb-2 pt-4">
            <span className="mr-auto text-[10px] uppercase tracking-[0.1em] text-[#d2cefd]">Parametry kredytu</span>
            <span className="text-[11px] text-[#9397ab]">{nadplaty.length} nadpłaty</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 pb-4">
            <PoleEtykieta etykieta="Kwota kredytu (PLN)">
              <input
                className="h-9 w-full rounded-md border border-white/15 bg-[#161826] px-3 text-right tabular-nums outline-none focus:border-[#9184d9]"
                inputMode="decimal"
                value={formularz.kwota}
                onChange={(zdarzenie) => aktualizujFormularz('kwota', zdarzenie.target.value)}
              />
            </PoleEtykieta>

            <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
              <PoleEtykieta etykieta="Liczba rat">
                <input
                  className="h-9 w-full rounded-md border border-white/15 bg-[#161826] px-3 text-right tabular-nums outline-none focus:border-[#9184d9]"
                  inputMode="numeric"
                  value={formularz.liczbaRat}
                  onChange={(zdarzenie) => aktualizujFormularz('liczbaRat', zdarzenie.target.value.replace(/\D/g, ''))}
                />
              </PoleEtykieta>
              <PoleEtykieta etykieta="Data pierwszej raty">
                <input
                  className="h-9 w-full rounded-md border border-white/15 bg-[#161826] px-3 outline-none [color-scheme:dark] focus:border-[#9184d9]"
                  type="date"
                  value={formularz.pierwszaRata}
                  onChange={(zdarzenie) => aktualizujFormularz('pierwszaRata', zdarzenie.target.value)}
                />
              </PoleEtykieta>
            </div>

            <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
              <PoleEtykieta etykieta="Marża (pp)">
                <input
                  className="h-9 w-full rounded-md border border-white/15 bg-[#161826] px-3 text-right tabular-nums outline-none focus:border-[#9184d9]"
                  inputMode="decimal"
                  value={formularz.marza}
                  onChange={(zdarzenie) => aktualizujFormularz('marza', zdarzenie.target.value)}
                />
              </PoleEtykieta>
              <PoleEtykieta etykieta="Wskaźnik">
                <div className="grid grid-cols-2 overflow-hidden rounded-md border border-white/15 text-xs">
                  <PrzyciskSegmentu aktywny={formularz.wskaznik === 'POLSTR_1M'} onClick={() => aktualizujFormularz('wskaznik', 'POLSTR_1M')}>
                    POLSTR 1M
                  </PrzyciskSegmentu>
                  <PrzyciskSegmentu aktywny={formularz.wskaznik === 'WIBOR_3M'} onClick={() => aktualizujFormularz('wskaznik', 'WIBOR_3M')}>
                    WIBOR 3M
                  </PrzyciskSegmentu>
                </div>
              </PoleEtykieta>
            </div>

            <PoleEtykieta etykieta="Typ rat">
              <div className="grid grid-cols-2 overflow-hidden rounded-md border border-white/15 text-xs">
                <PrzyciskSegmentu aktywny={formularz.typRat === 'rowne'} onClick={() => aktualizujFormularz('typRat', 'rowne')}>
                  Równe
                </PrzyciskSegmentu>
                <PrzyciskSegmentu aktywny={formularz.typRat === 'malejace'} onClick={() => aktualizujFormularz('typRat', 'malejace')}>
                  Malejące
                </PrzyciskSegmentu>
              </div>
            </PoleEtykieta>

            <div className="mt-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="mr-auto text-[10px] uppercase tracking-[0.1em] text-[#d2cefd]">Nadpłaty</span>
                <button className="rounded-md px-2 py-1 text-xs text-[#d2cefd] hover:bg-white/5" type="button" onClick={dodajNadplate}>
                  Dodaj
                </button>
              </div>
              {nadplaty.map((nadplata) => (
                <div className="grid grid-cols-[52px_minmax(0,1fr)_104px_28px] gap-2" key={nadplata.id}>
                  <input
                    aria-label="Miesiąc nadpłaty"
                    className="h-8 rounded-md border border-white/15 bg-[#161826] px-2 text-right text-sm outline-none focus:border-[#9184d9]"
                    inputMode="numeric"
                    value={nadplata.miesiac}
                    onChange={(zdarzenie) => aktualizujNadplate(nadplata.id, { miesiac: zdarzenie.target.value.replace(/\D/g, '') })}
                  />
                  <input
                    aria-label="Kwota nadpłaty"
                    className="h-8 rounded-md border border-white/15 bg-[#161826] px-2 text-right text-sm outline-none focus:border-[#9184d9]"
                    inputMode="decimal"
                    value={nadplata.kwota}
                    onChange={(zdarzenie) => aktualizujNadplate(nadplata.id, { kwota: zdarzenie.target.value })}
                  />
                  <select
                    aria-label="Tryb nadpłaty"
                    className="h-8 rounded-md border border-white/15 bg-[#161826] px-1 text-xs outline-none [color-scheme:dark] focus:border-[#9184d9]"
                    value={nadplata.tryb}
                    onChange={(zdarzenie) => aktualizujNadplate(nadplata.id, { tryb: zdarzenie.target.value as TrybNadplaty })}
                  >
                    <option value="obnizRate">Obniż ratę</option>
                    <option value="skrocOkres">Skróć okres</option>
                  </select>
                  <button
                    aria-label="Usuń nadpłatę"
                    className="h-8 rounded-md text-[#b2b6ca] hover:bg-white/5"
                    type="button"
                    onClick={() => usunNadplate(nadplata.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              className="flex h-10 w-full items-center justify-center rounded-md border border-[#9184d9] text-sm font-medium text-[#d2cefd] hover:bg-[#9184d9]/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={ladowanie}
              type="submit"
            >
              {ladowanie ? 'Liczenie...' : 'Policz'}
            </button>
          </div>
        </form>

        <section className="flex min-h-[560px] min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-[#232532]/70 shadow-[0_0_0_1px_rgba(233,233,237,0.12)]">
          {ladowanie ? <div className="h-0.5 animate-pulse bg-[#9184d9]" /> : null}
          <div className="flex flex-col gap-3 border-b border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="mr-auto text-lg font-medium">Harmonogram spłat</h1>
              {zmienionePoPoliczeniu ? <span className="rounded-md border border-[#5d5294] px-3 py-1 text-xs text-[#d2cefd]">Parametry zmienione</span> : null}
              <div className="grid grid-cols-2 overflow-hidden rounded-md border border-white/15 text-xs">
                <PrzyciskSegmentu aktywny={widok === 'miesieczny'} onClick={() => ustawWidok('miesieczny')}>
                  Miesięcznie
                </PrzyciskSegmentu>
                <PrzyciskSegmentu aktywny={widok === 'roczny'} onClick={() => ustawWidok('roczny')}>
                  Rocznie
                </PrzyciskSegmentu>
              </div>
              <button
                className="rounded-md border border-white/15 px-3 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!wynik}
                type="button"
                onClick={eksportujCsv}
              >
                Eksport CSV
              </button>
            </div>

            {wynik ? (
              <>
                <div className="grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-3">
                  <KafelekPodsumowania etykieta="Rata pierwsza" wartosc={formatujKwote(pierwszaRata?.rata ?? 0)} opis={pierwszaRata ? `Rata 1 · ${pierwszaRata.data}` : ''} />
                  <KafelekPodsumowania etykieta="Rata ostatnia" wartosc={formatujKwote(ostatniaRata?.rata ?? 0)} opis={ostatniaRata ? `Rata ${ostatniaRata.numer} · ${ostatniaRata.data}` : ''} />
                  <KafelekPodsumowania etykieta="Suma odsetek" wartosc={formatujKwote(wynik.sumaOdsetek)} opis={`Łącznie ${formatujKwote(sumaRat)}`} wyróżniony />
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#b2b6ca]">
                  <span>
                    Kapitał <strong className="font-medium text-[#e9e9ed]">{formatujKwote(sumaKapitalu)}</strong>
                  </span>
                  <span>
                    Wskaźnik <strong className="font-medium text-[#e9e9ed]">{formularz.wskaznik === 'POLSTR_1M' ? 'POLSTR 1M' : 'WIBOR 3M'}</strong>
                  </span>
                  <span>
                    Raty <strong className="font-medium text-[#e9e9ed]">{formularz.typRat === 'rowne' ? 'równe' : 'malejące'}</strong>
                  </span>
                </div>
              </>
            ) : null}

            {blad ? (
              <div className="rounded-lg border border-[#5d5294] bg-[#2b2741] p-3 text-sm text-[#e7e5fe]" role="alert">
                {blad}
              </div>
            ) : null}
          </div>

          {wynik ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[700px] border-collapse text-sm tabular-nums">
                <thead className="sticky top-0 bg-[#232532] text-[11px] uppercase tracking-[0.08em] text-[#b2b6ca]">
                  <tr>
                    <th className="w-24 px-3 py-3 text-right">{widok === 'roczny' ? 'Raty' : 'Nr'}</th>
                    <th className="px-3 py-3 text-left">{widok === 'roczny' ? 'Rok' : 'Data'}</th>
                    <th className="px-3 py-3 text-right">Kapitał</th>
                    <th className="px-3 py-3 text-right">Odsetki</th>
                    <th className="px-3 py-3 text-right">Rata</th>
                    <th className="px-3 py-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {wiersze.map((wiersz) => (
                    <tr className="border-t border-white/10" key={`${wiersz.numer}-${wiersz.data}`}>
                      <td className="px-3 py-2 text-right text-[#b2b6ca]">{wiersz.numer}</td>
                      <td className="px-3 py-2 text-[#cfd3e5]">{wiersz.data}</td>
                      <td className="px-3 py-2 text-right">{formatujKwote(wiersz.kapital)}</td>
                      <td className="px-3 py-2 text-right">{formatujKwote(wiersz.odsetki)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatujKwote(wiersz.rata)}</td>
                      <td className="px-3 py-2 text-right">{formatujKwote(wiersz.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="m-4 rounded-lg border border-dashed border-white/15 p-10 text-sm text-[#b2b6ca]">Uzupełnij parametry i kliknij „Policz”.</div>
          )}

          {zapytanie ? (
            <div className="border-t border-white/10 px-4 py-2 font-mono text-[11px] text-[#9397ab]">
              <span className="text-[#d2cefd]">GET</span> <span className="break-all">{zapytanie}</span>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function PoleEtykieta({ etykieta, children }: { etykieta: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-[#b2b6ca]">
      {etykieta}
      {children}
    </label>
  );
}

function PrzyciskSegmentu({ aktywny, children, onClick }: { aktywny: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className={`px-3 py-2 text-center ${aktywny ? 'bg-[#9184d9]/15 text-[#d2cefd] shadow-[inset_0_0_0_1px_#9184d9]' : 'text-[#cfd3e5] hover:bg-white/5'}`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function KafelekPodsumowania({ etykieta, wartosc, opis, wyróżniony = false }: { etykieta: string; wartosc: string; opis: string; wyróżniony?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 bg-[#232532] p-3 ${wyróżniony ? 'shadow-[inset_0_-2px_0_#9184d9]' : ''}`}>
      <span className={`text-[11px] ${wyróżniony ? 'text-[#d2cefd]' : 'text-[#b2b6ca]'}`}>{etykieta}</span>
      <span className="whitespace-nowrap text-xl font-medium tabular-nums">{wartosc}</span>
      <span className="text-[11px] text-[#9397ab]">{opis}</span>
    </div>
  );
}

function formatujKwote(grosze: number): string {
  return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(grosze / 100);
}

function formatujKwoteCsv(grosze: number): string {
  return (grosze / 100).toFixed(2).replace('.', ',');
}

function czyWynikApi(wartosc: unknown): wartosc is WynikApi {
  if (!wartosc || typeof wartosc !== 'object') return false;
  const kandydat = wartosc as { raty?: unknown; sumaOdsetek?: unknown };
  return Array.isArray(kandydat.raty) && typeof kandydat.sumaOdsetek === 'number' && kandydat.raty.every(czyRataApi);
}

function czyRataApi(wartosc: unknown): wartosc is RataApi {
  if (!wartosc || typeof wartosc !== 'object') return false;
  const rata = wartosc as Partial<Record<keyof RataApi, unknown>>;
  return (
    typeof rata.numer === 'number' &&
    typeof rata.data === 'string' &&
    typeof rata.czescKapitalowa === 'number' &&
    typeof rata.czescOdsetkowa === 'number' &&
    typeof rata.rata === 'number' &&
    typeof rata.saldoPoSplacie === 'number'
  );
}

function odczytajBladApi(dane: unknown, status: number): string {
  if (dane && typeof dane === 'object') {
    const kandydat = dane as { blad?: unknown; error?: unknown };
    if (typeof kandydat.blad === 'string') return kandydat.blad;
    if (typeof kandydat.error === 'string') return kandydat.error;
  }
  return `API zwróciło błąd HTTP ${status}.`;
}

function przygotujWiersze(raty: RataApi[], widok: WidokTabeli): WierszTabeli[] {
  if (widok === 'miesieczny') {
    return raty.map((rata) => ({
      numer: String(rata.numer),
      data: rata.data,
      kapital: rata.czescKapitalowa,
      odsetki: rata.czescOdsetkowa,
      rata: rata.rata,
      saldo: rata.saldoPoSplacie,
    }));
  }

  const roczne: WierszTabeli[] = [];
  for (const rata of raty) {
    const rok = rata.data.slice(0, 4);
    const ostatni = roczne.at(-1);
    if (!ostatni || ostatni.data !== rok) {
      roczne.push({
        numer: String(rata.numer),
        data: rok,
        kapital: rata.czescKapitalowa,
        odsetki: rata.czescOdsetkowa,
        rata: rata.rata,
        saldo: rata.saldoPoSplacie,
      });
    } else {
      ostatni.numer = `${ostatni.numer.split('-')[0]}-${rata.numer}`;
      ostatni.kapital += rata.czescKapitalowa;
      ostatni.odsetki += rata.czescOdsetkowa;
      ostatni.rata += rata.rata;
      ostatni.saldo = rata.saldoPoSplacie;
    }
  }
  return roczne;
}
