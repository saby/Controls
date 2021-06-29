import rk = require('i18n!Controls');
import {descriptor} from 'Types/entity';

/**
 * Интерфейс для визуального отображения контрола {@link Controls/dateRange:DateSelector}.
 * @interface Controls/_dateRange/interfaces/ILinkView
 * @public
 * @author Красильников А.С.
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
            viewMode: 'selector',

            clickable: true,

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#nextArrowVisibility
             * @cfg {Boolean} Отображает стрелку перехода к следующему периоду.
             * @demo Controls-demo/dateRange/LiteSelector/ArrowVisibility/Index
             * @default false
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#nextArrowVisibility
             * @cfg {Boolean} Display the control arrow to switch to the next period
             * @default false
             */
            nextArrowVisibility: false,

            prevArrowVisibility: false,
            underline: 'hovered'

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#emptyCaption
             * @cfg {String} Отображаемый текст, когда в контроле не выбран период.
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#emptyCaption
             * @cfg {String} Text that is used if the period is not selected.
             */
        };
    },

    EMPTY_CAPTIONS: EMPTY_CAPTIONS,

    getOptionTypes: function () {
        return {
            nextArrowVisibility: descriptor(Boolean),
            prevArrowVisibility: descriptor(Boolean),
            emptyCaption: descriptor(String)
        };
    }
};
