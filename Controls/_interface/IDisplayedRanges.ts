import {TemplateFunction} from 'UI/Base';

export type TDisplayedRangesItem = [null | Date, null | Date];

export interface IDisplayedRangesOptions {
    displayedRanges?: TDisplayedRangesItem[];
    stubTemplate?: TemplateFunction;
}

/**
 * Интерфейс для контролов, позволяющих задать границы календаря.
 *
 * @public
 * @author Красильников А.С.
 */

export default interface IDisplayedRanges {
    readonly '[Controls/_interface/IDisplayedRanges]': boolean;
}

/**
 * @name Controls/_interface/IDisplayedRanges#displayedRanges
 * @cfg {Array} Массив отображаемых периодов. Каждый элемент - это массив, содержащий начало и конец периода.
 *
 * @remark
 * Позволяет ограничить отображаемые периоды в ленте. На месте остальных промежутков будут отображаться заглушки
 * {@link stubTemplate}. Если опция не задана, то лента бесконечно прокручивается в обе стороны. Для того чтобы
 * сконфигурировать бесконечный скролл в одном из направлений, соответствующая граница задается как null.
 *
 * @example
 * Отображаем два периода. С минус бесконечности до декабря 16 и с января 18 до декабрь 18. Ленту можно проскроллить
 * максимум до декабря 18. Между 16 и 18 годом бует отображаться одна загрушка {@link stubTemplate} вместо 12 месяцев.
 * 
 * <pre class="brush: js">
 * _displayedRanges: [[null, new Date(2016, 11)], [new Date(2018, 0), new Date(2018, 11)]]
 * </pre>
 * 
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.calendar:MonthList
 *    viewMode="month"
 *    displayedRanges="{{_displayedRanges}}" />
 * </pre>
 */
/**
 * @name Controls/_interface/IDisplayedRanges#stubTemplate
 * @cfg {Function} Шаблон заглушки, которая рисуется между отображаемыми периодами {@link displayedRanges}.
 *
 * @remark
 * В качестве опций получает startValue и endValue - даты начала и конца не отображаемого периода.
 *
 * @default Controls/calendar:MonthListStubTemplate
 *
 * @example
 * Отображаем 2 периода. Между декабрем 2016 и январем 2018 года вместо 12 месяцев будет отображена одна ззаглушка.
 * <pre class="brush: js">
 * _displayedRanges: [[null, new Date(2016, 11)], [new Date(2018, 0), new Date(2019, 0)]]
 * </pre>
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.calendar:MonthList viewMode="month">
 *    <ws:stubTemplate>
 *       <div>
 *          {{startValue}} - {{endValue}}
 *       </div>
 *    </ws:stubTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * @see Controls/_interface/IDisplayedRanges#displayedRanges
 */
