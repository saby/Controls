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
             * @default selector
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#viewMode
             * @cfg {ViewMode} Display view of control.
             */
            viewMode: 'selector',

            /**
             * @typedef {String} StyleMode
             * @description Стиль отображения контрола.
             * @variant secondary Стиль отображения "secondary" (см.{@link http://axure.tensor.ru/standarts/v7/%D1%88%D1%80%D0%B8%D1%84%D1%82%D1%8B__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_03_.html Axure}).
             * Используется по умолчанию, когда опция {@link viewMode} установлена в значения selector и link.
             * @variant info Стиль отображения "info" (см.{@link http://axure.tensor.ru/standarts/v7/%D1%88%D1%80%D0%B8%D1%84%D1%82%D1%8B__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_03_.html Axure}).
             */

            /*
             * @typedef {String} StyleMode
             * @variant secondary Default style for selector and link view mode. Control display as secondry style.
             * @variant info Style for selector and link view mode. Control display as info style.
             */

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#styleMode
             * @cfg {StyleMode} Стиль отображения контрола.
             * @default undefined
             * @deprecated Данная опция устарела. Вместо неё используйте {@link fontColorStyle}.
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#styleMode
             * @cfg {StyleMode} Display style of control. Different view modes support different styles.
             * @default undefined
             */
            styleMode: undefined,

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
            style: descriptor(String).oneOf([
                'default',
                'linkMain',
                'linkMain2',
                'linkAdditional',
                'secondary'
            ]),
            viewMode: descriptor(String).oneOf([
               'selector',
               'link',
               'label'
            ]),
            styleMode: descriptor(String).oneOf([
               'secondary',
               'info'
            ]),
            nextArrowVisibility: descriptor(Boolean),
            prevArrowVisibility: descriptor(Boolean),
            showDeleteButton: descriptor(Boolean),
            emptyCaption: descriptor(String),
            captionFormatter: descriptor(Function)
        };
    }
};
