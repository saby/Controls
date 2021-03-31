import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_lookup/PlaceholderChooser/PlaceholderChooser';
import {List} from 'Types/collection';

/**
 * Обертка над "Lookup", которая следит за изменениями выбранных записей, и на основании них отдает один из возможных заранее сформированных "placeholders".
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less переменные тем оформления}
 *
 * @class Controls/_lookup/PlaceholderChooser
 *
 * @extends UI/Base:Control
 * @public
 * @author Герасимов А.М.
 */

export default class PlaceholderChooser extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _placeholder: string = '';

    protected _beforeMount(options): void {
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._placeholder = this._getPlaceholder(new List(), options.placeholders, options.placeholderKeyCallback);
    }

    protected _itemsChanged(event, items): void {
        this._placeholder = this._getPlaceholder(items, this._options.placeholders,
            this._options.placeholderKeyCallback);
    }

    protected _dataLoadCallback(items): void {
        this._placeholder = this._getPlaceholder(items, this._options.placeholders,
            this._options.placeholderKeyCallback);
        this._forceUpdate();
    }

    private _getPlaceholder(items, placeholders, placeholderKeyCallback): string {
        return placeholders[placeholderKeyCallback(items)];
    }
}
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
