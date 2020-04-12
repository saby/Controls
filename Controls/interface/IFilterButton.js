/* eslint-disable */
define('Controls/interface/IFilterButton', [
], function() {

   /**
    * Интерфейс для поддержки просмотра и редактирования полей фильтра.
    * @interface Controls/interface/IFilterButton
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Provides a user interface for browsing and editing the filter fields.
    * @interface Controls/interface/IFilterButton
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @typedef {Boolean} Visibility
    * @remark
    * true - Редактор фильтров расположен в главном блоке.
    * false - Редактор фильтров расположен в дополнительном блоке.
    */

   /*
    * @typedef {Boolean} Visibility
    * @remark
    * true - The filter editor is located in the main block.
    * false - The filter editor is located in the additional block.
    */

   /**
    * @typedef {Object} FilterPanelItems
    * @property {String} id Имя поля фильтра.
    * @property {*} value Текущее значение поля фильтра.
    * @property {*} resetValue Значение поля при сбрасывании фильтра.
    * @property {String} textValue Текстовое значение поля фильтра. Используется для отображения текста у кнопки фильтра.
    * @property {String} resetTextValue Текстовое значение поля при сбрасывании фильтра. Рекомендуется использовать, если не передано свойство resetValue.
    * @property {Visibility} visibility Определяет, в каком блоке расположен редактор фильтров. Для редакторов фильтров, которые никогда не отображаются в блоке "Еще можно отобрать", указывать не нужно.
    */

   /*
    * @typedef {Object} FilterPanelItems
    * @property {String} id Name of filter field
    * @property {*} value Current filter field value
    * @property {*} resetValue Value for reset
    * @property {String} textValue Text value of filter field.  Used to display a textual representation of the filter
    * @property {String} resetTextValue Text value for reset. It is recommended to use if not set resetValue
    * @property {Visibility} visibility Defines in which block the filter editor is located. For filter editors that are never displayed in the "Also possible to select" section, you do not need to specify.
    */

   /**
    * @name Controls/interface/IFilterButton#items
    * @cfg {FilterPanelItems[]} Специальная структура для визуального представления фильтра.
    * @remark
    * Опция "value" каждого элемента будет передаваться в фильтр по "id" этого элемента.
    * Если параметр видимости не установлен, элемент фильтра всегда будет отображаться в главном блоке.
    * @example
    * Пример настройки опции "items" для двух фильтров.
    * Первый фильтр будет отображаться в главном блоке "Отбираются".
    * Второй фильтр будет отображаться в дополнительном блоке "Еще можно отобрать", так как для него установлено свойство visibility = false.
    * TMPL:
    * <pre>
    *    <Controls.filter:Selector
    *       items={{_items}}
    *       templateName="wml!MyModule/panelTemplate"/>
    * </pre>
    *
    * MyModule/panelTemplate.wml
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'] },
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false }
    *    ];
    * </pre>
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>Guide for setup Filter Button and Fast Filter</a>
    */

   /*
    * @name Controls/interface/IFilterButton#items
    * @cfg {FilterPanelItems[]} Special structure for the visual representation of the filter.
    * @remark
    * The "value" from every item will insert in filter by "id" of this item.
    * If visibility is not specified, the filter item will always be displayed in the main block.
    * @example
    * Example setting option "items" for two filters.
    * The first filter will be displayed in the main block "Selected"
    * The second filter will be displayed in the "Also possible to select" block, because the property is set for it visibility = false.
    * TMPL:
    * <pre>
    *    <Controls.filter:Selector
    *       items={{_items}}
    *       templateName="wml!MyModule/panelTemplate"/>
    * </pre>
    *
    * MyModule/panelTemplate.wml
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'] },
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false }
    *    ];
    * </pre>
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>Guide for setup Filter Button and Fast Filter</a>
    */

   /**
    * @name Controls/interface/IFilterButton#lineSpaceTemplate
    * @cfg {Function} Шаблон, который отрисовывается между кнопкой и текстовым представлением фильтра.
    * @remark
    * Например, в шаблоне можно разместить контрол выбора периода.
    * @example
    * Пример вставки быстрого выбора периода:
    * <pre>
    *    <Controls.filter:Selector
    *       templateName="wml!MyModule/panelTemplate"
    *       items="{{_items}}">
    *       <ws:lineSpaceTemplate>
    *          <Controls.dateRange:RangeShortSelector
    *             startValue="{{_startValue}}"
    *             endValue="{{_endValue}}"/>
    *       </ws:lineSpaceTemplate>
    *    </Controls.filter:Selector>
    * </pre>
    * @see Controls.dateRange:RangeShortSelector
    */

   /*
    * @name Controls/interface/IFilterButton#lineSpaceTemplate
    * @cfg {Function} Template for the space between the button and the string, that is formed by the values from items.
    * @remark
    * For example, here you can place a period selection control.
    * @example
    * Example of inserting a quick period selection
    * <pre>
    *    <Controls.filter:Selector
    *       templateName="wml!MyModule/panelTemplate"
    *       items="{{_items}}">
    *       <ws:lineSpaceTemplate>
    *          <Controls.dateRange:RangeShortSelector
    *             startValue="{{_startValue}}"
    *             endValue="{{_endValue}}"/>
    *       </ws:lineSpaceTemplate>
    *    </Controls.filter:Selector>
    * </pre>
    * @see Controls.dateRange:RangeShortSelector
    */

   /**
    * @name Controls/interface/IFilterButton#templateName
    * @cfg {String} Шаблон всплывающей панели, которая открывается после клика по кнопке.
    * @remark
    * В качестве шаблона рекомендуется использовать {@link Controls.filter:Selector/Panel }
    * Подробнее о настройке панели фильтров читайте <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>здесь</a>.
    * Важно: для ленивой загрузки шаблона в значение опции необходимо передать путь до контрола.
    * @example
    * Пример настройки параметров для двух фильтров.
    * Шаблоны отображения обоих фильтров в главном блоке находятся в разделе "MyModule/mainBlockTemplate.wml"
    * Шаблоны для отображения второго фильтра в дополнительном блоке находятся в разделе "MyModule/additionalBlockTemplate.wml"
    * TMPL:
    * <pre>
    *    <Controls.filter:Selector
    *       items={{_items}}
    *       templateName="wml!MyModule/panelTemplate"/>
    * </pre>
    *
    * MyModule/panelTemplate.wml
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'] },
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false }
    *    ];
    * </pre>
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>Guide for setup Filter Button and Fast Filter</a>
    * @see Controls.filter:Selector/Panel
    */

   /*
    * @name Controls/interface/IFilterButton#templateName
    * @cfg {String} Template for the pop-up panel, that opens after clicking on the button.
    * @remark
    * As a template, it is recommended to use the control {@link Controls.filter:Selector/Panel }
    * The description of setting up the filter panel you can read <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>here</a>.
    * Important: for lazy loading template in the option give the path to the control
    * @example
    * Example setting options for two filters.
    * Templates for displaying both filters in the main block are in "MyModule/mainBlockTemplate.wml"
    * Templates for displaying second filter in the additional block are in "MyModule/additionalBlockTemplate.wml"
    * TMPL:
    * <pre>
    *    <Controls.filter:Selector
    *       items={{_items}}
    *       templateName="wml!MyModule/panelTemplate"/>
    * </pre>
    *
    * MyModule/panelTemplate.wml
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'] },
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false }
    *    ];
    * </pre>
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>Guide for setup Filter Button and Fast Filter</a>
    * @see Controls.filter:Selector/Panel
    */

   /**
    * @name Controls/interface/IFilterButton#alignment
    * @cfg {String} Задаёт выравнивание кнопки фильтров.
    * @variant right Кнопка прикреплена к правому краю. Всплывающая панель открывается влево. Строка выбранных фильтров отображается слева от кнопки.
    * @variant left Кнопка прикреплена к левому краю. Всплывающая панель открывается вправо. Строка выбранных фильтров отображается справа от кнопки.
    * @default right
    * @example
    * Пример открытия панели фильтров справа:
    * <pre>
    *    <Controls.filter:Selector
    *       templateName="wml!MyModule/panelTemplate"
    *       items="{{_items}}"
    *       alignment="left" />
    * </pre>
    */

   /*
    * @name Controls/interface/IFilterButton#alignment
    * @cfg {String} Sets the direction in which the popup panel will open.
    * @variant right The button is attached to the right edge, the pop-up panel opens to the left.
    * @variant left The button is attached to the left edge, the pop-up panel opens to the right.
    * @default right
    * @remark
    * The string, that is formed by the values from items, also changes position.
    * @example
    * Example of opening the filter panel in the right
    * <pre>
    *    <Controls.filter:Selector
    *       templateName="wml!MyModule/panelTemplate"
    *       items="{{_items}}"
    *       alignment="left" />
    * </pre>
    */

   /**
    * @event Controls/interface/IFilterButton#filterChanged Происходит при изменении фильтра.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Object} filter Новый фильтр.
    */

   /*
    * @event Controls/interface/IFilterButton#filterChanged Happens when filter changed.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Object} filter New filter.
    */

   /**
    * @event Controls/interface/IFilterButton#itemsChanged Происходит при изменении структры фильтра.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<FilterPanelItems>} items Новая структура фильтра.
    */

   /*
    * @event Controls/interface/IFilterButton#itemsChanged Happens when items changed.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Array.<FilterPanelItems>} items New items.
    */

});
