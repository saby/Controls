const reDateMaskChars: RegExp = /[YMD]+/;
const reTimeMaskChars: RegExp = /[Hms]+/;

/**
 * В некоторых контроллах ввода даты можно задать только день и месяц.
 * В некоторых случаях может быть необходимо выбрать 29 февраля. Чтобы валидатор
 * пропустил дату, её год должен быть високосным.
 * Не следует использовать старые года, потомому что их часовой пояс может отличаться от текущего.
 * Например у 1904 года он равен +0230, а сейчас +0300. Причин такого поведения не удалось найти.
 * Код работающий с часовыми поясами будет нарушен из-за этих различий.
 * Делать год расчетным в зависимости от текущего нет необходимости на данный момент.
 */
export const DEFAULT_YEAR_NUM = 2004;
export const DEFAULT_YEAR_STR = '2004';
export const DATE_MASK_TYPE = 'date';
export const TIME_MASK_TYPE = 'time';
export const DATE_TIME_MASK_TYPE = 'datetime';

/**
 * Get the type of displayed data: date / time / date and time.
 * @returns (String) Data type ('date' || 'time' || 'datetime').
 */
export function getMaskType(mask: string): string {
  if (reDateMaskChars.test(mask)) {
     if (reTimeMaskChars.test(mask)) {
        return DATE_TIME_MASK_TYPE;
     }
     return DATE_MASK_TYPE;
  }
  if (reTimeMaskChars.test(mask)) {
     return TIME_MASK_TYPE;
  }
}
