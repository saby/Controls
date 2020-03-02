export interface ILookupOptions {
   dataLoadCallback?: Function;
}

/**
 * Интерфейс для полей и кнопок выбора.
 *
 * @interface Controls/_interface/ILookup
 * @public
 * @author Герасимов А.М.
 */
/*
 * Interface for fields and selection buttons.
 *
 * @interface Controls/_interface/ILookup
 * @public
 * @author Kapustin I.A.
 */
export default interface ILookup {
   readonly '[Controls/_interface/ILookup]': boolean;
}
/**
 * @name Controls/_interface/ILookup#dataLoadCallback
 * @cfg {Function} Функция обратного вызова, которая вызывается после загрузки данных.
 * @remark
 * dataLoadCallback принимает в качестве первого аргумента коллекцию загруженных элементов.
 * dataLoadCallback может использоваться для установки метаданных или настройки загруженных элементов.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Selector
 *          source="{{_source}}"
 *          dataLoadCallback="{{_myDataLoadCallback}}">
 *    </Controls.lookup:Selector>
 * </pre>
 * JS:
 * <pre>
 * _myDataLoadCallback = function(items) {
    *    items.each(function(item) {
    *       item.set(field, value);
    *    });
    * }
 * </pre>
 */
/*
 * @name Controls/_interface/ILookup#dataLoadCallback
 * @cfg {Function} Callback function that will be called when list data loaded by source
 * @remark
 * dataLoadCallback takes to first argument the collection of loaded items.
 * dataLoadCallback can be used for setting metadata or adjusting loaded items.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Selector
 *          source="{{_source}}"
 *          dataLoadCallback="{{_myDataLoadCallback}}">
 *    </Controls.lookup:Selector>
 * </pre>
 * JS:
 * <pre>
 * _myDataLoadCallback = function(items) {
 *    items.each(function(item) {
 *       item.set(field, value);
 *    });
 * }
 * </pre>
 */

/**
 * Открыть справочник.
 * @function Controls/_interface/ILookup#showSelector
 * @returns {Promise}
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Опции всплывающего окна.}
 *
 * @example
 * Откроем окно с заданными параметрами.
 * wml
 * <pre>
 *     <Controls.lookup:Input
 *           name="directoriesLookup"
 *           bind:selectedKeys="_selectedKeysDirectories"
 *           source="{{_source}}"
 *           searchParam="title"
 *           keyProperty="id">
 *        <ws:placeholder>
 *           Specify the
 *           <Controls.lookup:Link caption="department" on:click="showSelector('department')"/>
 *           and
 *           <Controls.lookup:Link caption="company" on:click="showSelector('company')"/>
 *        </ws:placeholder>
 *        <ws:selectorTemplate templateName="Engine-demo/Selector/FlatListSelectorWithTabs/FlatListSelectorWithTabs"/>
 *        <ws:suggestTemplate templateName="Controls-demo/Input/Lookup/Suggest/SuggestTemplate"/>
 *     </Controls.lookup:Input>
 * </pre>
 * js
 * <pre>
 *     Control.extend({
    *        ...
    *
    *        showSelector: function(selectedTab) {
    *            this._children.directoriesLookup.showSelector({
    *                templateOptions: {
    *                   selectedTab: selectedTab
    *                }
    *            });
    *        }
    *
    *        ...
    *
    *     });
 * </pre>
 */
/*
 * Open stack popup.
 * @function Controls/_interface/ILookup#showSelector
 * @returns {Promise}
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Stack popup options.}
 *
 * @example
 * Open stack with specified configuration.
 * wml
 * <pre>
 *     <Controls.lookup:Input
 *           name="directoriesLookup"
 *           bind:selectedKeys="_selectedKeysDirectories"
 *           source="{{_source}}"
 *           searchParam="title"
 *           keyProperty="id">
 *        <ws:placeholder>
 *           Specify the
 *           <Controls.lookup:Link caption="department" on:click="showSelector('department')"/>
 *           and
 *           <Controls.lookup:Link caption="company" on:click="showSelector('company')"/>
 *        </ws:placeholder>
 *        <ws:selectorTemplate templateName="Engine-demo/Selector/FlatListSelectorWithTabs/FlatListSelectorWithTabs"/>
 *        <ws:suggestTemplate templateName="Controls-demo/Input/Lookup/Suggest/SuggestTemplate"/>
 *     </Controls.lookup:Input>
 * </pre>
 * js
 * <pre>
 *     Control.extend({
 *        ...
 *
 *        showSelector: function(selectedTab) {
 *            this._children.directoriesLookup.showSelector({
 *                templateOptions: {
 *                   selectedTab: selectedTab
 *                }
 *            });
 *        }
 *
 *        ...
 *
 *     });
 * </pre>
 */

/**
 * @event Controls/_interface/ILookup#showSelector Происходит перед открытием справочника через интерфейс.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Опции всплывающего окна.}
 * @example
 * В следующем примере создается Controls/lookup:Input и демонстрируется сценарий использования.
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       on:showSelector="_showSelectorHandler()">
 *    </Controls.lookup:Input>
 * </pre>
 * JS:
 * <pre>
 *    _loadParams: function() {
 *       ...
 *    },
 *
 *    _showSelectorHandler: function(e, popupOptions) {
 *       var self = this;
 *
 *       this._loadParams(popupOptions).addCallback(function(newPopupOptions) {
 *          self.showSelector(newPopupOptions);
 *       });
 *
 *       // отменить открытие справочника
 *       return false;
 *    }
 * </pre>
 */
/*
 * @event Controls/_interface/ILookup#showSelector Occurs before opening the selector through the interface.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Object} popupOptions {@link Controls/_popup/Opener/Stack/PopupOptions.typedef Stack popup options.}
 * @example
 * The following example creates Controls/lookup:Input and shows how to handle the event.
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       on:showSelector="_showSelectorHandler()">
 *    </Controls.lookup:Input>
 * </pre>
 * JS:
 * <pre>
 *    _loadParams: function() {
 *       ...
 *    },
 *
 *    _showSelectorHandler: function(e, popupOptions) {
 *       var self = this;
 *
 *       this._loadParams(popupOptions).addCallback(function(newPopupOptions) {
 *          self.showSelector(newPopupOptions);
 *       });
 *
 *       // cancel the opening of the selector
 *       return false;
 *    }
 * </pre>
 */
