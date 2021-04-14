export interface ITimeMaskOptions {
   mask: 'HH:II:SS.UUU' | 'HH:II:SS' | 'HH:II';
}

/**
 * @name Controls/_input/interface/ITimeMask#mask
 * @cfg {String} Формат ввода даты.
 * @remark
 * Необходимо выбрать одну из перечисленных масок. Разрешенные символы маски:
 * * H — час.
 * * I — минута.
 * * S — секунда.
 * * U — миллисекунда.
 * * ".", "-", ":", "/" — разделитель.
 * @variant 'HH:II:SS.UUU'
 * @variant 'HH:II:SS'
 * @variant 'HH:II'
 */


/**
 * Интерфейс для поля ввода времени с маской.
 *
 * @public
 * @author Красильников А.С.
 */
export interface ITimeMask {
   readonly '[Controls/_input/interface/ITimeMask]': boolean;
}
