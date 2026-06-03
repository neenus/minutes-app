import { numberToWords } from '../numberToWords';

describe('numberToWords', () => {
  it('returns Zero for 0', () => expect(numberToWords(0)).toBe('Zero'));
  it('converts single digit', () => expect(numberToWords(5)).toBe('Five'));
  it('converts teen', () => expect(numberToWords(13)).toBe('Thirteen'));
  it('converts tens', () => expect(numberToWords(20)).toBe('Twenty'));
  it('converts tens + ones', () => expect(numberToWords(42)).toBe('Forty Two'));
  it('converts hundreds', () => expect(numberToWords(100)).toBe('One Hundred'));
  it('converts hundreds + tens + ones', () => expect(numberToWords(123)).toBe('One Hundred Twenty Three'));
  it('converts thousands', () => expect(numberToWords(1000)).toBe('One Thousand'));
  it('converts complex number', () => expect(numberToWords(1234)).toBe('One Thousand Two Hundred Thirty Four'));
  it('converts 100 shares', () => expect(numberToWords(100)).toBe('One Hundred'));
});
