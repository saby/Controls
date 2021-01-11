import {Control} from 'UI/Base';
import template = require('wml!Controls/_masterDetail/List/List');

/**
 * Контрол используют в качестве контейнера для списочного контрола, который добавлен в шаблон {@link Controls/masterDetail:Base#master master}.
 * Он обеспечивает передачу текущей отмеченной записи в списке между списком и master'ом через всплывающее событие selectedMasterValueChanged.
 * @class Controls/_masterDetail/List
 * @extends UI/Base:Control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/MasterDetail/Demo
 */

   export = Control.extend({
      _template: template,
      _markedKeyChangedHandler: function(event, key) {
         this._notify('selectedMasterValueChanged', [key], {bubbling: true});
      }
   });

/**
 * @event Происходит при смене выбранной записи.
 * @name Controls/_masterDetail/List#selectedMasterValueChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} key Ключ выбранного элемента.
 */