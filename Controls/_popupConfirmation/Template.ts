/// <amd-module name='Controls/_popupConfirmation/Template' />
// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import * as template from 'wml!Controls/_popupConfirmation/template';

class Template extends Control {
   _notify: (event: string, params: [], config: { bubbling: boolean }) => void;
   _template = template;
   _size = null;

   close() {
      this._notify('close', [], { bubbling: true });
   }
}
export default Template;
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

/*
 * Base template of confirm dialog.
 * @class Controls/_popupConfirmation/Template
 * @extends Core/Control
 * @control
 * @public
 * @category Popup
 * @author Красильников А.С.
 * @mixes Controls/_popupConfirmation/Template/mixin
 * @demo Controls-demo/Popup/Templates/ConfirmationTemplatePG
 * @demo Controls-demo/PopupTemplate/Confirmation/Index
 */

/**
 * @name Controls/_popupConfirmation/Template#size
 * @cfg {String} Размер окна диалога.
 * @variant m
 * @variant l
 * @default m
 */

/*
 * @name Controls/_popupConfirmation/Template#size
 * @cfg {String} Confirmation size
 * @variant m
 * @variant l
 * @default m
 */

/**
 * @name Controls/_popupConfirmation/Template#style
 * @cfg {String} Стиль отображения окна диалога.
 * @variant default
 * @variant success
 * @variant danger
 */
/*
 * @name Controls/_popupConfirmation/Template#style
 * @cfg {String} Confirmation display style
 * @variant default
 * @variant success
 * @variant danger
 */

/**
 * @name Controls/_popupConfirmation/Template#bodyContentTemplate
 * @cfg {function|String} Основной контент окна диалога.
 */
/*
 * @name Controls/_popupConfirmation/Template#bodyContentTemplate
 * @cfg {function|String} Main content.
 */

/**
 * @name Controls/_popupConfirmation/Template#footerContentTemplate
 * @cfg {function|String} Контент футера окна диалога.
 */
/*
 * @name Controls/_popupConfirmation/Template#footerContentTemplate
 * @cfg {function|String} Content at the bottom of the confirm panel.
 */
/**
* Закрытие всплывающего окна диалога подтверждения.
* @function Controls/_popupConfirmation/Template#close
*/
/*
 * Close the dialog
 * @function Controls/_popupConfirmation/Template#close
 */