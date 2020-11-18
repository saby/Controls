import {IControlOptions} from 'UI/Base';

/**
 * Интерфейс для опций окна предпросмотра.
 *
 * @interface Controls/_popup/interface/IPreviewerOptions
 * @public
 * @author Красильников А.С.
 */

export interface IPreviewerOptions extends IControlOptions {
    content?: Function;
    trigger: string;
    template?: string;
    templateOptions?: any;
    isCompoundTemplate?: boolean; // TODO Compatible
    targetPoint?: any; // why?
    direction?: any; // why?
    offset?: any; // why?
}

export interface IPreviewer {
    readonly '[Controls/_popup/interface/IPreviewer]': boolean;
}

/**
 * @name Controls/_popup/interface/IPreviewerOptions#content
 * @cfg {Content} Контент, при взаимодействии с которым открывается окно.
 */

/**
 * @name Controls/_popup/interface/IPreviewerOptions#template
 * @cfg {Content} Содержимое окна.
 */

/**
 * @name Controls/_popup/interface/IPreviewerOptions#trigger
 * @cfg {String} Название события, которое запускает открытие или закрытие окна.
 * @variant click Открытие кликом по контенту. Закрытие кликом "мимо" - не по контенту или шаблону.
 * @variant demand Закрытие кликом по контенту или шаблону.
 * @variant hover Открытие по ховеру - по наведению курсора на контент. Закрытие по ховеру - по навердению курсора на контент или шаблон.
 * @variant hoverAndClick Открытие по клику или ховеру на контент. Закрытие по клику или или ховеру "мимо" - не по контенту или шаблону.
 * @default hoverAndClick
 */

/**
 * @typedef {Object} direction
 * @property {vertical} vertical
 * @property {horizontal} horizontal
 */

/**
 * @typedef {Object} offset
 * @property {Number} vertical
 * @property {Number} horizontal
 */

/**
 * @typedef {Enum} vertical
 * @variant top
 * @variant bottom
 * @variant center
 */

/**
 * @typedef {Enum} horizontal
 * @variant left
 * @variant right
 * @variant center
 */

/**
 * @name Controls/_popup/interface/IPreviewerOptions#direction
 * @cfg {direction} Устанавливает выравнивание всплывающего окна относительно точки позиционнирования.
 */

/**
 * @name Controls/_popup/interface/IPreviewerOptions#targetPoint
 * @cfg {direction} Точка позиционнирования всплывающего окна относительно вызывающего элемента.
 */

/**
 * @name Controls/_popup/interface/IPreviewerOptions#offset
 * @cfg {offset} Устанавливает отступы от точки позиционнирования до всплывающего окна
 */

/**
 * @name Controls/_popup/interface/IPreviewerOptions#templateOptions
 * @cfg {String|Function} Опции для контрола, переданного в {@link template}
 */

/*
 * @name Controls/_popup/interface/IPreviewerOptions#trigger
 * @cfg {String} Event name trigger the opening or closing of the template.
 * @variant click Opening by click on the content. Closing by click not on the content or template.
 * @variant demand Closing by click not on the content or template.
 * @variant hover Opening by hover on the content. Closing by hover not on the content or template.
 * @variant hoverAndClick Opening by click or hover on the content. Closing by click or hover not on the content or template.
 * @default hoverAndClick
 */

/**
 * @function
 * @name Controls/_popup/interface/IPreviewerOptions#close
 * @description Метод для закрытия всплывающего окна.
 * @remark Используется для закрытия окна, если опция {@link trigger} установлена в значении demand
 */

/**
 * @function
 * @name Controls/_popup/interface/IPreviewerOptions#open
 * @description Метод для открытия всплывающего окна.
 * @remark Используется для открытия окна, если опция {@link trigger} установлена в значении demand
 */
