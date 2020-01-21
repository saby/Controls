import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupConfirmation/template';

/**
 * Базовый шаблон <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/confirmation/'>диалога подтверждения</a>.
 * @class Controls/_popupConfirmation/Template
 * @extends Core/Control
 * @control
 * @public
 * @category Popup
 * @author Красильников А.С.
 * @mixes Controls/_popupConfirmation/Template/mixin
 * @demo Controls-demo/Popup/Templates/ConfirmationTemplatePG
 * @demo Controls-demo/PopupTemplate/Confirmation/Footer/Index
 */

/**
 * @name Controls/_popupConfirmation/Template#size
 * @cfg {String} Размер окна диалога.
 * @variant s
 * @variant l
 * @default s
 */

/**
 * @name Controls/_popupConfirmation/Template#style
 * @cfg {String} Стиль отображения окна диалога.
 * @variant secondary
 * @variant success
 * @variant danger
 * @variant secondary
 */

/**
 * @name Controls/_popupConfirmation/Template#bodyContentTemplate
 * @cfg {function|String} Основной контент окна диалога.
 */

/**
 * @name Controls/_popupConfirmation/Template#footerContentTemplate
 * @cfg {function|String} Контент подвала окна диалога.
 */

/**
 * Закрытие окна диалога подтверждения.
 * @function Controls/_popupConfirmation/Template#close
 */

type TStyle = 'default' | 'danger' | 'secondary' | 'success' ;
type TSize = 's' | 'l';
interface IConfirmationTemplate extends IControlOptions {
   bodyContentTemplate?: TemplateFunction;
   footerContentTemplate?: TemplateFunction;
   size: TSize | string;
   style: TStyle;
}

class Template extends Control<IConfirmationTemplate> {
   protected _template: TemplateFunction = template;

   close(): void {
      this._notify('close', [], { bubbling: true });
   }

   static getDefaultOptions(): IConfirmationTemplate {
      return {
         size: 's',
         style: 'secondary'
      };
   }
}
export default Template;
