import {TemplateFunction} from 'UI/Base';

export interface IMonthListOptions {
   viewMode: string;
   position?: Date;
   yearTemplate?: TemplateFunction;
   monthTemplate?: TemplateFunction;
   dayTemplate?: TemplateFunction;
   dayHeaderTemplate?: TemplateFunction;
   captionTemplate?: TemplateFunction;
   stubTemplate?: TemplateFunction;
   displayedRanges?: [];
}

/**
 * Интерфейс для контролов, которые основаны на {@link Controls/calendar:MonthList}.
 * @interface Controls/_calendar/interfaces/IMonthList
 * @public
 * @author Красильников А.С.
 */
export interface IMonthList {
   readonly '[Controls/_calendar/interfaces/IMonthList]': boolean;
}

/**
 * @typedef {String} ViewMode
 * @variant year Один отображаемый элемент — год.
 * @variant month Один отображаемый элемент — месяц.
 */

/**
 * @name Controls/_calendar/interfaces/IMonthList#viewMode
 * @cfg {ViewMode} Режим отображения элементов.
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList
 *     bind:position="_month"
 *     viewMode="month"/>
 * </pre>
 * @see Controls/_calendar/interfaces/IMonthList#yearTemplate
 * @see Controls/_calendar/interfaces/IMonthList#monthTemplate
 */

/**
 * @typedef {String} ShadowVisibility
 * @variant visible Тень всегда видима.
 * @variant hidden Тень всегда скрыта.
 */

/**
 * @name Controls/_calendar/interfaces/IMonthList#topShadowVisibility
 * @cfg {ShadowVisibility} Устанавливает режим отображения тени сверху.
 * @default visible
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList topShadowVisibility="hidden"/>
 * </pre>
 */

/**
 * @name Controls/_calendar/interfaces/IMonthList#bottomShadowVisibility
 * @cfg {ShadowVisibility} Устанавливает режим отображения тени снизу.
 * @default visible
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList bottomShadowVisibility="hidden"/>
 * </pre>
 */

/**
 * @name Controls/_calendar/interfaces/IMonthList#position
 * @cfg {Date} Год или месяц, который отображается первым в верху скролируемой области.
 * При изменении значения лента скролится к новому году\месяцу.
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList bind:position="_month"/>
 * </pre>
 */

/**
 * @name Controls/_calendar/interface/IMonthList#displayedRanges
 * @cfg {Array} Массив отображаемых периодов. Каждый элемент — это массив, который содержит начало и конец периода.
 * @remark
 * Позволяет ограничить отображаемые периоды в ленте. На месте остальных промежутков будут отображаться заглушки
 * {@link stubTemplate}. Если опция не задана, то лента бесконечно скролится в обе стороны. Для того чтобы
 * сконфигурировать бесконечный скролл в одном из направлений, соответствующая граница задается как null.
 * @example
 * Отображаем два периода. С минус бесконечности до декабря 16 и с января 18 до декабрь 18. Ленту можно проскроллить
 * максимум до декабря 18. Между 16 и 18 годом бует отображаться одна загрушка {@link stubTemplate} вместо 12 месяцев.
 * <pre class="brush: js">
 * _displayedRanges: [[null, new Date(2016, 11)], [new Date(2018, 0), new Date(2018, 11)]]
 * </pre>
 * <pre class="brush: html">
 * <Controls.calendar:MonthList
 *    viewMode="month"
 *    displayedRanges="_displayedRanges" />
 * </pre>
 */

/**
 * @name Controls/_calendar/interfaces/IMonthList#yearTemplate
 * @cfg {String|Function} Шаблон года.
 * @remark
 * Отображается только в режиме года(viewMode: 'year'). В качестве опций получает date(дата начала года) и
 * extData(данные загруженные через источник данных). extData представляет из себя массив, содержащий месяцы.
 * Каждый месяц это массив содержащий данные дня загруженные через источник данных.
 *
 * @default Controls/calendar:MonthListYearTemplate
 *
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
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
 * @see Controls/_calendar/interfaces/IMonthList#monthTemplate
 * @see Controls/_calendar/interfaces/IMonthList#viewMode
 */

