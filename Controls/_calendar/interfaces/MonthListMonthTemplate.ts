/**
 * Шаблон, который по умолчанию используется для отображения месяца в {@link Controls/calendar:MonthView}.
 * @class Controls/calendar:MonthListMonthTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/calendar:MonthListMonthTemplate#bodyTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения месяца
 * @remark
 * В шаблон будет переданы:
 * 
 * * date - дата месяа
 * * extData - данные, загруженные через источник данных
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:monthTemplate>
 *         <ws:partial template="Controls/calendar:MonthListMonthTemplate">
 *             <ws:bodyTemplate>
 *                 <Controls.calendar:MonthView/>
 *             </ws:bodyTemplate>
 *         </ws:partial>
 *     </ws:monthTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 */
