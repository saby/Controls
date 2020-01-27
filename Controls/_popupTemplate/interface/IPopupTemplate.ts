/**
 * Интерфейс для стандартных шаблонов окон.
 *
 * @interface Controls/_popupTemplate/interface/IPopupTemplate
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplate#closeButtonViewMode
 * @cfg {String} Стиль отображения кнопки закрытия
 * @variant toolButton
 * @variant link
 * @default toolButton
 */

/**
 * @name Controls/_popupTemplate/interface/IPopupTemplate#closeButtonTransparent
 * @cfg {Boolean} Определяет прозрачность фона кнопки закрытия.
 * @default true
 */

import {IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
export interface IPopupTemplateOptions extends IPopupTemplateBaseOptions {
    closeButtonViewMode?: string;
    closeButtonTransparent?: boolean;
}

export default interface IPopupTemplate {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplate]': boolean;
}
