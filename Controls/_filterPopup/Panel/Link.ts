import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/Link/Link');
import 'css!theme?Controls/filterPopup';

/**
 * Кнопка-ссылка на панели фильтров.
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

/*
 * Control filter link
 * @class Controls/_filterPopup/Panel/Link
 * @extends Core/Control
 * @control
 * @public
 */

/**
 * @name Controls/_filterPopup/Panel/Link#caption
 * @cfg {Object} Caption Текст кнопки-ссылки.
 */

/*
 * @name Controls/_filterPopup/Panel/Link#caption
 * @cfg {Object} Caption
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

var FilterLink = Control.extend({
   _template: template,

   _clickHandler: function() {
      this._notify('visibilityChanged', [true]);
   }

});

export = FilterLink;
