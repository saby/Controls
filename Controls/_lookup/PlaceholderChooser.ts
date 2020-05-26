import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/PlaceholderChooser/PlaceholderChooser');
import collection = require('Types/collection');

/**
 * Обертка над "Lookup", которая следит за изменениями выбранных записей, и на основании них отдает один из возможных заранее сформированных "placeholders".
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less">переменные тем оформления</a>
 * 
 * @class Controls/_lookup/PlaceholderChooser
 * @control
 * @extends Core/Control
 * @public
 * @author Герасимов А.М.
 */

/**
 * @name Controls/_lookup/PlaceholderChooser#placeholders
 * @cfg {Object} Подсказки для поля, которые выбираются с помощью {@link placeholderKeyCallback}
 * Задаются, как обьект вида ключ - подсказка.
 * @example
 * WML:
 * <pre>
 * <Controls.lookup:PlaceholderChooser placeholderKeyCallback="{{_placeholderKeyCallback}}">
 *     <ws:placeholders>
 *         <ws:tasks>
 *             Выберите <Controls.lookup:Link caption="производителя" on:click="_showSelectorCustomPlaceholder('tasks')"/>
 *         </ws:tasks>
 *         <ws:employees>
 *             Выберите <Controls.lookup:Link caption="сотрудника" on:click="showSelectorCustomPlaceholder('employees')"/>
 *         </ws:employees>
 *     </ws:placeholders>
 *     <ws:content>
 *         <Controls.lookup:Input name='lookup'>
 *             ...
 *         </Controls.lookup:Input>
 *     <ws:content>
 * </Controls.lookup:PlaceholderChooser>
 * </pre>
 *
 * TS:
 * <pre>
 * protected _beforeMount():void {
 *    this._placeholderKeyCallback = this._placeholderKeyCallback.bind(this);
 * }
 *
 * private _placeholderKeyCallback(items):string {
 *      let placeholderKey;
 *
 *      if (items.at(0).get('isTask')) {
 *          placeholderKey = 'tasks';
 *      } else {
 *          placeholderKey = 'employees';
 *      }
 *
 *      return placeholderKey;
 * }
 *
 * private _showSelectorCustomPlaceholder(event):void {
 *     this._children.lookup.showSelector()
 * }
 * </pre>
 */

/**
 * @name Controls/_lookup/PlaceholderChooser#placeholderKeyCallback
 * @cfg {Function} Функция обратного вызова для получения идентификатора подскази.
 * @example
 * WML:
 * <pre>
 * <Controls.lookup:PlaceholderChooser placeholderKeyCallback="{{_placeholderKeyCallback}}">
 *     <ws:placeholders>
 *         <ws:tasks>
 *             Выберите <Controls.lookup:Link caption="производителя" on:click="_showSelectorCustomPlaceholder('tasks')"/>
 *         </ws:tasks>
 *         <ws:employees>
 *             Выберите <Controls.lookup:Link caption="сотрудника" on:click="showSelectorCustomPlaceholder('employees')"/>
 *         </ws:employees>
 *     </ws:placeholders>
 *     <ws:content>
 *         <Controls.lookup:Input name='lookup'>
 *             ...
 *         </Controls.lookup:Input>
 *     <ws:content>
 * </Controls.lookup:PlaceholderChooser>
 * </pre>
 *
 * TS:
 * <pre>
 * protected _beforeMount():void {
 *    this._placeholderKeyCallback = this._placeholderKeyCallback.bind(this);
 * }
 *
 * private _placeholderKeyCallback(items):string {
 *      let placeholderKey;
 *
 *      if (items.at(0).get('isTask')) {
 *          placeholderKey = 'tasks';
 *      } else {
 *          placeholderKey = 'employees';
 *      }
 *
 *      return placeholderKey;
 * }
 *
 * private _showSelectorCustomPlaceholder(event):void {
 *     this._children.lookup.showSelector()
 * }
 * </pre>
 */
/*
 * A wrapper over the "Lookup" that monitors changes to the selected entries, and on the basis of them gives one of the possible pre-formed "placeholders".
 * @class Controls/_lookup/PlaceholderChooser
 * @control
 * @extends Core/Control
 * @public
 * @author Kapustin I.A.
 */

var _private = {
    getPlaceholder: function(items, placeholders, placeholderKeyCallback) {
        return placeholders[placeholderKeyCallback(items)];
    }
};

var PlaceholderChooser = Control.extend({
    _template: template,
    _placeholder: '',

    _beforeMount: function(options) {
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._placeholder = _private.getPlaceholder(new collection.List(), options.placeholders, options.placeholderKeyCallback);
    },

    _itemsChanged: function(event, items) {
        this._placeholder = _private.getPlaceholder(items, this._options.placeholders, this._options.placeholderKeyCallback);
    },

    _dataLoadCallback: function(items) {
        this._placeholder = _private.getPlaceholder(items, this._options.placeholders, this._options.placeholderKeyCallback);
        this._forceUpdate();
    }
});

PlaceholderChooser._private = _private;

export = PlaceholderChooser;
