export interface LegalDate {
  day: string;
  month: string;
  year: number;
}

export const getLegalDate = (dateObj: Date): LegalDate => {
  const d = dateObj.getDate();
  let suffix = 'th';
  if (d === 1 || d === 21 || d === 31) suffix = 'st';
  else if (d === 2 || d === 22) suffix = 'nd';
  else if (d === 3 || d === 23) suffix = 'rd';
  return {
    day: `${d}${suffix}`,
    month: dateObj.toLocaleString('default', { month: 'long' }),
    year: dateObj.getFullYear(),
  };
};
