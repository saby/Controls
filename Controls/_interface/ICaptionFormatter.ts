/**
 * Интерфейс для контролов, которые поддерживают метод captionFormatter
 *
 * @interface Controls/interface/ICaptionFormatter
 * @public
 * @author Красильников А.С.
 */

export interface ICaptionFormatterOptions {
    captionFormatter?: Function;
}

/*
  * @name Controls/interface/ICaptionFormatter#captionFormatter
 * @cfg {Function} Функция форматирования заголовка.
 * Аргументы функции:
 * <ol>
 *    <li>startValue — Начальное значение периода.</li>
 *    <li>endValue — Конечное значение периода.</li>
 *    <li>emptyCaption — Отображаемый текст, когда в контроле не выбран период.</li>
 * </ol>
 * @returns {String|Number} Функция должна возвращать строку с заголовком.
 * @example
 * WML:
 * <pre>
 * <Controls.dateRange:RangeSelector captionFormatter="{{_captionFormatter}}" />
 * </pre>
 * JS:
 * <pre>
 * _captionFormatter: function(startValue, endValue, emptyCaption) {
 *    return 'Custom range format';
 * }
 * </pre>
 *
*/

export default interface IDateConstructor {
    readonly '[Controls/_interface/IDateConstructor]': boolean;
}
