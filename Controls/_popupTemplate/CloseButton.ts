import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/CloseButton/CloseButton');
import 'css!Controls/popupTemplate';
/**
 * Кнопка для закрытия всплывающих окон и диалогов.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/CloseButton
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/PopupTemplate/CloseButton/ViewModes/Index
 * @mixes Controls/buttons:IClick
 *
 */

class CloseButton extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   static getDefaultOptions(): object {
      return {
         viewMode: 'toolButton'
      };
   }
}

Object.defineProperty(CloseButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return CloseButton.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/CloseButton#viewMode
 * @cfg {String} Устанавливает вид отображения кнопки.
 * @variant toolButton Отображение как кнопки панели инструментов.
 * @variant linkButton Отображение кнопки в виде ссылки.
 * @variant functionalButton Отображение функциональной кнопки закрытия
 * @default toolButton
 * @example
 * Отображение в виде ссылки:
 * <pre class="brush: html">
 * <Controls.popupTemplate:CloseButton viewMode="linkButton"/>
 * </pre>
 * Отображение как кнопки панели инструментов:
 * <pre class="brush: html">
 * <Controls.popupTemplate:CloseButton viewMode="toolButton"/>
 * </pre>
 *
 * Отображение функциональной кнопки закрытия:
 * <pre>
 *    <Controls.popupTemplate:CloseButton viewMode="functionalButton"/>
 * </pre>
 */
export default CloseButton;
