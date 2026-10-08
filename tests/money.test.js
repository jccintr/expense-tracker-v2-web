import { describe, expect, it } from 'vitest';
import { amountToInput, formatMoney, parseAmountInput } from '../src/utils/money.js';

describe('parseAmountInput', () => {
  it('aceita vírgula ou ponto como decimal', () => {
    expect(parseAmountInput('35,90')).toBe(35.9);
    expect(parseAmountInput('35.90')).toBe(35.9);
    expect(parseAmountInput('12')).toBe(12);
    expect(parseAmountInput(' 7,5 ')).toBe(7.5);
  });

  it('ponto de milhar só conta quando há vírgula decimal', () => {
    expect(parseAmountInput('1.234,56')).toBe(1234.56);
    expect(parseAmountInput('1.234.567,89')).toBe(1234567.89);
  });

  it('texto vazio ou inválido vira NaN', () => {
    expect(parseAmountInput('')).toBeNaN();
    expect(parseAmountInput('   ')).toBeNaN();
    expect(parseAmountInput('abc')).toBeNaN();
    expect(parseAmountInput(undefined)).toBeNaN();
  });
});

describe('formatMoney e amountToInput', () => {
  it('formata em reais', () => {
    expect(formatMoney(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50');
    expect(formatMoney('35.9').replace(/\s/g, ' ')).toBe('R$ 35,90'); // a API pode mandar string
    expect(formatMoney(null).replace(/\s/g, ' ')).toBe('R$ 0,00');
  });

  it('converte o valor da API no texto do campo de edição', () => {
    expect(amountToInput('35.9')).toBe('35,90');
    expect(amountToInput(12)).toBe('12,00');
    expect(amountToInput('abc')).toBe('');
  });
});
