import {IControlOptions} from 'UI/Base';

/**
 * Интерфейс для опций всплывающих подсказок.
 *
 * @interface Controls/_popup/interface/IInfoBoxOptions
 * @public
 * @author Красильников А.С.
 */

export interface IInfoBoxOptions extends IControlOptions {
    targetSide?: string;
    position?: string; // old option.
    alignment?: string;
    style?: string;
    showDelay?: number;
    hideDelay?: number;
    trigger?: string;
    floatCloseButton?: boolean;
    template?: string;
    templateOptions?: any;
}

export interface IInfoBox {
    readonly '[Controls/_popup/interface/IInfoBox]': boolean;
}

/**
 * Метод открытия всплывающей подсказки.
 * @function Controls/_popup/interface/IInfoBoxOptions#open
 * @param {PopupOptions} popupOptions Опции всплывающей подсказки.
 * @see close
 */

/*
 * Open InfoBox
 * @function Controls/_popup/interface/IInfoBoxOptions#open
 * @param {PopupOptions} popupOptions InfoBox popup options.
 */

/**
 * @typedef {Object} PopupOptions
 * @description Конфигурация всплывающей подсказки.
 * @property {function|String} template Шаблон всплывающей подсказки
 * @property {Object} templateOptions Опции для контрола, переданного в {@link Controls/_popup/interface/IInfoBox#template template}.
 * @property {String} trigger Определяет, какое событие будет иницировать открытие и закрытие всплывающей подсказки.
 * @property {String} targetSide Сторона таргета, относительно которой будет позиционнироваться всплывающая подсказка.
 * @property {String} alignment Выравнивание всплывающей подсказки относительно вызывающего её элемента.
 * @property {Boolean} floatCloseButton  Определяет, будет ли контент обтекать кнопку закрытия.
 * @property {String} style Внешний вид всплывающей подсказки.
 * @property {Number} hideDelay Определяет задержку перед началом закрытия всплывающей подсказки. ( измеряется в миллисекундах)
 * @property {Number} showDelay Определяет задержку перед началом открытия всплывающей подсказки. ( измеряется в миллисекундах)
 */

/*
 * @typedef {Object} PopupOptions
 * @description InfoBox configuration.
 * @property {function|String} content The content to which the logic of opening and closing the template is added.
 * @property {function|String} template Template inside popup
 * @property {Object} templateOptions Template options inside popup.
 * @property {String} trigger Event name trigger the opening or closing of the template.
 * @property {String} targetSide
 * @property {String} alignment
 * @property {Boolean} floatCloseButton Whether the content should wrap around the cross closure.
 * @property {String} style InfoBox display style.
 * @property {Number} hideDelay Delay before closing.
 * @property {Number} showDelay Delay before opening.
 */

/**
 * Метод закрытия всплывающей подсказки
 * @function Controls/_popup/interface/IInfoBoxOptions#close
 * @see open
 */

/*
 * Сlose InfoBox
 * @function Controls/_popup/interface/IInfoBoxOptions#close
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#targetSide
 * @cfg {String} Сторона таргета, относительно которой будет позиционнироваться всплывающая подсказка.
 * @variant top Подсказка позиционируется сверху от таргета
 * @variant bottom Подсказка позиционируется снизу от таргета
 * @variant left Подсказка позиционируется слева от таргета
 * @variant right Подсказка позиционируется справа от таргета
 * @default top
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#targetSide
 * @cfg {String} Side positioning of the target relative to infobox.
 * Popup displayed on the top of the target.
 * @variant top Popup displayed on the top of the target.
 * @variant bottom Popup displayed on the bottom of the target.
 * @variant left Popup displayed on the left of the target.
 * @variant right Popup displayed on the right of the target.
 * @default top
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#alignment
 * @cfg {String} Выравнивание всплывающей подсказки относительно вызывающего её элемента.
 * @variant start Подсказка выравнивается от начала главной оси.
 * @variant center Подсказка выравнивается по центру главной оси.
 * @variant end Подсказка выравнивается от конца главной оси.
 * @default start
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#alignment
 * @cfg {String} Alignment of the infobox relative to target
 * Popup aligned by start of the target.
 * @variant start Popup aligned by start of the target.
 * @variant center Popup aligned by center of the target.
 * @variant end Popup aligned by end of the target.
 * @default start
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#hideDelay
 * @cfg {Number} Определяет задержку перед началом закрытия всплывающей подсказки.
 * Значение задаётся в миллисекундах.
 * @default 300
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#hideDelay
 * @cfg {Number} Delay before closing after mouse leaves. (measured in milliseconds)
 * @default 300
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#showDelay
 * @cfg {Number} Определяет задержку перед началом открытия всплывающей подсказки.
 * Значение задаётся в миллисекундах.
 * @default 300
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#showDelay
 * @cfg {Number} Delay before opening after mouse enters.(measured in milliseconds)
 * @default 300
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#content
 * @cfg {function|String} Элемент управления, к которому добавляется логика открытия и закрытия всплывающей подсказки.
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#content
 * @cfg {function|String} The content to which the logic of opening and closing the template is added.
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#template
 * @cfg {function|String} Шаблон всплывающей подсказки
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#template
 * @cfg {function|String} Popup template.
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#templateOptions
 * @cfg {Object} Опции для контрола, переданного в {@link template}
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#templateOptions
 * @cfg {Object} Popup template options.
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#trigger
 * @cfg {String} Определяет, какое событие будет иницировать открытие и закрытие всплывающей подсказки.
 * @variant click Открывается по клику на контент. Закрывается по клику вне контента или шаблона.
 * @variant hover Открывается по наведению мыши на контент. Закрывается по уходу мыши с шаблона и контента. Открытие игнорируется на тач - устройствах.
 * @variant hover|touch Открывается по наведению или по тачу на контент. Закрывается по уходу мыши с контента или с шаблона, а также по тачу вне контента или шаблона.
 * @variant demand  Разработчик октрывает и закрывает всплывающее окно вручную. Также подсказка закроется по клику вне шаблона или контента.
 * @default hover
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#trigger
 * @cfg {String} Event name trigger the opening or closing of the template.
 * @variant click Opening by click on the content. Closing by click not on the content or template.
 * @variant hover Opening by hover on the content. Closing by hover not on the content or template.
 * Opening is ignored on touch devices.
 * @variant hover|touch Opening by hover or touch on the content. Closing by hover not on the content or template.
 * @variant demand  Developer opens and closes InfoBox manually. Also it will be closed by click not on the content or template.
 * @default hover
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#floatCloseButton
 * @cfg {Boolean} Определяет, будет ли контент обтекать кнопку закрытия.
 * @default false
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#floatCloseButton
 * @cfg {Boolean} Whether the content should wrap around the cross closure.
 * @default false
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOptions#style
 * @cfg {String} Внешний вид всплывающей подсказки.
 * @variant default
 * @variant danger
 * @variant warning
 * @variant info
 * @variant secondary
 * @variant success
 * @variant primary
 * @default secondary
 */

/*
 * @name Controls/_popup/interface/IInfoBoxOptions#style
 * @cfg {String} Infobox display style.
 * @variant default
 * @variant danger
 * @variant warning
 * @variant info
 * @variant secondary
 * @variant success
 * @variant primary
 */
