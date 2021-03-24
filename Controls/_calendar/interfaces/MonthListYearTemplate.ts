/**
 * Шаблон, который по умолчанию используется для отображения года в {@link Controls/calendar:MonthView}.
 * @class Controls/calendar:MonthListYearTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/calendar:MonthListYearTemplate#bodyTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения года.
 * @remark
 * В шаблон будет переданы:
 * 
 * * date - дата месяца.
 * * extData - данные, загруженные через источник данных
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:yearTemplate>
 *         <ws:partial template="Controls/calendar:MonthListYearTemplate">
 *             <ws:bodyTemplate>
 *                 <ws:for data="month in 12">
 *                     <Controls.calendar:MonthView/>
 *                 </ws:for>
 *             </ws:bodyTemplate>
 *         </ws:partial>
 *     </ws:yearTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 */
