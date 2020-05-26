import Control = require('Core/Control');
import template = require('wml!Controls/_operations/Container/Container');

/**
 * Контейнер для списочных контролов.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/Container
 * @extends Core/Control
 * @control
 * @author Авраменко А.С.
 * @public
 */

/*
 * Container for list components.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 *
 * @class Controls/_operations/Container
 * @extends Core/Control
 * @control
 * @author Авраменко А.С.
 * @public
 */ 

/**
 * @event Controls/_operations/Container#listSelectedKeysChanged Происходит при изменении набора выбранных ключей.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array} selectedKeys Массив ключей выбранных элементов.
 * @param {Array} added Массив ключей, добавленных в выборку.
 * @param {Array} deleted Массив удаленных из выборки ключей.
 */

/*
 * @event Controls/_operations/Container#listSelectedKeysChanged Occurs when selected keys were changed.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Array} selectedKeys Array of selected items' keys.
 * @param {Array} added Array of added keys in selection.
 * @param {Array} deleted Array of deleted keys in selection.
 */

/**
 * @event Controls/_operations/Container#listExcludedKeysChanged Происходит при изменении набора ключей, исключенных из выборки.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор событий.
 * @param {Array} selectedKeys Массив ключей выбранных элементов.
 * @param {Array} added Массив ключей, добавленных в выборку.
 * @param {Array} deleted Массив удаленных из выборки ключей.
 */

/*
 * @event Controls/_operations/Container#listExcludedKeysChanged Occurs when excluded keys were changed.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Array} selectedKeys Array of selected items' keys.
 * @param {Array} added Array of added keys in selection.
 * @param {Array} deleted Array of deleted keys in selection.
 */

var MultiSelector = Control.extend({
    _template: template,

    _notifyHandlerWithBubbling: function (e, eventName) {
        return this._notify(eventName, Array.prototype.slice.call(arguments, 2), {
            bubbling: true
        });
    }
});

export = MultiSelector;
