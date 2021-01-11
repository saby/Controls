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
             * @demo Controls-demo/dateRange/LiteSelector/ChoosePeriod/Index
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
             * @demo Controls-demo/dateRange/LiteSelector/ChoosePeriod/Index
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
             * @demo Controls-demo/dateRange/LiteSelector/ChoosePeriod/Index
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
             * @demo Controls-demo/dateRange/LiteSelector/ChoosePeriod/Index
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
            emptyCaption: undefined

            /*
             * @name Controls/_dateRange/interfaces/IPeriodLiteDialog#itemTemplate
             * @cfg {String} Шаблон отображения года. Может принимать параметр monthCaptionTemplate — шаблон названия месяца.
             * Дата первого дня месяца и функция форматирования даты передаются в шаблон {@link Types/formatter:date}.
             * @example
             * <ws:itemTemplate>
             *    <ws:partial template="{{itemTemplate.defaultTemplate}}">
             *       <ws:monthCaptionTemplate>
             *          <ws:if data="{{month.getMonth() % 2 === 0}}">
             *             <div class="controls-PeriodLiteDialog__vLayoutItem-caption_theme-{{_options.theme}}"
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
             *             <div class="controls-PeriodLiteDialog__vLayoutItem-caption_theme-{{_options.theme}}"
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
        };
    },

    EMPTY_CAPTIONS: EMPTY_CAPTIONS,

    getOptionTypes: function () {
        return {
            chooseMonths: descriptor(Boolean),
            chooseQuarters: descriptor(Boolean),
            chooseHalfyears: descriptor(Boolean),
            chooseYears: descriptor(Boolean)
        };
    }
};
