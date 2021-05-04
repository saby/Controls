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
            viewMode: descriptor(String).oneOf([
               'selector',
               'link',
               'label'
            ]),
            emptyCaption: descriptor(String)
        };
    }
};
