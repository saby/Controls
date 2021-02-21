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

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#prevArrowVisibility
             * @cfg {Boolean} Отображает стрелку перехода к предыдущему периоду.
             * @demo Controls-demo/dateRange/LiteSelector/ArrowVisibility/Index
             * @default false
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#prevArrowVisibility
             * @cfg {Boolean} Display the control arrow to switch to the previous period
             * @default false
             */
            prevArrowVisibility: false

            /**
             * @name Controls/_dateRange/interfaces/ILinkView#emptyCaption
             * @cfg {String} Отображаемый текст, когда в контроле не выбран период.
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#emptyCaption
             * @cfg {String} Text that is used if the period is not selected.
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#resetStartValue
             * @cfg {Date} Начало периода, которое будет установлено после сброса значения
             * @remark
             * При использовании опции, рядом с контролом появится крестик, нажав на который, пользователь перейдет к
             * периоду, указанному в resetStartValue и resetEndValue. Если задана только resetEndValue - resetStartValue
             * будет установлен как null.
             * @demo Controls-demo/dateRange/RangeSelector/ResetValues/Index
             * @see Controls/_dateRange/interfaces/ILinkView#resetEndValue
             */

            /*
             * @name Controls/_dateRange/interfaces/ILinkView#resetEndValue
             * @cfg {Date} Конец периода, которое будет установлено после сброса значения
             * @remark
             * При использовании опции, рядом с контролом появится крестик, нажав на который, пользователь перейдет к
             * периоду, указанному в resetStartValue и resetEndValue. Если задана только resetStartValue - resetEndValue
             * будет установлен как null.
             * @demo Controls-demo/dateRange/RangeSelector/ResetValues/Index
             * @see Controls/_dateRange/interfaces/ILinkView#resetStartValue
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
            nextArrowVisibility: descriptor(Boolean),
            prevArrowVisibility: descriptor(Boolean),
            emptyCaption: descriptor(String)
        };
    }
};
