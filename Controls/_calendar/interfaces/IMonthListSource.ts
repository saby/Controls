import {ICrud} from 'Types/source';
import {TemplateFunction} from 'UI/Base';

export interface IMonthListSourceOptions {
   source?: ICrud;
   order?: string;
}
/*Eng
 * An interface for controls based on Controls/calendar:MonthList and allowing you to draw your data
 * on the cells of the month.
 * @interface Controls/_calendar/interfaces/IMonthListSource
 * @public
 */

/**
 * Интерфейс для контролов, которые основаны на {@link Controls/calendar:MonthList}.
 * Позволяет настраивать отображение дней в зависимости от прикладных данных.
 * @interface Controls/_calendar/interfaces/IMonthListSource
 * @public
 * @author Красильников А.С.
 */
export interface IMonthListSource {
   readonly '[Controls/_calendar/interfaces/IMonthListSource]': boolean;
}

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#source
 * @cfg {Types/source:ICrud} Источник данных, которые используются для отображения дней.
 * @remark
 * Должен поддерживать списочный метод с навигацией по курсору.
 * В качестве идентификатора используется дата начала месяца.
 * Каждый элемент — это месяц.
 * Ответ должен содержать список объектов, в котором есть поле extData.
 * extData — это массив объектов, содержащих данные дня.
 * Эти объекты будут переданы в шаблон дня.
 * @example
 * <pre class="brush: html">
 *  <Controls.calendar:MonthList
 *      startPosition="_month"
 *      source="{{_source}}">
 *     <ws:yearTemplate>
 *         <ws:partial template="Controls/calendar:MonthListYearTemplate">
 *            <ws:dayTemplate>
 *               <ws:partial template="Controls/calendar:MonthViewDayTemplate">
 *                  <ws:contentTemplate>
 *                     <div class="{{contentTemplate.value.extData.isEven ? 'someClass'}}">
 *                        {{contentTemplate.value.day}}
 *                     </div>
 *                  </ws:contentTemplate>
 *               </ws:partial>
 *            </ws:dayTemplate>
 *         </ws:partial>
 *      </ws:yearTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 */

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#order
 * @cfg {String} Направление сортировки
 * @default 'asc'
 * @remark Работает только если не задан заголовок
 * @variant 'ask' прямой порядок
 * @variant 'desc' обратный порядок
 * @example
 * <pre>
 * <Controls.calendar:MonthList
 *     bind:month="_month"
 *     order='desk'>
 *     <ws:dayTemplate>
 *         <ws:partial template="Controls/calendar:MonthViewDayTemplate">
 *             <ws:contentTemplate>
 *                 <ws:partial template="{{_dayTemplate}}"/>
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:dayTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * @noShow
 */
