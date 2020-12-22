import {IStackPopupOptions} from 'Controls/popup';

export interface ISelectorDialogOptions {
   selectorTemplate: ISelectorTemplate;
   isCompoundTemplate?: boolean;
}

export interface ISelectorTemplate {
   templateName: string;
   templateOptions: object;
   popupOptions: IStackPopupOptions;
}

/**
 * Интерфейс для контролов, открывающих диалоговое окно выбора.
 * @public
 * @author Герасимов А.М.
 */

export default interface ISelectorDialog {
   readonly '[Controls/_interface/ISelectorDialog]': boolean;
}

/**
 * @name Controls/_interface/ISelectorDialog#selectorTemplate
 * @cfg {SelectorTemplate} Настройки окна выбора.
 * @example
 * В следующем примере создадем Controls.lookup:Input, ему указываем selectorTemplate.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.lookup:Input
 *    source="{{_source}}"
 *    searchParam="title"
 *    keyProperty="id">
 *    <ws:selectorTemplate templateName="Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector"
 *       templateOptions="{{_templateOptions}}"
 *       popupOptions="{{_popupOptions}}"/>
 * </Controls.lookup:Input>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount: function() {
 *    this._source = new Memory();
 *    this._templateOptions = {
 *       handlers: {
 *          onSelectComplete: function() {}
 *       }
 *    };
 *    this._popupOptions = {
 *       width: 400
 *    };
 * }
 * </pre>
 */
/*
 * @name Controls/_interface/ISelectorDialog#selectorTemplate
 * @cfg {SelectorTemplate[]} Directory config.
 * @example
 * In the following example, we will create a lookup by specifying selectorTemplate, before this we define the templateOptions and popupOptions value in advance.
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       searchParam="title"
 *       keyProperty="id"
 *       <ws:selectorTemplate templateName="Controls-demo/Input/Lookup/FlatListSelector/FlatListSelector"
 *                            templateOptions="{{_templateOptions}}"
 *                            popupOptions="{{_popupOptions}}"/>
 *    </Controls.lookup:Input>
 * </pre>
 * JS:
 * <pre>
 *    _beforeMount: function() {
 *       this._source = new Memory();
 *       this._templateOptions = {
 *          handlers: {
 *             onSelectComplete: function() {}
 *          }
 *       };
 *       this._popupOptions = {
 *          width: 400
 *       };
 *    }
 * </pre>
 */

/**
 * @event Происходит при выборе элементов из справочника.
 * @name Controls/_interface/ISelectorDialog#selectorCallback
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {RecordSet} initialItems Список выбранных элементов, перед открытием справочника.
 * @param {RecordSet} newItems Список выбранных элементов, после выбора из справочника.
 * @remark
 * Список выбранных элементов можно заменить, если из обработчика вернуть новую коллекцию.
 *
 * @example
 * В следующем примере создается Controls/lookup:Input и демонстрируется сценарий использования.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.lookup:Input
 *     source="{{_source}}"
 *     keyProperty="id"
 *     searchParam="title"
 *     on:selectorCallback="_selectorCallback()" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _selectorCallback: function(eventObject, initialItems, newItems) {
 *    let resultRS = newItems.clone();
 *    let countItems = resultRS.getCount();
 *
 *    if (countItems > 1) {
 *       resultRS.clear();
 *       resultRS.add(newItems.at(0));
 *    }
 *
 *    // Вернем новую коллекцию
 *    return resultRS;
 * }
 * </pre>
 */

/*
 * @event Occurs when selected items with selector.
 * @name Controls/_interface/ISelectorDialog#selectorCallback
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {RecordSet} initialItems List of selected items before opening the directory.
 * @param {RecordSet} newItemsThe list of selected items, after selecting from the directory.
 * @remark
 * The list of selected items can be replaced if a new collection is returned from the handler.
 *
 * @example
 * The following example creates Controls/lookup:Input and shows how to handle the event.
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       on:selectorCallback="_selectorCallback()">
 *    </Controls.lookup:Input>
 * </pre>
 * JS:
 * <pre>
 *    _selectorCallback: function(initialItems, newItems) {
 *       let resultRS = newItems.clone();
 *       let countItems = resultRS.getCount();
 *
 *       if (countItems > 1) {
 *          resultRS.clear();
 *          resultRS.add(newItems.at(0));
 *       }
 *
 *       // We will return a new collection
 *       return resultRS;
 *    }
 * </pre>
 */

/**
 * @typedef {String} SelectorMode
 * @variant stack Шаблон откроется на стековой панели
 * @variant dialog Шаблон откроется в диалоговом окне.
 * @default stack
 */

/**
 * @typedef {Object} SelectorTemplate
 * @property {Function} templateName Шаблон панели выбора элементов.
 * @property {Object} templateOptions Параметры шаблона всплывающего окна.
 * @property {Object} popupOptions Параметры всплывающего окна.
 * @property {SelectorMode} mode Режим отображения шаблона.
 */
/*
 * @typedef {Object} SelectorTemplate
 * @property {Function} templateName Items selection panel template.
 * @property {Object} templateOptions Popup template options.
 * @property {Object} popupOptions Stack popup options.
 */
