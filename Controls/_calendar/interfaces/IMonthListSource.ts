import {ICrud} from 'Types/source';
import {TemplateFunction} from 'UI/Base';

export interface IMonthListSourceOptions {
   source?: ICrud;
   order?: string;
   dayTemplate?: TemplateFunction;
   dayHeaderTemplate?: TemplateFunction;
   captionTemplate?: TemplateFunction;
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

/*Eng
 * @name Controls/_calendar/interfaces/IMonthListSource#source
 * @cfg {Types/source:Base} Object that implements ISource interface for data access.
 * @remark
 * Must support a list method with paging by cursor. Years are used as identifiers. Each item is a year.
 * It must contain the extData field which is an array of 12 elements from the corresponding months.
 * Each element is an array with the objects to be transferred to the day template.
 * @example
 * <pre>
 *     <option name="source">_source</option>
 * </pre>
 */

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#dayTemplate
 * @cfg {Function} Шаблон дня.
 * @remark Шаблон имеет опции позволяющие кастомизировать контрол:
 * fontColorStyle - опция добавляет постфикс к следующим классам. (Для примера возьмем fontColorStyle = 'secondary')
 * <ul>
 *    <li> controls-MonthViewVDOM__textColor-currentMonthDay-weekend_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__textColor-currentMonthDay-workday_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__textColor-otherMonthDay-weekend_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__textColor-otherMonthDay-workday_theme-{theme}_style-secondary </li>
 * </ul>
 * backgroundStyle - опция добавляет постфикс к слеудющим классам. (Для примера возьмем backgroundStyle = 'secondary')
 * <ul>
 *    <li> controls-MonthViewVDOM__backgroundColor-selected_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__backgroundColor-selected-startend-unfinished_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__backgroundColor-otherMonthDay-unselected_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__backgroundColor-selected-readOnly_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__backgroundColor-selected-startend-unfinished-readOnly_theme-{theme}_style-secondary </li>
 *    <li> controls-MonthViewVDOM__backgroundColor-otherMonthDay-unselected-readOnly_theme-{theme}_style-secondary </li>
 * </ul>
 * sizeStyle - опция добавляет постфикс к следующим классам. (Для примера возьмем sizeStyle = 'secondary')
 * <ul>
 *    <li> controls-MonthViewVDOM__item_theme-{theme}_style-secondary </li>
 * </ul>
 * @example
 * <pre>
 * <Controls.calendar:MonthList
 *     bind:month="_month"
 *     source="{{_source}}">
 *     <ws:dayTemplate>
 *         <ws:partial template="Controls/calendar:MonthViewDayTemplate" attr:class="controls-MonthViewDemo-day-custom"
 *                hasTextColor="{{false}}" hasSize="{{false}}" hasBackgroundColor="{{false}" >
 *             <ws:contentTemplate>
 *                 <ws:partial template="{{_dayTemplate}}"/>
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:dayTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * @see Controls/_calendar/interfaces/IMonthListSource#source
 */

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#dayHeaderTemplate
 * @cfg {Function} Шаблон заголовка дня.
 * @remark В шаблоне можно использовать объект value, в котором хранятся caption (Сокращенное название дня недели) day (Индекс дня) и
 * weekend (Буллевое значение, является ли день выходным)
 * @example
 *  <Controls.calendar:MonthView bind:month="_month" newMode="{{true}}">
 *       <ws:dayHeaderTemplate>
 *          <ws:if data="{{!dayHeaderTemplate.value.weekend}}">
 *             <div class="controls-MonthViewDemo-day"> {{dayHeaderTemplate.value.caption}}</div>
 *          </ws:if>
 *          <ws:else>
 *             <div class="controls-MonthViewDemo-day-weekend"> {{dayHeaderTemplate.value.caption}}</div>
 *          </ws:else>
 *       </ws:dayHeaderTemplate>
 *  </Controls.calendar:MonthView>
*/

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#captionTemplate
 * @cfg {Function} Шаблон заголовка.
 * @remark В шаблоне можно использовать date (Дата месяца) caption (Заголовок месяца)
 * @example
 *  <Controls.calendar:MonthView bind:month="_month" newMode="{{true}}">
 *       <ws:captionTemplate>
 *          <div>{{captionTemplate.caption}}</div>
 *       </ws:captionTemplate>
 *  </Controls.calendar:MonthView>
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
