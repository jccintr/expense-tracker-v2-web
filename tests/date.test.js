import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addDaysToDateString,
  currentMonthYearSP,
  formatDateBR,
  formatDateSP,
  formatDateTimeBR,
  formatDayLabel,
  formatTimeBR,
  getServerWeekNumberForDate,
  isFutureDateString,
  isTodayDateString,
} from '../src/utils/date.js';

describe('fuso de São Paulo (UTC-3)', () => {
  it('formatDateSP usa o calendário de SP, não o UTC', () => {
    // 02:30 UTC ainda é 23:30 do dia anterior em SP
    expect(formatDateSP(new Date('2026-10-08T02:30:00Z'))).toBe('2026-10-07');
    expect(formatDateSP(new Date('2026-10-08T03:00:00Z'))).toBe('2026-10-08');
    expect(formatDateSP(new Date('2026-01-01T02:59:59Z'))).toBe('2025-12-31');
  });

  it('formatTimeBR e formatDateTimeBR mostram o horário de SP', () => {
    expect(formatTimeBR('2026-10-08T15:30:00Z')).toBe('12:30');
    expect(formatTimeBR('')).toBe('');
    expect(formatDateTimeBR('2026-10-08T01:00:00Z')).toBe('07-10-2026 22:00');
  });

  it('formatDateBR inverte AAAA-MM-DD para DD-MM-AAAA', () => {
    expect(formatDateBR('2026-10-08')).toBe('08-10-2026');
    expect(formatDateBR(null)).toBe('');
  });
});

describe('navegação por dia', () => {
  it('addDaysToDateString atravessa mês, ano e ano bissexto', () => {
    expect(addDaysToDateString('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDaysToDateString('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDaysToDateString('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDaysToDateString('2026-10-08', 0)).toBe('2026-10-08');
  });

  describe('com "hoje" fixo em 2026-10-08 (SP)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-08T15:00:00Z'));
    });
    afterEach(() => vi.useRealTimers());

    it('rótulos amigáveis', () => {
      expect(formatDayLabel('2026-10-08')).toBe('Hoje');
      expect(formatDayLabel('2026-10-07')).toBe('Ontem');
      expect(formatDayLabel('2026-10-09')).toBe('Amanhã');
      expect(formatDayLabel('2026-10-05')).toBe('seg, 5 de out');
    });

    it('hoje, futuro e mês/ano atuais', () => {
      expect(isTodayDateString('2026-10-08')).toBe(true);
      expect(isFutureDateString('2026-10-09')).toBe(true);
      expect(isFutureDateString('2026-10-08')).toBe(false);
      expect(currentMonthYearSP()).toEqual({ month: 10, year: 2026 });
    });

    it('perto da meia-noite UTC ainda é o dia anterior em SP', () => {
      vi.setSystemTime(new Date('2026-10-09T01:00:00Z')); // 22:00 de 08/10 em SP
      expect(isTodayDateString('2026-10-08')).toBe(true);
    });
  });
});

describe('week_number no esquema do servidor', () => {
  it('segunda a domingo da mesma semana têm o mesmo número', () => {
    const monday = getServerWeekNumberForDate('2026-10-05');
    for (const day of ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']) {
      expect(getServerWeekNumberForDate(day)).toBe(monday);
    }
  });

  it('a próxima segunda é a semana seguinte', () => {
    expect(getServerWeekNumberForDate('2026-10-12')).toBe(getServerWeekNumberForDate('2026-10-05') + 1);
  });

  it('a semana 1 é a que contém 1º de janeiro (começando na segunda)', () => {
    // 01/01/2026 é quinta: a semana 1 começa na segunda 29/12/2025
    expect(getServerWeekNumberForDate('2026-01-01')).toBe(1);
    expect(getServerWeekNumberForDate('2026-01-04')).toBe(1);
    expect(getServerWeekNumberForDate('2026-01-05')).toBe(2);
  });

  it('valor conhecido: 08/10/2026 cai na semana 41', () => {
    expect(getServerWeekNumberForDate('2026-10-08')).toBe(41);
  });
});
