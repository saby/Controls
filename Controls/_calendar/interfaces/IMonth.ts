import {date as dateFormat} from 'Types/formatter';
import {descriptor} from 'Types/entity';
import dateUtil = require('Controls/Utils/Date');

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
             * @cfg {Date|String} Месяц, с которого откроется календарь.
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
             * @cfg {String} Признак отображения заголовка.
             * @default false
             */
            showCaption: false,

            /**
             * @name Controls/_calendar/interfaces/IMonth#captionFormat
             * @cfg {String} Формат заголовка.
             * @remark
             * Строка должна быть в формате поддерживаемым {@link Types/formatter:date}.
             * @default DD.MM.YY
             */
            captionFormat: dateFormat.FULL_MONTH,

            /**
             * @name Controls/_calendar/interfaces/IMonth#showWeekdays
             * @cfg {Boolean} Если true, то дни недели отображаются.
             * @default true
             */
            showWeekdays: true,

            /**
             * @name Controls/_calendar/interfaces/IMonth#dayFormatter
             * @cfg {Function} Возможность поменять конфигурацию для дня.
             * В функцию приходит объект даты.
             * Опция необходима для производственных каленадарей.
             * @default undefined
             */
            dayFormatter: undefined,

            /**
             * @typedef {String} Mode
             * @variant current Only the current month is displayed
             * @variant extended 6 weeks are displayed. The first week of the current month is complete,
             * the last week is complete and if the current month includes less than 6 weeks, then the weeks
             * of the next month are displayed.
             */

            /**
             * @name Controls/_calendar/interfaces/IMonth#mode
             * @cfg {String} Month view mode
             * @default current
             */
            mode: 'current'
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
