import {date as dateFormat} from 'Types/formatter';
import {descriptor} from 'Types/entity';
import {Base as dateUtil} from 'Controls/dateUtils';

/**
 * Интерфейс для контролов, которые отображают месяц.
 * @interface Controls/_calendar/interfaces/IMonth
 * @public
 * @author Красильников А.С.
 */

export default {
    getDefaultOptions: function () {
        return {

            /**
             * @name Controls/_calendar/interfaces/IMonth#month
             * @cfg {Date|String} Отображаемый месяц.
             * @remark
             * Строка должна быть формата ISO 8601.
             * Дата игнорируется.
             * @example
             * <pre class="brush: html">
             *     <option name="month">2015-03-07T21:00:00.000Z</option>
             * </pre>
             */
            month: dateUtil.getStartOfMonth(new Date()),

            /**
             * @name Controls/_calendar/interfaces/IMonth#showCaption
             * @cfg {Boolean} Видимость заголовка.
             * @remark
             * Если опция установлена в значение true, то заголовок отображается.
             * Формат данных, отображаемых в заголовке, задается в опции {@link captionFormat}.
             * @default false
             * @see captionFormat
             * @see captionTemplate
             */
            showCaption: false,

            /**
             * @name Controls/_calendar/interfaces/IMonth#captionFormat
             * @cfg {String} Формат заголовка.
             * @remark
             * Строка должна быть в формате поддерживаемым {@link Types/formatter:date}.
             * @default DD.MM.YY
             * @see showCaption
             * @see captionTemplate
             */
            captionFormat: dateFormat.FULL_MONTH,

            /**
             * @name Controls/_calendar/interfaces/IMonth#showWeekdays
             * @cfg {Boolean} Видимость подписей дней недели.
             * @remark
             * Если опция установлена в значение true, то дни недели отображаются.
             * @default true
             */
            showWeekdays: true,

            /**
             * @name Controls/_calendar/interfaces/IMonth#dayFormatter
             * @cfg {Function} Коллбэк функция вызываемая перед отображением дня. Используется для переопределения стандартного отображения дня.
             * @remark
             * Метод получает в аргумент объект даты.
             * Метод должен возвращать конфигурацию для отображения дня в виде объекта.
             * Возможные поля для конфигурации:
             *
             * * today - назначить число сегодняшней датой.
             * * readOnly - установить число в режим только для чтения.
             * * date - изменить дату.
             * * selectionEnabled - включить курсор при наведении на ячейку.
             * * weekend - назначить число выходным.
             * @default undefined
             * @demo Controls-demo/Calendar/MonthView/dayFormatter/Index
             */
            dayFormatter: undefined,

            /**
             * ENG
             * @typedef {String} Mode
             * @variant current Only the current month is displayed
             * @variant extended 6 weeks are displayed. The first week of the current month is complete,
             * the last week is complete and if the current month includes less than 6 weeks, then the weeks
             * of the next month are displayed.
             */

            /**
             * @name Controls/_calendar/interfaces/IMonth#mode
             * @cfg {String} Режим отображения месяца
             * @variant extended - расширенный режим, в котором будут отображены 6 недель
             * @variant current - отобразиться нынешний месяц
             * @default current
             */
            /**
             * ENG
             * @name Controls/_calendar/interfaces/IMonth#mode
             * @cfg {String} Month view mode
             * @default current
             */
            mode: 'current'

            /**
             * @name Controls/_calendar/interfaces/IMonth#dayHeaderTemplate
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
             * @name Controls/_calendar/interfaces/IMonth#captionTemplate
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
             * @see showCaption
             * @see captionFormat
             */
        };
    },

    getOptionTypes: function () {
        return {

            // month: types(Date),
            showCaption: descriptor(Boolean),
            captionFormat: descriptor(String),
            showWeekdays: descriptor(Boolean),
            dayFormatter: descriptor(Function),
            mode: descriptor(String).oneOf([
                'current',
                'extended'
            ])
        };
    }
};
