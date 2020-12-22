/* eslint-disable */
define('Controls/interface/ISelectedCollection', [
], function() {
   /**
    * Интерфейс для выбора элементов из списка.
    * @interface Controls/interface/ISelectedCollection
    * @public
    * @author Герасимов А.М.
    */
   /*
    * Interface to select items from the list.
    * @interface Controls/interface/ISelectedCollection
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @name Controls/interface/ISelectedCollection#displayProperty
    * @cfg {String} Имя поля элемента, значение которого будет отображаться.
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    displayProperty="title" />
    * </pre>
    */
   /*
    * @name Controls/interface/ISelectedCollection#displayProperty
    * @cfg {String} Name of the item property which content will be displayed.
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    displayProperty="title" />
    * </pre>
    */
   
   /**
    * @name Controls/interface/ISelectedCollection#multiSelect
    * @cfg {Boolean} Включает режим множественного выбора значений.
    * @default false
    * @variant true Разрешён множественный выбор значений.
    * @variant false Можно выбрать только одно занчение. При выборе нового значения из справочника, оно перетирает старое.
    *
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    multiSelect="{{true}}" />
    * </pre>
    */
   /*
    * @name Controls/interface/ISelectedCollection#multiSelect
    * @cfg {Boolean} Enables multiple value selection mode.
    * @default false
    * @variant true You can select as many values as you want.
    * @variant false After selecting the first value, the input field disappears. When you select a new value from the directory, it grinds the old.
    *
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    multiSelect="{{true}}" />
    * </pre>
    */

   /**
    * @name Controls/interface/ISelectedCollection#maxVisibleItems
    * @cfg {Number} Максимальное количество элементов для отображения в поле выбора с автовысотой {@link multiLine}.
    * @default 7
    * @remark
    * Если элементов выбрано больше, чем указано в опции maxVisibleItems,
    * то эти элементы отображены не будут, их можно отобразить, если нажать на счётчик всех записей.
    * Актуально только в многострочном режиме.
    * @see Controls/interface/ISelectedCollection#multiSelect
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    multiSelect="{{true}}"
    *    maxVisibleItems="{{3}}" />
    * </pre>
    */
   /*
    * @name Controls/interface/ISelectedCollection#maxVisibleItems
    * @cfg {Integer} The maximum number of items to display, the rest will be hidden under the counter.
    * @default 7
    * @remark
    * Only relevant in multi line mode.
    * @see Controls/interface/ISelectedCollection#multiSelect
    *
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    multiSelect="{{true}}"
    *    maxVisibleItems="{{3}}" />
    * </pre>
    */

   /**
    * @name Controls/interface/ISelectedCollection#itemTemplate
    * @cfg {Function|String} Шаблон выбранного элемента.
    * @markdown
    * @remark
    * Базовый шаблон для Controls/lookup:Input и Controls.lookup:Selector: "Controls.lookup:ItemTemplate".
    * Базовый шаблон поддерживают такие параметры как:
    *     * contentTemplate {Function|String} - Шаблон содержимого элемента.
    *     * crossTemplate {Function|String} - Шаблон крестика удаления элемента.
    *     * displayProperty {String} - Имя поля, значение которого будет отображаться.
    *     * clickable {Boolean} - Определяет, показывать ли подчеркивание при наведении, допустим только в случае использования contentTemplate по умолчанию.
    *     * size {Enum} - Размер текста для содержимого элемента, допустим только в случае использования contentTemplate по умолчанию.
    *         * m
    *         * l
    *         * xl
    *         * 2xl
    *         * 3xl
    *     * style {Enum} - Стиль текста для содержимого элемента, допустим только в случае использования contentTemplate по умолчанию.
    *         * default
    *         * bold
    *         * accent
    *         * primary
    *
    * Если вы переопределите contentTemplate/crossTemplate, вы не будете уведомлены о событиях itemClick/crossClick.
    * Для правильной работы необходимо пометить свой контент классами:
    * 
    * * js-controls-SelectedCollection__item__caption
    * * js-controls-SelectedCollection__item__cross
    *
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    keyProperty="id">
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls.lookup:ItemTemplate"
    *          style="primary"
    *          size="xl"
    *          displayProperty="title"
    *          clickable="{{true}}"/>
    *    </ws:itemTemplate>
    * </Controls.lookup:Selector>
    * </pre>
    */
   /*
    * @name Controls/interface/ISelectedCollection#itemTemplate
    * @cfg {Function|String} Selected item template.
    * @remark
    * Base itemTemplate for Controls/lookup:Input и Controls.lookup:Selector: "Controls.lookup:ItemTemplate".
    * Base itemTemplate supports these parameters:
    *     * contentTemplate {Function|String} - Template for render item content.
    *     * crossTemplate {Function|String} - Template for render cross.
    *     * displayProperty {String} - Name of the item property which content will be displayed.
    *     * clickable {Boolean} - Specifies whether elements are clickable, adds an underscore when the element is hover, is only valid if the default value is used for the contentTemplate.
    *     * size {Enum} - The text size for the item content, is only valid if the default value is used for the contentTemplate.
    *         * m
    *         * l
    *         * xl
    *         * 2xl
    *         * 3xl
    *     * style {Enum} - The text style for the item content, is only valid if the default value is used for the contentTemplate.
    *         * default
    *         * bold
    *         * accent
    *         * primary
    *
    * If you reimplement contentTemplate/crossTemplate, you will not be notified of itemClick/crossClick events.
    * To work properly, you need to mark your content with classes:
    * 
    * * js-controls-SelectedCollection__item__caption
    * * js-controls-SelectedCollection__item__cross
    *
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    keyProperty="id">
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls.lookup:ItemTemplate"
    *          style="primary"
    *          size="xl"
    *          displayProperty="title"
    *          clickable="{{true}}"/>
    *    </ws:itemTemplate>
    * </Controls.lookup:Selector>
    * </pre>
    */

   /**
    * @event Происходит при изменении набора выбранной коллекции.
    * @name Controls/interface/ISelectedCollection#itemsChanged
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {RecordSet|List} items Список выбранных записей.
    *
    * @example
    * В следующем примере создается Controls/lookup:Selector и демонстрируется сценарий использования.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    keyProperty="id"
    *    on:itemsChanged="onItemsChanged()" />
    * </pre>
    * <pre>
    * // JavaScript
    * onItemsChanged: function(e, items) {
    *    this.prepareItems(items);
    * }
    * </pre>
    */
   /*
    * @event Occurs when changing the set of the selected collection.
    * @name Controls/interface/ISelectedCollection#itemsChanged
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {RecordSet|List} items List of selected entries.
    *
    * @example
    * The following example creates Controls/lookup:Selector and shows how to handle the event.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    keyProperty="id"
    *    on:itemsChanged="onItemsChanged()" />
    * </pre>
    * <pre>
    * // JavaScript
    * onItemsChanged: function(e, items) {
    *    this.prepareItems(items);
    * }
    * </pre>
    */

   /**
    * @event Происходит при нажатии на элемент коллекции.
    * @name Controls/interface/ISelectedCollection#itemClick
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {RecordSet} item Элемент выбраной коллекции.
    * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Дескриптор события мыши.
    *
    * @example
    * В следующем примере создается Controls/lookup:Selector и демонстрируется сценарий использования.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    keyProperty="id"
    *    on:itemClick="onItemClick()" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * openCard: function() {
    *    ...
    * },
    *
    * onItemClick: function(e, item) {
    *    this.openCard(item);
    * }
    * </pre>
    */
   /*
    * @event Occurs when clicking on a collection item.
    * @name Controls/interface/ISelectedCollection#itemClick
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {RecordSet} item Item selected collection.
    * @param {Vdom/Vdom:SyntheticEvent} nativeEvent Descriptor of the mouse event
    *
    * @example
    * The following example creates Controls/lookup:Selector and shows how to handle the event.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Selector
    *    source="{{_source}}"
    *    keyProperty="id"
    *    on:itemClick="onItemClick()" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * openCard: function() {
    *    ...
    * },
    *
    * onItemClick: function(e, item) {
    *    this.openCard(item);
    * }
    * </pre>
    */

   /**
    * @event Происходит перед открытием всплывающего окна со всеми выбранными записями.
    * @name Controls/interface/ISelectedCollection#openInfoBox
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Object} config Конфиг, по которому будет построено всплывающее окно.
    *
    * @example
    * В следующем примере создается Controls/lookup:Input и демонстрируется сценарий использования.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Input
    *    source="{{_source}}"
    *    keyProperty="id"
    *    searchParam="title"
    *    on:openInfoBox="_openInfoBox()" />
    * </pre>
    * <pre>
    * // JavaScript
    * _openInfoBox: function(e, config) {
    *    config.maxWidth = 500;
    *    config.templateOptions.items = new collection.List({
    *    items: Chain(config.templateOptions.items).sort(function() {
    *       }).value()
    *    })
    * }
    * </pre>
    *
    * @see Controls/interface/ISelectedCollection#closeInfoBox
    */
   /*
    * @event Occurs before opening a pop-up with all selected entries
    * @name Controls/interface/ISelectedCollection#openInfoBox
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {Object} config Config on which popup will be built.
    *
    * @example
    * The following example creates Controls/lookup:Input and shows how to handle the event.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Input
    *    source="{{_source}}"
    *    keyProperty="id"
    *    searchParam="title"
    *    on:openInfoBox="_openInfoBox()" />
    * </pre>
    * <pre>
    * // JavaScript
    * _openInfoBox: function(e, config) {
    *    config.maxWidth = 500;
    *    config.templateOptions.items = new collection.List({
    *    items: Chain(config.templateOptions.items).sort(function() {
    *       }).value()
    *    })
    * }
    * </pre>
    *
    * @see Controls/interface/ISelectedCollection#closeInfoBox
    */

   /**
    * @event Происходит при закрытии всплывающего окна со всеми выбранными записями.
    * @name Controls/interface/ISelectedCollection#closeInfoBox
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    *
    * @example
    * В следующем примере создается Controls/lookup:Input и демонстрируется сценарий использования.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Input
    *    source="{{_source}}"
    *    keyProperty="id"
    *    searchParam="title"
    *    on:closeInfoBox="_closeInfoBox()" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * _closeInfoBox: function() {
    *    this._isOpenInfoBox = false;
    * }
    * </pre>
    *
    * @see Controls/interface/ISelectedCollection#openInfoBox
    */
   /*
    * @event Occurs when closing a pop-up with all selected entries.
    * @name Controls/interface/ISelectedCollection#closeInfoBox
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    *
    * @example
    * The following example creates Controls/lookup:Input and shows how to handle the event.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.lookup:Input
    *    source="{{_source}}"
    *    keyProperty="id"
    *    searchParam="title"
    *    on:closeInfoBox="_closeInfoBox()" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * _closeInfoBox: function() {
    *    this._isOpenInfoBox = false;
    * }
    * </pre>
    *
    * @see Controls/interface/ISelectedCollection#openInfoBox
    */
});
