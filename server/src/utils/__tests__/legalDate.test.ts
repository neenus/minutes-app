import { getLegalDate } from '../legalDate';

describe('getLegalDate', () => {
  it('formats 1st correctly', () => {
    const r = getLegalDate(new Date('2024-01-01T12:00:00'));
    expect(r.day).toBe('1st');
    expect(r.month).toBe('January');
    expect(r.year).toBe(2024);
  });
  it('formats 2nd correctly', () => expect(getLegalDate(new Date('2024-01-02T12:00:00')).day).toBe('2nd'));
  it('formats 3rd correctly', () => expect(getLegalDate(new Date('2024-01-03T12:00:00')).day).toBe('3rd'));
  it('formats 4th with th', () => expect(getLegalDate(new Date('2024-01-04T12:00:00')).day).toBe('4th'));
  it('formats 11th correctly (not 11st)', () => expect(getLegalDate(new Date('2024-01-11T12:00:00')).day).toBe('11th'));
  it('formats 21st correctly', () => expect(getLegalDate(new Date('2024-01-21T12:00:00')).day).toBe('21st'));
  it('formats 22nd correctly', () => expect(getLegalDate(new Date('2024-01-22T12:00:00')).day).toBe('22nd'));
  it('formats 31st correctly', () => expect(getLegalDate(new Date('2024-01-31T12:00:00')).day).toBe('31st'));
});
