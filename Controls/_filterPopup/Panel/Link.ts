import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_filterPopup/Panel/Link/Link');

/**
 * Кнопка-ссылка на панели фильтров.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления</a>
 * 
 * @class Controls/_filterPopup/Panel/Link
 * @extends Core/Control
 * @control
 * @public
 * @author Золотова Э.Е.
 * @example
 * Пример использования контрола на панели фильтра в блоке "Еще можно отобрать"
 * AdditionalItemTemplate.wml
 * <pre>
 *    <ws:template name="FIO">
 *       <Controls.filterPopup:Link caption="Author"/>
 *    </ws:template>
 *
 *    <ws:partial template="{{item.id}}" item="{{item}}"/>
 * </pre>
 */

/**
 * @name Controls/_filterPopup/Panel/Link#caption
 * @cfg {Object} Caption Текст кнопки-ссылки.
 */

/**
 * @event Controls/_filterPopup/Panel/Link#visibilityChanged Происходит при клике на элемент.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @remark
 * Событие уведомляет панель, что необходимо переместить контрол в основной блок.
 * @example
 * Пример использования контрола на панели фильтра
 * <pre>
 *    <Controls.filterPopup:Link caption="Author" on:visibilityChanged="_visibilityChangedHandler()"/>
 * </pre>
 *
 * <pre>
 *     private _visibilityChangedHandler(event, value) {
 *          if (options.isVisibleUpdate) {
 *              this._notify('visibilityChanged', [value]);
 *          }
 *     }
 * </pre>
 */

class FilterLink extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected  _clickHandler(): void {
      this._notify('visibilityChanged', [true]);
   }

   static _theme: string[] = ['Controls/filterPopup'];
}

export default FilterLink;
