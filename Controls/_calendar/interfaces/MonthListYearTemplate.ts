/**
 * Шаблон, который по умолчанию используется для отображения года в MonthList.
 * @class Controls/calendar:MonthListMonthTemplate
 * @public
 */

/*
 * @name Controls/calendar:MonthListYearTemplate#bodyTemplate
 * @cfg {String|Function} Шаблон отображения года
 * @remark
 * В шаблон будет переданы:
 * <ul>
 *      <li>date - дата месяа</li>
 *      <li>extData - данные, загруженные через источник данных</li>
 * </ul>
 * @example
 * <pre>
 * <Controls.calendar:MonthList>
 *           <ws:yearTemplate>
 *              <ws:partial template="Controls/calendar:MonthListYearTemplate">
 *                  <ws:bodyTemplate>
 *                      <ws:for data="month in 12">
 *                          <Controls.calendar:MonthView/>
 *                      </ws:for>
 *                  </ws:bodyTemplate>
 *              </ws:partial>
 *          </ws:yearTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 */
