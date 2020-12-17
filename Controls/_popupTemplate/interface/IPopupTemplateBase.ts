import {TemplateFunction} from 'UI/Base';
/**
 * Базовый интерфейс для стандартных шаблонов окон.
 *
 * @interface Controls/_popupTemplate/interface/IPopupTemplateBase
 * @public
 * @author Красильников А.С.
 */
export interface IPopupTemplateBaseOptions {
    headerContentTemplate?: TemplateFunction;
    bodyContentTemplate?: TemplateFunction;
    footerContentTemplate?: TemplateFunction;
    headingCaption?: string;
    headingFontSize?: string;
    headingFontColorStyle?: string;
    closeButtonVisibility?: boolean;
}

export default interface IPopupTemplateBase {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplateBase]': boolean;
}
/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#headerContentTemplate
 * @cfg {function|String} Контент, располагающийся между заголовком и крестиком закрытия.
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#bodyContentTemplate
 * @cfg {function|String} Основной контент шаблона, располагается под headerContentTemplate.
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#footerContentTemplate
 * @cfg {function|String} Контент, располагающийся в нижней части шаблона.
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#headingCaption
 * @cfg {String} Текст заголовка.
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#headingFontColorStyle
 * @cfg {String} Стиль отображения заголовка. Подробнее: {@link Controls/_interface/IFontColorStyle#fontColorStyle}
 * @default secondary
 * @see Controls.heading:Title#fontColorStyle
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#headingFontSize
 * @cfg {String} Размер заголовка
 * @default 3xl
 * @see Controls.heading:Title#fontSize
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplateBase#closeButtonVisibility
 * @cfg {Boolean} Определяет, будет ли отображаться кнопка закрытия
 * @default true
 */