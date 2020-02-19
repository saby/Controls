/* eslint-disable */
define('Controls/interface/ISelectorDialog', [
], function() {
   /**
    * Интерфейс для контролов, открывающих диалоговое окно выбора.
    * @interface Controls/interface/ISelectorDialog
    * @public
    * @author Герасимов А.М.
    */
   /*
    * Interface for controls that open selector dialog.
    * @interface Controls/interface/ISelectorDialog
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @name Controls/interface/ISelectorDialog#selectorTemplate
    * @cfg {SelectorTemplate} Настройки окна выбора.
    * @example
    * В следующем примере создадем Controls.lookup:Input, ему указываем selectorTemplate.
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
   /*
    * @name Controls/interface/ISelectorDialog#selectorTemplate
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
    * @event Controls/_interface/ISelectorDialog#selectorCallback Происходит при выборе элементов из справочника.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {RecordSet} initialItems Список выбранных элементов, перед открытием справочника.
    * @param {RecordSet} newItems Список выбранных элементов, после выбора из справочника.
    * @remark
    * Список выбранных элементов можно заменить, если из обработчика вернуть новую коллекцию.
    *
    * @example
    * В следующем примере создается Controls/lookup:Input и демонстрируется сценарий использования.
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
    *       // Вернем новую коллекцию
    *       return resultRS;
    *    }
    * </pre>
    */
   /*
    * @event Controls/_interface/ISelectorDialog#selectorCallback Occurs when selected items with selector.
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
    * @typedef {Object} SelectorTemplate
    * @property {Function} templateName Шаблон панели выбора элементов.
    * @property {Object} templateOptions Параметры шаблона всплывающего окна.
    * @property {Object} popupOptions Параметры всплывающего окна.
    */
   /*
    * @typedef {Object} SelectorTemplate
    * @property {Function} templateName Items selection panel template.
    * @property {Object} templateOptions Popup template options.
    * @property {Object} popupOptions Stack popup options.
    */
});
