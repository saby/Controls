import rk = require('i18n!Controls');

export function isValidNumberRange(args): boolean {
   const isValuesValid = args.minValue < args.maxValue;
   if (args.minValue === null || args.maxValue === null || isValuesValid) {
      return true;
   }
   return rk('Максимальное число должно быть больше минимального');
}
