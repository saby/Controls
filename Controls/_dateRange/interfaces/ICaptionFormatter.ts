export interface ICaptionFormatterOptions {
    captionFormatter?: Function;
}

/**
 * Интерфейс для контролов ввода или выбора дат, которые поддерживают возможность форматирования выводимого заголовка
 *
 * @interface Controls/_dateRange/interfaces/ICaptionFormatter
 * @public
 * @author Красильников А.С.
 */

export default interface ICaptionFormatter {
    readonly '[Controls/_dateRange/interfaces/ICaptionFormatter]': boolean;
}

/**
 * @name Controls/_dateRange/interfaces/ICaptionFormatter#captionFormatter
 * @cfg {Function} Функция форматирования заголовка.
 * @remark
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
 * @demo Controls-demo/dateRange/LiteSelector/CaptionFormatter/Index
 */
