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

  it('testy działają w strefie Europe/Warsaw', () => {
    expect(process.env.TZ).toBe('Europe/Warsaw');
  });
});
