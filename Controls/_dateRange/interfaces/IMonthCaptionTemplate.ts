export default interface IMonthCaptionTemplate {
    readonly '[Controls/_dateRange/interfaces/IMonthCaptionTemplate]': boolean;
}

export interface IMonthCaptionTemplateOptions {
    monthCaptionTemplate?: HTMLElement;
}

/**
 * Интерфейс для контролов ввода или выбора дат, которые поддерживают шаблон заголовка месяца.
 *
 * @interface Controls/_dateRange/interfaces/IMonthCaptionTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_dateRange/interfaces/IMonthCaptionTemplate#monthCaptionTemplate
 * @cfg {HTMLElement} Шаблон заголовка месяца.
 * @remark
 * В шаблон передается:
 * <ul>
 *     <li>caption - месяц в текстовом формате (Май, Июнь, Июль и т.д).</li>
 *     <li>date - дата месяца.</li>
 * </ul>
 * Опции шаблона:
 * <ul>
 *     <li>caption: Текст заголовка месяца.</li>
 *     <li>icon: Определяет {@link https://wi.sbis.ru/icons/ иконку}, которая будет отображена рядом с заголовком месяца.</li>
 *     <li>iconStyle: {@link https://wi.sbis.ru/docs/js/Controls/interface/IFontColorStyle/typedefs/TFontColorStyle/ Цвет} иконки.</li>
 * </ul>
 * @example
 * <pre>
 *     <Controls.dateRange:DateSelector>
 *        <ws:monthCaptionTemplate>
 *          <ws:partial template="Controls/dateRange:MonthCaptionTemplate" icon="icon-Yes" iconStyle="{{_getIconStyle(monthCaptionTemplate.month)}}"/>
 *        </ws:monthCaptionTemplate>
 *     </Controls.shortDatePicker:View>
 * </pre>
 * @demo Controls-demo/dateRange/DateSelector/MonthCaptionTemplate/Index
 */
