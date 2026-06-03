const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
const thousands = ['','Thousand','Million','Billion'];

function convertChunk(chunk: number): string {
  if (chunk === 0) return '';
  if (chunk < 20) return ones[chunk] + ' ';
  if (chunk < 100) {
    const o = chunk % 10;
    return `${tens[Math.floor(chunk / 10)]}${o ? ' ' + ones[o] : ''} `;
  }
  return ones[Math.floor(chunk / 100)] + ' Hundred ' + convertChunk(chunk % 100);
}

export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  let word = '';
  let i = 0;
  let n = num;
  while (n > 0) {
    if (n % 1000 !== 0) word = convertChunk(n % 1000) + (thousands[i] ? thousands[i] + ' ' : '') + word;
    n = Math.floor(n / 1000);
    i++;
  }
  return word.trim();
};
