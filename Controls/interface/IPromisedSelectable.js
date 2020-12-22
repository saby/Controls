/* eslint-disable */
define('Controls/interface/IPromisedSelectable', [
], function() {

   /**
    * Интерфейс для поддержки выбора элементов в списках, где одновременно можно выбрать несколько элементов и количество выбранных элементов неизвестно. Этот интерфейс подходит для деревьев или списков с бесконечным скроллом, где пользователь может выбрать элементы, которые еще не загружены (например, через Панель управления).
    * @interface Controls/interface/IPromisedSelectable
    * @public
    * @author Авраменко А.С.
    * @see Controls/_interface/ISingleSelectable
    * @see Controls/interface/IMultiSelectable
    */

   /*
    * Interface for item selection in lists where multiple items can be selected at a time and the number of selected items is unknown. This interface is suitable for trees or lists with infinite scrolling where user can select items which are not loaded yet (e.g. through operations panel).
    * @interface Controls/interface/IPromisedSelectable
    * @public
    * @author Авраменко А.С.
    * @see Controls/_interface/ISingleSelectable
    * @see Controls/interface/IMultiSelectable
    */

   /**
    * @typedef {Object} Selection
    * @property {Array.<Number|String>} selection.selected Массив выбранных ключей.
    * @property {Array.<Number|String>} selection.excluded Массив исключенных ключей.
    * @see Controls/_interface/ISource#keyProperty
    * @see selectedKeys
    * @see excludedKeys
    */

   /*
    * @typedef {Object} Selection
    * @property {Array.<Number|String>} selection.selected Array of selected keys.
    * @property {Array.<Number|String>} selection.excluded Array of excluded keys.
    * @see Controls/_interface/ISource#keyProperty
    * @see selectedKeys
    * @see excludedKeys
    */

   /**
    * @name Controls/interface/IPromisedSelectable#selectedKeys
    * @cfg {Array.<Number|String>} Набор ключей выбранных элементов.
    * @demo Controls-demo/list_new/MultiSelect/AllSelected/Index В демо-примере по умолчанию выбраны все элементы.
    * @default []
    * @remark
    * Чтобы выбрать все элементы внутри узла, необходимо в selectedKeys передать значение {@link Controls/_interface/ISource#keyProperty keyProperty} этого узла.
    * Чтобы выбрать все элементы, необходимо в selectedKeys передать значение **[null]**.
    *
    * Следующее примечание актуально только при работе с {@link Controls/operations:Panel Панелью действий}. Если все элементы списочного контрола выбраны через кнопку "Отметить"->"Все", тогда опции **selectedKeys** и **excludedKeys** для плоских списков (см. {@link Controls/list:View Плоский список} и {@link Controls/grid:View Таблица}) будут установлены в значение **null**, а для иерархических (см. {@link Controls/treeGrid:View Дерево}, {@link Controls/tile:View Плитка} и {@link Controls/explorer:View Иерархический проводник}) — в значение **корень** (см. {@link Controls/explorer:IExplorer#root root}).
    * @example
    * В следующем примере создается список и выбираются все элементы, кроме двух. Последующие изменения, внесенные в selectedKeys и excludedKeys, будут <a href="/doc/platform/developmentapl/interface-development/ui-library/options/#sync">синхронизированы</a>, потому что использована директива bind.
    * <pre class="brush: html; highlight: [3,4]">
    * <!-- WML -->
    * <Controls.operations:Controller
    *     bind:selectedKeys="_selectedKeys"
    *     bind:excludedKeys="_excludedKeys" />
    * </pre>
    * <pre class="brush: js; highlight: [5,6]">
    * // JavaScript
    * _selectedKeys: null,
    * _excludedKeys: null,
    * _beforeMount: function() {
    *    this._selectedKeys = [null];
    *    this._excludedKeys = [1, 2];
    * }
    * </pre>
    * @see Controls/_interface/ISource#keyProperty
    * @see excludedKeys
    * @see selectedKeysChanged
    */

   /*
    * @name Controls/interface/IPromisedSelectable#selectedKeys
    * @cfg {Array.<Number|String>} Array of selected items' keys.
    * @demo Controls-demo/list_new/MultiSelect/AllSelected/Index
    * @default []
    * @remark
    * You can pass node's {@link Controls/_interface/ISource#keyProperty key property} to select every item inside that node. To select every item in the list you should pass [null].
    * @example
    * The following example creates List and selects everything except two items. Subsequent changes made to selectedKeys and excludedKeys will be synchronized through binding mechanism.
    * <pre class="brush: html; highlight: [3,4]">
    * <!-- WML -->
    * <Controls.operations:Controller
    *     bind:selectedKeys="_selectedKeys"
    *     bind:excludedKeys="_excludedKeys" />
    * </pre>
    * <pre class="brush: js; highlight: [5,6]">
    * // JavaScript
    * _selectedKeys: null,
    * _excludedKeys: null,
    * _beforeMount: function() {
    *    this._selectedKeys = [null];
    *    this._excludedKeys = [1, 2];
    * }
    * </pre>
    * @see Controls/_interface/ISource#keyProperty
    * @see excludedKeys
    * @see selectedKeysChanged
    */

   /**
    * @name Controls/interface/IPromisedSelectable#excludedKeys
    * @cfg {Array.<Number|String>} Набор ключей элементов, которые исключены из выборки.
    * @demo Controls-demo/list_new/MultiSelect/AllSelected/Index В демо-примере по умолчанию выбраны все элементы.
    * @default []
    * @remark
    * Узел будет отмечен как частично выбранный, если ключ любого из его дочерних элементов находится в excludedKeys. Такие узлы обычно отображаются с флагом в неопределенном состоянии рядом с ними.
    *
    * Следующее примечание актуально только при работе с {@link Controls/operations:Panel Панелью действий}.
    * Если все элементы списочного контрола выбраны через кнопку "Отметить"->"Все", тогда опции **selectedKeys** и **excludedKeys** для плоских списков (см. {@link Controls/list:View Плоский список} и {@link Controls/grid:View таблица}) будут установлены в значение **null**, а для иерархических (см. {@link Controls/treeGrid:View Дерево}, {@link Controls/tile:View Плитка} и {@link Controls/explorer:View Иерархический проводник}) — в значение **корень** (см. {@link Controls/explorer:IExplorer#root root}).
    * @example
    * В следующем примере создается список и выбираются все элементы, кроме двух. Последующие изменения, внесенные в selectedKeys и excludedKeys, будут синхронизированы посредством биндинга.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.operations:Controller
    *     bind:selectedKeys="_selectedKeys"
    *     bind:excludedKeys="_excludedKeys" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * _selectedKeys: null,
    * _excludedKeys: null,
    * _beforeMount: function() {
    *    this._selectedKeys = [null];
    *    this._excludedKeys = [1, 2];
    * }
    * </pre>
    * @see Controls/_interface/ISource#keyProperty
    * @see selectedKeys
    * @see excludedKeysChanged
    */

   /*
    * @name Controls/interface/IPromisedSelectable#excludedKeys
    * @cfg {Array.<Number|String>} Array of keys of items that should be excluded from the selection.
    * @demo Controls-demo/list_new/MultiSelect/AllSelected/Index
    * @default []
    * @remark
    * A node will be marked as partially selected if key of any of its children is in excludedKeys. Partially selected nodes are usually rendered with checkbox in indeterminate state near them.
    * @example
    * The following example creates List and selects everything except two items. Subsequent changes made to selectedKeys and excludedKeys will be synchronized through binding mechanism.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.operations:Controller
    *     bind:selectedKeys="_selectedKeys"
    *     bind:excludedKeys="_excludedKeys" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * _selectedKeys: null,
    * _excludedKeys: null,
    * _beforeMount: function() {
    *    this._selectedKeys = [null];
    *    this._excludedKeys = [1, 2];
    * }
    * </pre>
    * @see Controls/_interface/ISource#keyProperty
    * @see selectedKeys
    * @see excludedKeysChanged
    */

   /**
    * @event Происходит при изменении набора выбранных элементов списка.
    * @name Controls/interface/IPromisedSelectable#selectedKeysChanged
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<Number|String>} keys Массив ключей выбранных элементов.
    * @param {Array.<Number|String>} added Массив ключей, добавленных в selectedKeys.
    * @param {Array.<Number|String>} deleted Массив ключей, удаленных из selectedKeys.
    * @remark
    * Важно помнить, что мы не мутируем массив selectedKeys из опций. Таким образом, ключи в аргументах события и selectedKeys в параметрах компонента не являются одним и тем же массивом.
    * @example
    * В следующем примере создается список с пустым выбором. Последующие изменения, внесенные в selectedKeys и excludedKeys, будут синхронизированы посредством биндинга. Источник панели операций будет обновляться при каждом изменении в selectedKeys.
    * <pre class="brush: html">
    * <Controls.operations:Controller on:selectedKeysChanged="onSelectedKeysChanged()" bind:selectedKeys="_selectedKeys" bind:excludedKeys="_excludedKeys">
    *     <Controls.operations:Panel source="{{ _panelSource }} />
    * </Controls.operations:Controller>
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * _beforeMount: function() {
    *    this._selectedKeys = [];
    *    this._excludedKeys = [];
    * },
    * onSelectedKeysChanged: function(e, selectedKeys, added, deleted) {
    *    this._panelSource = this._getPanelSource(selectedKeys); //Note that we simultaneously have event handler and bind for the same option, so we don't have to update state manually.
    * }
    * </pre>
    * @see selectedKeys
    */

   /*
    * @event Occurs when selection was changed.
    * @name Controls/interface/IPromisedSelectable#selectedKeysChanged
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FMultiselectPG">Example</a>.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Array.<Number|String>} keys Array of selected items' keys.
    * @param {Array.<Number|String>} added Array of keys added to selectedKeys.
    * @param {Array.<Number|String>} deleted Array of keys deleted from selectedKeys.
    * @remark
    * It's important to remember that we don't mutate selectedKeys array from options (or any other option). So keys in the event arguments and selectedKeys in the component's options are not the same array.
    * @example
    * The following example creates List with empty selection. Subsequent changes made to selectedKeys and excludedKeys will be synchronized through binding mechanism. Source of the operations panel will be updated every time selectedKeys change.
    * <pre class="brush: html">
    * <Controls.operations:Controller on:selectedKeysChanged="onSelectedKeysChanged()" bind:selectedKeys="_selectedKeys" bind:excludedKeys="_excludedKeys">
    *     <Controls.operations:Panel source="{{ _panelSource }} />
    * </Controls.operations:Controller>
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * _beforeMount: function() {
    *    this._selectedKeys = [];
    *    this._excludedKeys = [];
    * },
    * onSelectedKeysChanged: function(e, selectedKeys, added, deleted) {
    *    this._panelSource = this._getPanelSource(selectedKeys); //Note that we simultaneously have event handler and bind for the same option, so we don't have to update state manually.
    * }
    * </pre>
    * @see selectedKeys
    */

   /**
    * @event Происходит при изменении набора исключенных из выбора элементов списка.
    * @name Controls/interface/IPromisedSelectable#excludedKeysChanged
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<Number|String>} keys Набор ключей элементов, которые должны быть исключены из выборки.
    * @param {Array.<Number|String>} added Массив ключей, добавленных в excludedKeys.
    * @param {Array.<Number|String>} deleted Массив ключей, удаленных из excludedKeys.
    * @remark
    * Важно помнить, что мы не мутируем массив selectedKeys из опций. Таким образом, ключи в аргументах события и selectedKeys в параметрах компонента не являются одним и тем же массивом.
    * @example
    * В следующем примере создается список с пустым выбором. Последующие изменения, внесенные в selectedKeys и excludedKeys, будут синхронизированы посредством биндинга. Источник панели операций будет обновляться при каждом изменении в excludedKeys.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.operations:Controller on:excludedKeysChanged="onExcludedKeysChanged()" bind:selectedKeys="_selectedKeys" bind:excludedKeys="_excludedKeys">
    *     <Controls.operations:Panel source="{{ _panelSource }} />
    * </Controls.operations:Controller>
    * </pre>
    * <pre class="brush: js">
    * // JavsScript
    * _beforeMount: function() {
    *    this._selectedKeys = [];
    *    this._excludedKeys = [];
    * },
    * onExcludedKeysChanged: function(e, excludedKeys, added, deleted) {
    *    this._panelSource = this._getPanelSource(excludedKeys); //Note that we simultaneously have event handler and bind for the same option, so we don't have to update state manually.
    * }
    * </pre>
    * @see excludedKeys
    */

   /*
    * @event Occurs when selection was changed.
    * @name Controls/interface/IPromisedSelectable#excludedKeysChanged
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FMultiselectPG">Example</a>.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Array.<Number|String>} keys Array of keys of items that should be excluded from the selection.
    * @param {Array.<Number|String>} added Array of keys added to excludedKeys.
    * @param {Array.<Number|String>} deleted Array of keys deleted from excludedKeys.
    * @remark
    * It's important to remember that we don't mutate excludedKeys array from options (or any other option). So keys in the event arguments and excludedKeys in the component's options are not the same array.
    * @example
    * The following example creates List with empty selection. Subsequent changes made to selectedKeys and excludedKeys will be synchronized through binding mechanism. Source of the operations panel will be updated every time excludedKeys change.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.operations:Controller on:excludedKeysChanged="onExcludedKeysChanged()" bind:selectedKeys="_selectedKeys" bind:excludedKeys="_excludedKeys">
    *     <Controls.operations:Panel source="{{ _panelSource }} />
    * </Controls.operations:Controller>
    * </pre>
    * <pre class="brush: js">
    * // JavsScript
    * _beforeMount: function() {
    *    this._selectedKeys = [];
    *    this._excludedKeys = [];
    * },
    * onExcludedKeysChanged: function(e, excludedKeys, added, deleted) {
    *    this._panelSource = this._getPanelSource(excludedKeys); //Note that we simultaneously have event handler and bind for the same option, so we don't have to update state manually.
    * }
    * </pre>
    * @see excludedKeys
    */


   /**
    * @event Происходит до изменения списка выбранных элементов.
    * @name Controls/interface/IPromisedSelectable#beforeSelectionChanged
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Controls/_multiselection/interface#ISelectionDifference} selectionDiff Изменение в списке выбранных элементов по сравнению с текущим выбором.
    * @return {Controls/_interface/ISelectionObject} Список выбранных элементов
    * @remark
    * Из обработчика события можно вернуть новый список выбранных элементов.
    * Либо можно вернуть промис с новым списком выбранных элементов.
    * В этом месте можно повлият на список выбранных элементов, но аналогичный нужно положить в опции
    */
});
