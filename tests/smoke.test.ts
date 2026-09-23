import { describe, expect, it } from 'vitest';
import { seriaWskaznika } from '../src/dane/wskazniki';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('dane wskaźników z katalogu dane/', () => {
  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)('%s ma serię uporządkowaną rosnąco po dacie', (wskaznik) => {
    const seria = seriaWskaznika(wskaznik);
    expect(seria.length).toBeGreaterThan(0);
    for (const wpis of seria) {
      expect(wpis.od).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(wpis.stopa).toBeGreaterThan(0);
      expect(wpis.stopa).toBeLessThan(0.2);
    }
    const daty = seria.map((wpis) => wpis.od);
    expect([...daty].sort()).toEqual(daty);
  });
});

describe('domena', () => {
  it('liczy ratę równą przy stałej stopie zgodnie z liczbą kontrolną', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      seria: [{ od: '2026-10-01', stopa: 0.0355 }],
    });

    expect(wynik.raty).toHaveLength(300);
    expect(wynik.raty[0]?.rata).toBeGreaterThanOrEqual(249_467);
    expect(wynik.raty[0]?.rata).toBeLessThanOrEqual(249_477);
    expect(wynik.raty.at(-1)?.rata).toBeGreaterThanOrEqual(249_248);
    expect(wynik.raty.at(-1)?.rata).toBeLessThanOrEqual(249_258);
  });

  it('wyrównuje sumę części kapitałowych do kwoty kredytu', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      seria: [{ od: '2026-10-01', stopa: 0.0355 }],
    });

    const sumaKapitalu = wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0);

    expect(sumaKapitalu).toBe(400_000_00);
    expect(wynik.raty.at(-1)?.saldoPoSplacie).toBe(0);
  });

  it('liczy raty malejące przy stałej stopie', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 120_000_00,
      liczbaRat: 3,
      marza: 0,
      typRat: 'malejace',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
      seria: [{ od: '2026-01-01', stopa: 0.12 }],
    });

    expect(wynik.raty).toEqual([
      { numer: 1, data: '2026-01-01', czescKapitalowa: 4_000_000, czescOdsetkowa: 120_000, rata: 4_120_000, saldoPoSplacie: 8_000_000 },
      { numer: 2, data: '2026-02-01', czescKapitalowa: 4_000_000, czescOdsetkowa: 80_000, rata: 4_080_000, saldoPoSplacie: 4_000_000 },
      { numer: 3, data: '2026-03-01', czescKapitalowa: 4_000_000, czescOdsetkowa: 40_000, rata: 4_040_000, saldoPoSplacie: 0 },
    ]);
  });

  it('przelicza ratę równą po zmianie wskaźnika w trakcie spłaty', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 120_000_00,
      liczbaRat: 4,
      marza: 0,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
      seria: [
        { od: '2026-01-01', stopa: 0.12 },
        { od: '2026-03-01', stopa: 0.24 },
      ],
    });

    expect(wynik.raty.map((rata) => rata.czescOdsetkowa)).toEqual([120_000, 90_446, 121_194, 61_197]);
    expect(wynik.raty.map((rata) => rata.rata)).toEqual([3_075_373, 3_075_373, 3_121_045, 3_121_046]);
  });

  it('stosuje ostatnią znaną wartość wskaźnika po końcu serii', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 120_000_00,
      liczbaRat: 3,
      marza: 0,
      typRat: 'malejace',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
      seria: [{ od: '2026-01-01', stopa: 0.12 }],
    });

    expect(wynik.raty[2]?.czescOdsetkowa).toBe(40_000);
  });

  it('obsługuje nadpłatę w trybie skrócenia okresu', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 120_000_00,
      liczbaRat: 6,
      marza: 0,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
      seria: [{ od: '2026-01-01', stopa: 0.12 }],
      nadplaty: [{ miesiac: 2, kwotaGr: 20_000_00, tryb: 'skrocOkres' }],
    });

    expect(wynik.raty).toHaveLength(5);
    expect(wynik.raty[1]?.czescKapitalowa).toBe(3_970_086);
    expect(wynik.raty.at(-1)?.rata).toBe(2_060_059);
    expect(wynik.raty.at(-1)?.saldoPoSplacie).toBe(0);
  });

  it('obsługuje nadpłatę w trybie obniżenia raty', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 120_000_00,
      liczbaRat: 6,
      marza: 0,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
      seria: [{ od: '2026-01-01', stopa: 0.12 }],
      nadplaty: [{ miesiac: 2, kwotaGr: 20_000_00, tryb: 'obnizRate' }],
    });

    expect(wynik.raty).toHaveLength(6);
    expect(wynik.raty[1]?.czescKapitalowa).toBe(3_970_086);
    expect(wynik.raty[2]?.rata).toBe(1_558_018);
    expect(wynik.raty.at(-1)?.rata).toBe(1_558_019);
    expect(wynik.raty.at(-1)?.saldoPoSplacie).toBe(0);
  });

  it('testy działają w strefie Europe/Warsaw', () => {
    expect(process.env.TZ).toBe('Europe/Warsaw');
  });
});