/**
 * @name Controls/_calendar/interfaces/IMonthList#monthTemplate
 * @cfg {String|Function} Шаблон месяца.
 *
 * @remark
 * В качестве опций получает date (дата начала месяца) и extData (данные, загруженные через источник данных).
 * extData представляет из себя массив из объектов, содержащих данные дня, загруженные через источник данных.
 *
 * @default Controls/calendar:MonthListMonthTemplate
 *
 * @example
 * <pre class="brush: html">
 * <Controls.calendar:MonthList>
 *     <ws:monthTemplate>
 *         <ws:partial template="Controls/calendar:MonthListMonthTemplate">
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
 *      </ws:monthTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 * @see Controls/_calendar/interfaces/IMonthList#yearTemplate
 * @see Controls/_calendar/interfaces/IMonthList#viewMode
 */

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#dayTemplate
 * @cfg {String|Function} Шаблон дня.
 * @remark
 * В шаблон передается объект value, в котором хранятся:
 * <ul>
 *     <li>date - дата дня</li>
 *     <li>day - порядковый номер дня</li>
 *     <li>today - определяет, является ли день сегодняшним </li>
 *     <li>weekend - определяет, является ли день выходным </li>
 *     <li>extData - данные, загруженные через источник данных</li>
 * </ul>
 * @example
 * <pre>
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
 */

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#dayHeaderTemplate
 * @cfg {String|Function} Шаблон заголовка дня.
 * @remark В шаблоне можно использовать объект value, в котором хранятся:
 *  <ul>
 *      <li>caption - сокращенное название дня недели</li>
 *      <li>day - индекс дня</li>
 *      <li>weekend - определяет, является ли день выходным</li>
 *  </ul>
 * @example
 * <pre class="brush: html">
 *  <Controls.calendar:MonthView bind:month="_month">
 *       <ws:dayHeaderTemplate>
 *          <ws:if data="{{!dayHeaderTemplate.value.weekend}}">
 *             <div class="controls-MonthViewDemo-day"> {{dayHeaderTemplate.value.caption}}</div>
 *          </ws:if>
 *          <ws:else>
 *             <div class="controls-MonthViewDemo-day-weekend"> {{dayHeaderTemplate.value.caption}}</div>
 *          </ws:else>
 *       </ws:dayHeaderTemplate>
 *  </Controls.calendar:MonthView>
 * </pre>
 */

/**
 * @name Controls/_calendar/interfaces/IMonthListSource#captionTemplate
 * @cfg {String|Function} Шаблон заголовка.
 * @remark В шаблоне можно использовать date (Дата месяца) caption (Заголовок месяца)
 * @example
 * <pre class="brush: html">
 *  <Controls.calendar:MonthView bind:month="_month">
 *       <ws:captionTemplate>
 *          <div>{{captionTemplate.caption}}</div>
 *       </ws:captionTemplate>
 *  </Controls.calendar:MonthView>
 *  </pre>
 */

/**
 * @name Controls/_calendar/interface/IMonthList#stubTemplate
 * @cfg {String|Function} Шаблон заглушки, которая рисуется между отображаемыми периодами {@link displayedRanges}.
 *
 * @remark
 * В качестве опций получает startValue и endValue — даты начала и конца не отображаемого периода.
 *
 * @default Controls/calendar:MonthListStubTemplate
 *
 * @example
 * Отображаем 2 периода. Между декабрем 2016 и январем 2018 года вместо 12 месяцев будет отображена одна ззаглушка.
 * <pre class="brush: js">
 * _displayedRanges: [[null, new Date(2016, 11)], [new Date(2018, 0), new Date(2019, 0)]]
 * </pre>
 * <pre class="brush: html">
 * <Controls.calendar:MonthList viewMode="month">
 *     <ws:stubTemplate>
 *         <div>
 *             {{startValue}} - {{endValue}}
 *         </div>
 *      </ws:stubTemplate>
 * </Controls.calendar:MonthList>
 * </pre>
 *
 * @see Controls/_calendar/interface/IMonthList#displayedRanges
 */

/**
 * @event Происходит после  отрисовки элементов с новыми загруженными данными.
 * @name Controls/_calendar/interface/IMonthList#enrichItems
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @example
 * В этом примере производим некоторые манипуляции с элементами, после того, как загрузились новые данные, и элементы перерисовались.
 * <pre class="brush: js">
 * protected _enrichItemsHandler() {
 *     this._doSomeStuffWithItems();
 * }
 * </pre>
 * <pre class="brush: html">
 * <Controls.calendar:MonthList on:enrichItems="_enrichItemsHandler()"/>
 * </pre>
 */
