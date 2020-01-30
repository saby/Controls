import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/CloseButton/CloseButton');
   /**
    * Кнопка для закрытия всплывающих окон и диалогов.
    * @class Controls/_popupTemplate/CloseButton
    * @extends Core/Control
    * @control
    * @public
    * @author Красильников А.С.
    * @demo Controls-demo/PopupTemplate/CloseButton/ViewModes/Index
    * @mixes Controls/_buttons/interface/IClick
    * @remark
    * См. <a href="/materials/demo-ws4-buttons">демо-пример</a>
    *
    */

   /**
    * @name Controls/_popupTemplate/CloseButton#viewMode
    * @cfg {String} Устанавливает вид отображения кнопки.
    * @variant toolButton Отображение как кнопки панели инструментов.
    * @variant link Отображение кнопки в виде ссылки.
    * @default toolButton
    * @example
    * Отображение в виде ссылки:
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="link"/>
    * </pre>
    * Отображение как кнопки панели инструментов:
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="toolButton"/>
    * </pre>
    */

   /**
    * @name Controls/_popupTemplate/CloseButton#transparent
    * @cfg {String} Определяет фон кнопки.
    * @variant true Кнопке будет установлен прозрачный фон.
    * @variant false Кнопка имеет фон по умолчанию для этого режима отображения и стиля.
    * @default true
    * @example
    * Кнопка "Закрыть" с прозрачным фоном:
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="toolButton" transparent="{{true}}"/>
    * </pre>
    * Кнопка "Закрыть" с непрозрачным фоном.
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="toolButton" transparent="{{false}}"/>
    * </pre>
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

export default CloseButton;
