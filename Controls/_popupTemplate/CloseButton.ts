import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/CloseButton/CloseButton');
   /**
    * Кнопка для закрытия всплывающих окон и диалогов.
    *
    * @remark
    * Полезные ссылки:
    * * {@link /materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex демо-пример}
    * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
    *
    * @class Controls/_popupTemplate/CloseButton
    * @extends UI/Base:Control
    *
    * @public
    * @author Красильников А.С.
    * @demo Controls-demo/PopupTemplate/CloseButton/ViewModes/Index
    * @mixes Controls/_buttons/interface/IClick
    *
    */

class CloseButton extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   static _theme: string[] = ['Controls/popupTemplate'];

   static getDefaultOptions(): object {
      return {
         viewMode: 'toolButton',
         transparent: true
      };
   }
}
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

   /**
    * @name Controls/_popupTemplate/CloseButton#transparent
    * @cfg {Boolean} Определяет фон кнопки.
    * @variant true Кнопке будет установлен прозрачный фон.
    * @variant false Кнопка имеет фон по умолчанию для этого режима отображения и стиля.
    * @default true
    * @example
    * Кнопка "Закрыть" с прозрачным фоном:
    * <pre class="brush: html">
    * <Controls.popupTemplate:CloseButton viewMode="toolButton" transparent="{{true}}"/>
    * </pre>
    * Кнопка "Закрыть" с непрозрачным фоном.
    * <pre class="brush: html">
    * <Controls.popupTemplate:CloseButton viewMode="toolButton" transparent="{{false}}"/>
    * </pre>
    */
export default CloseButton;
