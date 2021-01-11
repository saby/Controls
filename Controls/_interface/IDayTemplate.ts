import {TemplateFunction} from 'UI/Base';

export interface IDayTemplateOptions {
    dayTemplate?: TemplateFunction;
}

/**
 * Интерфейс для контролов календарей, позволяющих задать шаблон дня.
 *
 * @public
 * @author Красильников А.С.
 */

export default interface IDayTemplate {
    readonly '[Controls/_interface/IDayTemplate]': boolean;
}

/**
 * @name Controls/_interface/IDayTemplate#dayTemplate
 * @cfg {String|Function} Шаблон дня.
 * @remark
 * В шаблон передается объект value, в котором хранятся:
 * 
 * * date — дата дня.
 * * day — порядковый номер дня.
 * * today — определяет, является ли день сегодняшним.
 * * weekend — определяет, является ли день выходным.
 * * extData — данные, загруженные через источник данных.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
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
 * @demo Controls-demo/dateRange/Input/DayTemplate/Index
 */
