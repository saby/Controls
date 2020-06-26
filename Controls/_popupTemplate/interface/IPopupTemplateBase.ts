/**
 * Базовый интерфейс для стандартных шаблонов окон.
 *
 * @interface Controls/_popupTemplate/interface/IPopupTemplateBase
 * @public
 * @author Красильников А.С.
 */

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
 * @cfg {String} Стиль отображения заголовка.
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

import {TemplateFunction} from 'UI/Base';
export interface IPopupTemplateBaseOptions {
    headerContentTemplate?: TemplateFunction;
    bodyContentTemplate?: TemplateFunction;
    footerContentTemplate?: TemplateFunction;
    headingCaption?: string;
    headingStyle?: string;
    headingSize?: string;
    headingFontSize?: string;
    headingFontColorStyle?: string;
    closeButtonVisibility?: boolean;
}

export default interface IPopupTemplateBase {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplateBase]': boolean;
}
