/**
 * Шаблон, который по умолчанию используется для отображения дней недели в {@link Controls/calendar:MonthView}.
 * @class Controls/calendar:MonthViewDayHeaderTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/calendar:MonthViewDayHeaderTemplate#sizeStyle
 * @cfg {String} Постфикс стиля для настройки размера ячейки.
 * @remark
 * Опция добавляет постфикс к классау controls-MonthView__item_style-secondary
 * (Для примера возьмем sizeStyle = 'secondary')
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:dayHeaderTemplate>
 *         <ws:partial template="Controls/calendar:MonthViewDayHeaderTemplate" sizeStyle='secondary' >
 *             <ws:contentTemplate>
 *                 {{contentTemplate.value.day}}
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:dayHeaderTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * <pre class="brush: css">
 * .controls-MonthViewVDOM__item_style-secondary {
 *      width: 50px;
 *      height: 50px;
 *      margin: 1px;
 * }
 * </pre>
 */

/**
 * @name Controls/calendar:MonthViewDayHeaderTemplate#contentTemplate
 * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий содержимое элемента.
 * @remark
 * В области видимости шаблона доступен объект value.
 * @see Controls/_calendar/interfaces/IMonth#dayHeaderTemplate
 */
