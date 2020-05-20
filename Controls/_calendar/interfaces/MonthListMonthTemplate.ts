/**
 * Шаблон, который по умолчанию используется для отображения месяца в MonthList.
 * @class Controls/calendar:MonthListMonthTemplate
 * @public
 * @author Красильников А.С.
 */

/*
 * @name Controls/calendar:MonthListMonthTemplate#bodyTemplate
 * @cfg {String|Function} Шаблон отображения месяца
 * @remark
 * В шаблон будет переданы:
 * <ul>
 *      <li>date - дата месяа</li>
 *      <li>extData - данные, загруженные через источник данных</li>
 * </ul>
 * @example
 * <pre>
 * <Controls.calendar:MonthList>
 *           <ws:monthTemplate>
 *              <ws:partial template="Controls/calendar:MonthListMonthTemplate">
 *                  <ws:bodyTemplate>
 *                      <Controls.calendar:MonthView/>
 *                  </ws:bodyTemplate>
 *              </ws:partial>
 *          </ws:monthTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 */
