import rk = require('i18n!Controls');
import {descriptor} from 'Types/entity';
import dateControlsUtils from './../Utils';

/**
 * Интерфейс для быстрого выбора периода.
 * @interface Controls/_dateRange/interfaces/IPeriodLiteDialog
 * @public
 * @author Красильников А.С.
 */

/*
 * @interface Controls/_dateRange/interfaces/IPeriodLiteDialog
 * @public
 */
var EMPTY_CAPTIONS = {
    NOT_SPECIFIED: rk('Не указан'),
    NOT_SELECTED: rk('Не выбран'),
    WITHOUT_DUE_DATE: rk('Бессрочно', 'ShortForm'),
    ALL_TIME: rk('Весь период')
};

export default {
    getDefaultOptions: function () {
        return {

            /**
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseMonths
             * @cfg {Boolean} В значении false недоступен выбор месяца.
             * @default true
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseMonths
             * @cfg {Boolean} Sets the option to choose a month
             * @default true
             */
            chooseMonths: true,

            /**
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseQuarters
             * @cfg {Boolean} В значении false недоступен выбор квартала.
             * @default true
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseQuarters
             * @cfg {Boolean} Sets the option to choose a quarter
             * @default true
             */
            chooseQuarters: true,

            /**
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseHalfyears
             * @cfg {Boolean} В значении false недоступен выбор полугодия.
             * @default true
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseHalfyears
             * @cfg {Boolean} Sets the option to choose a half-year
             * @default true
             */
            chooseHalfyears: true,

            /**
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseYears
             * @cfg {Boolean} В значении false недоступен выбор года.
             * @default true
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#chooseYears
             * @cfg {Boolean} Sets the option to choose a year
             * @default true
             */
            chooseYears: true,

            /**
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#emptyCaption
             * @cfg {String} Отображаемый текст, когда в контроле не выбран период.
             * @default undefined
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#emptyCaption
             * @cfg {String} Text that is used if the period is not selected
             * @default undefined
             */
            emptyCaption: undefined,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#dialogClassName
             * @cfg {String} Имена классов, которые будут применены к шаблону всплывающего окна.
             * @default undefined
             */
            dialogClassName: undefined,
            // TODO: Доделать полноценную поддержку следующих опций. Пока не показываем их в документации.
            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedStart
             * @cfg {Date} Дата (месяц) начала установленного периода.
             *
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedStart
             * @cfg {Date} The date (month) of the beginning of the checked period
             *
             */
            checkedStart: undefined,

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedEnd
             * @cfg {Date} Дата (месяц) окончания установленного периода.
             *
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedEnd
             * @cfg {Date} The date(month) of the end of the checked period
             */
            checkedEnd: undefined,

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedIconCssClass
             * @cfg {String} CSS-класс, который будет установлен у выделенных иконок. По умолчанию это зеленая галочка.
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedIconCssClass
             * @cfg {String} The CSS class that will be set on the selected icons. The default is a green tick.
             */
            checkedIconCssClass: 'icon-Yes icon-done',

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#uncheckedIconCssClass
             * @cfg {String} CSS-класс, который будет установлен у невыделенных иконок. По умолчанию это серая галочка.
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#uncheckedIconCssClass
             * @cfg {String} A CSS class that will be set on unselected icons. The default is a gray tick.
             */
            uncheckedIconCssClass: 'icon-Yes icon-disabled',

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedIconTitle
             * @cfg {String} Подсказка, которая будет отображаться при наведении на выделенную иконку. По умолчанию всплывающая подсказка отсутствует.
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#checkedIconTitle
             * @cfg {String} A hint that will be displayed on the selected icons. By default, there is no tooltip.
             */
            checkedIconTitle: undefined,

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#uncheckedIconTitle
             * @cfg {String} Подсказка, которая будет отображаться при наведении на невыделенную иконку. По умолчанию всплывающая подсказка отсутствует.
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#uncheckedIconTitle
             * @cfg {String} A hint that will be displayed on the unselected icons. By default, there is no tooltip.
             * @noshow
             */
            uncheckedIconTitle: undefined,

            /**
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#iconsHandler
             * @cfg {Function} Устанавливает функцию, которая будет вызвана во время перерисовки компонента.
             * @remark
             * Аргументы функции:
             * <ol>
             *    <li>periods — Массив, содержащий массивы начала и окончания периода.</li>
             * </ol>
             * Функция должна возвращать массив логических элементов или объект, содержащий информацию об отображаемой иконке или Deffered'е, который запускает такой объект.
             * Если функция возвращает true, будет отображена иконка, соответствующая параметрам {@Link checkedIconCssClass} и {@Link checkedIconTitle}.
             * Если функция возвращает false, икноки будут отображены в соответствии с параметрами {@Link uncheckedIconCssClass} и {@Link uncheckedIconTitle}.
             * По умолчанию это зеленые и серые галочки.
             * Функция может возвращать объект, содержащий сведения о пользовательских окнах.
             * { iconClass: 'icon-Yes icon-done',
             *   title: 'Reporting period is closed'
             *   }
             *
             * @see updateIcons
             * @noshow
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#iconsHandler
             * @cfg {Function} Sets the function to be called when the component is repainted.
             * @remark
             * Function Arguments:
             * <ol>
             *    <li>periods — An array containing arrays from the beginning and end of the period</li>
             * </ol>
             * The function must return an array of Boolean elements or an object containing information about
             * the displayed icon {@link Icon} or Deferred, which fires such an object.
             * If the function returns true, the icon corresponding to the options {@Link checkedIconCssClass}
             * and {@Link checkedIconTitle} will be drawn. If false, the icons will match the options
             * {@Link uncheckedIconCssClass} and {@Link uncheckedIconTitle}.
             * By default, these are green and gray check marks.
             * The function can return an object containing information about custom windows.
             * { iconClass: 'icon-Yes icon-done',
             *   title: 'Reporting period is closed'
             *   }
             *
             * @see updateIcons
             */

            // iconsHandler: undefined,

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#itemTemplate
             * @cfg {String} Шаблон отображения года. Может принимать параметр monthCaptionTemplate — шаблон названия месяца.
             * Дата первого дня месяца и функция форматирования даты передаются в шаблон {@link Types/formatter:date}.
             * @example
             * <ws:itemTemplate>
             *    <ws:partial template="{{itemTemplate.defaultTemplate}}">
             *       <ws:monthCaptionTemplate>
             *          <ws:if data="{{month.getMonth() % 2 === 0}}">
             *             <div class="controls-PeriodLiteDialog__vLayoutItem-caption"
             *                  style="{{ (month.getMonth() % 4 === 0) ? 'color: red;' }}">
             *                {{ formatDate(month, "MMMM") }} !
             *             </div>
             *          </ws:if>
             *        </ws:monthCaptionTemplate>
             *    </ws:partial>
             * </ws:itemTemplate>
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#itemTemplate
             * @cfg {String} Template of the year. Can accept the option monthCaptionTemplate — template header
             * of the month. The date of the first day of the month and date formatting function are passed
             * to the template of the month {@link Types/formatter:date}.
             * @example
             * <ws:itemTemplate>
             *    <ws:partial template="{{itemTemplate.defaultTemplate}}">
             *       <ws:monthCaptionTemplate>
             *          <ws:if data="{{month.getMonth() % 2 === 0}}">
             *             <div class="controls-PeriodLiteDialog__vLayoutItem-caption"
             *                  style="{{ (month.getMonth() % 4 === 0) ? 'color: red;' }}">
             *                {{ formatDate(month, "MMMM") }} !
             *             </div>
             *          </ws:if>
             *        </ws:monthCaptionTemplate>
             *    </ws:partial>
             * </ws:itemTemplate>
             */

            /* That not to drag dependence on a template in all, the default value we set only in the PeriodLiteDialog
             * itemTemplate: undefined,
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#captionFormatter
             * @cfg {Function} Функция форматирования заголовка.
             * Аргументы функции:
             * <ol>
             *    <li>startValue — Начальное значение периода.</li>
             *    <li>endValue — Конечное значение периода.</li>
             *    <li>emptyCaption — Отображаемый текст, когда в контроле не выбран период.</li>
             * </ol>
             * @returns {String}
             * @example
             * WML:
             * <pre>
             * <Controls.dateRange:Selector captionFormatter="{{_captionFormatter}}" />
             * </pre>
             * JS:
             * <pre>
             * _captionFormatter: function(startValue, endValue, emptyCaption) {
             *    return 'Custom range format';
             * }
             * </pre>
             */

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#captionFormatter
             * @cfg {Function} Caption formatting function.
             */
            captionFormatter: dateControlsUtils.formatDateRangeCaption
        };
    },

    EMPTY_CAPTIONS: EMPTY_CAPTIONS,

    getOptionTypes: function () {
        return {
            chooseMonths: descriptor(Boolean),
            chooseQuarters: descriptor(Boolean),
            chooseHalfyears: descriptor(Boolean),
            chooseYears: descriptor(Boolean),
            emptyCaption: descriptor(String),
            captionFormatter: descriptor(Function)
        };
    }
};
