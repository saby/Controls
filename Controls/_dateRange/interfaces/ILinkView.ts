import rk = require('i18n!Controls');
import {descriptor} from 'Types/entity';
import dateControlsUtils from './../Utils';

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
            /**
             * @typedef {String} ViewMode
             * @description Режим отображения контрола.
             * @variant selector Режим отображения по умолчанию.
             * @variant link Отображение контрола в виде кнопки-ссылки.
             * @variant label Отображение контрола в виде метки.
             */

             /*
              * @typedef {String} ViewMode
              * @description Display view of control.
              * @variant selector Control display as default style.
              * @variant link Control display as link button.
              * @variant label Control display as lable.
              */

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#viewMode
             * @cfg {ViewMode} Режим отображения контрола.
             * @demo Controls-demo/Input/Date/RangeLinkView
             * @default selector
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#viewMode
             * @demo Controls-demo/Input/Date/RangeLinkView
             * @cfg {ViewMode} Display view of control.
             */
            viewMode: 'selector',

            clickable: true,

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#nextArrowVisibility
             * @cfg {Boolean} Отображает стрелку перехода к следующему периоду.
             * @default false
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#nextArrowVisibility
             * @cfg {Boolean} Display the control arrow to switch to the next period
             * @default false
             */
            nextArrowVisibility: false,

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#prevArrowVisibility
             * @cfg {Boolean} Отображает стрелку перехода к предыдущему периоду.
             * @default false
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#prevArrowVisibility
             * @cfg {Boolean} Display the control arrow to switch to the previous period
             * @default false
             */
            prevArrowVisibility: false,

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#clearButtonVisibility
             * @cfg {Boolean} Включает/отключает отображение кнопки "очистить период".
             * @default true
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#clearButtonVisibility
             * @cfg {Boolean} Enables or disables the display of the period clear button.
             * @default true
             */
            showDeleteButton: true,

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#emptyCaption
             * @cfg {String} Отображаемый текст, когда в контроле не выбран период.
             * @default Не указан
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#emptyCaption
             * @cfg {String} Text that is used if the period is not selected.
             */
            emptyCaption: EMPTY_CAPTIONS.NOT_SPECIFIED,

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#captionFormatter
             * @cfg {Function} Функция форматирования заголовка.
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#captionFormatter
             * @cfg {Function} Caption formatting function.
             */
            captionFormatter: dateControlsUtils.formatDateRangeCaption
        };
    },

    EMPTY_CAPTIONS: EMPTY_CAPTIONS,

    getOptionTypes: function () {
        return {
            viewMode: descriptor(String).oneOf([
               'selector',
               'link',
               'label'
            ]),
            nextArrowVisibility: descriptor(Boolean),
            prevArrowVisibility: descriptor(Boolean),
            showDeleteButton: descriptor(Boolean),
            emptyCaption: descriptor(String),
            captionFormatter: descriptor(Function)
        };
    }
};
