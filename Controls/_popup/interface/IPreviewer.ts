import {IControlOptions} from 'UI/Base';

/**
 * Интерфейс для опций окна предпросмотра.
 *
 * @interface Controls/_popup/interface/IPreviewer
 * @private
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
 * @name Controls/_popup/interface/IPreviewer#content
 * @cfg {Content} Контент, при взаимодействии с которым открывается окно.
 */
/*
 * @name Controls/_popup/interface/IPreviewer#content
 * @cfg {Content} The content to which the logic of opening and closing the mini card is added.
 */

/**
 * @name Controls/_popup/interface/IPreviewer#template
 * @cfg {Content} Содержимое окна.
 */
/*
 * @name Controls/_popup/interface/IPreviewer#template
 * @cfg {Content} Mini card contents.
 */

/**
 * @name Controls/_popup/interface/IPreviewer#trigger
 * @cfg {String} Название события, которое запускает открытие или закрытие окна.
 * @variant click Открытие кликом по контенту. Закрытие кликом "мимо" - не по контенту или шаблону.
 * @variant demand Закрытие кликом по контенту или шаблону.
 * @variant hover Открытие по ховеру - по наведению курсора на контент. Закрытие по ховеру - по навердению курсора на контент или шаблон.
 * @variant hoverAndClick Открытие по клику или ховеру на контент. Закрытие по клику или или ховеру "мимо" - не по контенту или шаблону.
 * @default hoverAndClick
 */
/**
 * @name Controls/_popup/interface/IPreviewer#trigger
 * @cfg {String} Event name trigger the opening or closing of the template.
 * @variant click Opening by click on the content. Closing by click not on the content or template.
 * @variant demand Closing by click not on the content or template.
 * @variant hover Opening by hover on the content. Closing by hover not on the content or template.
 * @variant hoverAndClick Opening by click or hover on the content. Closing by click or hover not on the content or template.
 * @default hoverAndClick
 */
