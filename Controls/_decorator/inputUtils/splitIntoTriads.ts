import {partOfNumber} from 'Controls/_utils/inputUtils/RegExp';

export const NUMBER_DIGITS_TRIAD = 3;
export const SPLITTER = ' ';

function reducerRight(value: string, current: string, index: number, arr: string[]) {
   const processedElements = arr.length - index - 1;

   if (processedElements % NUMBER_DIGITS_TRIAD === 0) {
      return `${current}${SPLITTER}${value}`;
   }

   return `${current}${value}`;
}

export default function splitIntoTriads(original: string): string {
   const part = original.match(partOfNumber).slice(1, 5);

   if (part !== null && part[1]) {
      /**
       * We divide the integer part into triads.
       */
      part[1] = Array.prototype.reduceRight.call(part[1], reducerRight);

      return part.join('');
   }

   return original;
}

export function concatTriads(original: string): string {
   return original.replace(new RegExp(`${SPLITTER}`, 'g'), '');
}
