import {TemplateFunction} from 'UI/Base';

export interface IDayTemplateOptions {
    dayTemplate?: TemplateFunction;
}

/**
 * Интерфейс для контролов календарей, позволяющих задать шаблон дня
 *
 * @interface Controls/_interface/IDayTemplate
 * @public
 */

export default interface IDayTemplate {
    readonly '[Controls/_interface/IDayTemplate]': boolean;
}

/**
 * @name Controls/_interface/IDayTemplate#dayTemplate
 * @cfg {String|Function} Шаблон дня.
 * @remark
 * В шаблон передается объект value, в котором хранятся:
 * <ul>
 *     <li>date - дата дня</li>
 *     <li>day - порядковый номер дня</li>
 *     <li>today - определяет, является ли день сегодняшним </li>
 *     <li>weekend - определяет, является ли день выходным </li>
 *     <li>extData - данные, загруженные через источник данных</li>
 * </ul>
 * @example
 * <pre>
 * <Controls.calendar:MonthView>
 *    <ws:dayTemplate>
 *      <ws:partial template="Controls/calendar:MonthViewDayTemplate">
 *          <ws:contentTemplate>
 *                 {{contentTemplate.value.day}}
 *          </ws:contentTemplate>
 *      </ws:partial>
 *    </ws:dayTemplate>
 * </Controls.calendar:MonthView>
 * </pre>
 */