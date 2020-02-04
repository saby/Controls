import Control = require('Core/Control');
import template = require('wml!Controls/_masterDetail/List/List');

/**
 * Контрол используют в качестве контейнера для любого списочного контрола, который добавлен в шаблон {@link Controls/masterDetail:Base#master master}. Такой контейнер умеет порождать событие markedKeyChanged при смене выбранной записи списка.
 * @class Controls/_masterDetail/List
 * @extends UI/Base:Control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/MasterDetail/Demo
 */

/**
 * @event Происходит при смене выбранной записи.
 * @name Controls/_masterDetail/List#markedKeyChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} key  Ключ выбранного элемента.
 */

   export = Control.extend({
      _template: template,
      _markedKeyChangedHandler: function(event, key) {
         this._notify('selectedMasterValueChanged', [key], {bubbling: true});
      }
   });

