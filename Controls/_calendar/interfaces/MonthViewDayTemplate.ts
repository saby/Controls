/**
 * Шаблон, который по умолчанию используется для отображения дня в {@link Controls/calendar:MonthView}.
 * @class Controls/calendar:MonthViewDayTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/calendar:MonthViewDayTemplate#backgroundStyle
 * @cfg {String} Постфикс стиля для настройки фона ячейки.
 * @remark
 * Опция добавляет постфикс к слеудющим классам. (Для примера возьмем backgroundStyle = 'secondary')
 *
 * * controls-MonthView__backgroundColor-selected_theme-{theme}_style-secondary
 * * controls-MonthView__backgroundColor-selected-startend-unfinished_theme-{theme}_style-secondary
 * * controls-MonthView__backgroundColor-otherMonthDay-unselected_theme-{theme}_style-secondary
 * * controls-MonthView__backgroundColor-selected-readOnly_theme-{theme}_style-secondary
 * * controls-MonthView__backgroundColor-selected-startend-unfinished-readOnly_theme-{theme}_style-secondary
 * * controls-MonthView__backgroundColor-otherMonthDay-unselected-readOnly_theme-{theme}_style-secondary
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:dayTemplate>
 *         <ws:partial template="Controls/calendar:MonthViewDayTemplate" backgroundStyle="secondary">
 *             <ws:contentTemplate>
 *                 {{contentTemplate.value.day}}
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:dayTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * <pre class="brush: css">
 *  .controls-MonthView__backgroundColor-otherMonthDay-unselected_theme-default_style-secondary {
 *      background-color: red;
 * }
 * </pre>
 */

/**
 * @name Controls/calendar:MonthViewDayTemplate#sizeStyle
 * @cfg {String} Постфикс стиля для настройки размера ячейки.
 * @remark
 * Опция добавляет постфикс к классау controls-MonthView__item_theme-{theme}_style-secondary
 * (Для примера возьмем sizeStyle = 'secondary')
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:dayTemplate>
 *         <ws:partial template="Controls/calendar:MonthViewDayTemplate" sizeStyle='secondary' >
 *             <ws:contentTemplate>
 *                 {{contentTemplate.value.day}}
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:dayTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * <pre class="brush: css">
 * .controls-MonthViewVDOM__item_theme-default_style-secondary {
 *      width: 50px;
 *      height: 50px;
 *      margin: 1px;
 * }
 * </pre>
 */

/**
 * @name Controls/calendar:MonthViewDayTemplate#fontColorStyle
 * @cfg {String} Постфикс стиля для настройки цвета текста ячейки.
 * @remark
 * Опция пдобавляет постфикс к следующим классам. (Для примера возьмем fontColorStyle = 'secondary')
 *
 * * controls-MonthView__textColor-currentMonthDay-weekend_theme-{theme}_style-secondary
 * * controls-MonthView__textColor-currentMonthDay-workday_theme-{theme}_style-secondary
 * * controls-MonthView__textColor-otherMonthDay-weekend_theme-{theme}_style-secondary
 * * controls-MonthView__textColor-otherMonthDay-workday_theme-{theme}_style-secondary
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:dayTemplate>
 *         <ws:partial template="Controls/calendar:MonthViewDayTemplate" fontColorStyle='secondary' >
 *             <ws:contentTemplate>
 *                 {{contentTemplate.value.day}}
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:dayTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * <pre class="brush: css">
 * .controls-MonthView__textColor-currentMonthDay-weekend_theme-default_style-secondary {
 *      color: red;
 * }
 * </pre>
 */
/**
 * @name Controls/calendar:MonthViewDayTemplate#contentTemplate
 * @cfg {String|Function|undefined} Пользовательский шаблон, описывающий содержимое элемента.
 * @remark
 * В области видимости шаблона доступен объект value.
 * @see Controls/_calendar/interfaces/IMonthListSource#dayTemplate
 */

/**
 * @name Controls/calendar:MonthViewDayTemplate#fontWeight
 * @cfg {String} Позволяет управлять толщиной шрифта в ячейках.
 * @variant normal Толщина шрифта у ячеек не будет выставлена
 * @remark
 * Без указания опции ячейки будут настраивать толщину шрифта по стадарту контрола.
 * @see Controls/_calendar/interfaces/IMonthListSource#dayTemplate
 */
