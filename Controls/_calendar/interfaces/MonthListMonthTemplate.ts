/**
 * Шаблон, который по умолчанию используется для отображения месяца в {@link Controls/calendar:MonthView}.
 * @class Controls/_calendar/interfaces/MonthListMonthTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_calendar/interfaces/MonthListMonthTemplate#bodyTemplate
 * @cfg {String|Function} Шаблон отображения месяца
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
