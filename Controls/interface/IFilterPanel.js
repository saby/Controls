/* eslint-disable */
define('Controls/interface/IFilterPanel', [], function() {

   /**
    * Интерфейс панели фильтров.
    *
    * @interface Controls/interface/IFilterPanel
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Interface for filter panel
    *
    * @interface Controls/interface/IFilterPanel
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Interface for filter panel
    *
    * @interface Controls/interface/IFilterPanel
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @typedef {Object} itemTpl
    * @property {String} templateName
    * @property {Object} templateOptions
    */

   /**
    * @typedef {Object} additionalTpl
    * @property {String} templateName
    * @property {Object} templateOptions
    */

   /**
    * @name Controls/interface/IFilterPanel#orientation
    * @cfg {String} Устанавливает ориентацию панели фильтрации.
    * @variant vertical Вертикальная ориентация панели. Блок истории отображается внизу.
    * @variant horizontal Горизонтальная ориентация панели. Блок истории отображается справа.
    * @default vertical
    * @remark
    * Если указано значение "horizontal", но на панели нет истории фильтрации, контрол будет отображаться в одном столбце.
    * @example
    * В данном примере панель будет отображаться в две колонки.
    * <pre>
    *    <Controls.filterPopup:Panel
    *          source="{{_source}}"
    *          orientation="horizontal"
    *          historyId="myHistoryId">
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    */

   /*
    * @name Controls/interface/IFilterPanel#orientation
    * @cfg {String} Sets the orientation of panel in one of two directions.
    * @variant vertical Vertical orientation of the panel. The history block is displayed below.
    * @variant horizontal Horizontal orientation of the panel. History block is displayed on the right.
    * @default vertical
    * @remark
    * If a “horizontal” value is specified, but there is no history in the panel, the component will be displayed in one column.
    * @example
    * In this example panel will be displayed in two column.
    * <pre>
    *    <Controls.filterPopup:Panel
    *          source="{{_source}}"
    *          orientation="horizontal"
    *          historyId="myHistoryId">
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    */

   /**
    * @name Controls/interface/IFilterPanel#headingCaption
    * @cfg {String} Текст заголовка.
    * @default "Selected"
    * @example
    * В этом примере панель имеет заголовок "Sales"
    * <pre>
    *    <Controls.filterPopup:Panel
    *          items="{{_items}}"
    *          headingCaption="Sales">
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    * @see Controls/heading:Title#caption
    */

   /*
    * @name Controls/interface/IFilterPanel#headingCaption
    * @cfg {String} Text heading.
    * @default "Selected"
    * @example
    * In this example, the panel has the caption "Sales"
    * <pre>
    *    <Controls.filterPopup:Panel
    *          items={{_items}}
    *          headingCaption="Sales">
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    * @see Controls/heading:Title#caption
    */

   /**
    * @name Controls/interface/IFilterPanel#headingStyle
    * @cfg {String} Стиль заголовка панели фильтров.
    * @variant primary Стиль заголовка - основной.
    * @variant secondary Стиль заголовка - дополнительный.
    * @default secondary
    * @example
    * В этом примере панель имеет стиль заголовка - primary.
    * <pre>
    *    <Controls.filterPopup:Panel
    *          items={{_items}}
    *          headingStyle="primary">
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    * @see Controls/heading:Title#style
    */

   /*
    * @name Controls/interface/IFilterPanel#headingStyle
    * @cfg {String} The heading style of the filter panel.
    * @variant primary Primary heading style.
    * @variant secondary Secondary heading style.
    * @default secondary
    * @example
    * In this example, the panel has a primary heading style.
    * <pre>
    *    <Controls.filterPopup:Panel
    *          items={{_items}}
    *          headingStyle="primary">
    *       <ws:itemTemplate templateName="wml!MyModule/mainBlockTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalBlockTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    * @see Controls/heading:Title#style
    */

   /**
    * @name Controls/interface/IFilterPanel#itemTemplate
    * @cfg {itemTpl} Шаблон отображения элементов.
    * @remark
    * Чтобы отобразить строку, которая формируется значениями элементов, необходимо выполнить bind:textValue="item.textValue".
    * Для правильного отображения необходимо описать шаблоны для всех элементов.
    * @example
    * Пример настройки параметров itemTemplate.
    * <pre>
    *    <Controls.filterPopup:Panel items="{{_items}}">
    *       <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    * <ws:template name="type">
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </ws:template>
    *
    * <ws:template name="deleted">
    *    <Controls.filterPopup:Text
    *          bind:value="item.value"
    *          caption="{{item.textValue}}"/>/>
    * </ws:template>
    *
    * <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * JS:
    * <pre>
    *    import {Memory} from 'Types/source';
    *
    *    protected _items: array;
    *    protected _beforeMount():void {
    *       this._items = [
    *          {
    *            id: 'type',
    *            value: ['1'],
    *            resetValue: ['1'],
    *            source: new Memory({
    *               data: [{ id: '1', title: 'All types' },
    *                      { id: '2', title: 'Meeting' },
    *                      { id: 3, title: 'VideoConference' }],
    *               keyProperty: 'id'
    *             })
    *          },
    *          {
    *             id: 'deleted',
    *             value: true,
    *             resetValue: false,
    *             textValue: 'Deleted'
    *          }
    *       ];
    *    }
    * </pre>
    * @see itemTemplateProperty
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Руководство по настройке быстрого фильтра.</a>
    */

   /*
    * @name Controls/interface/IFilterPanel#itemTemplate
    * @cfg {itemTpl} Template for item render.
    * @remark
    * To display in a string, that is formed by the values from items, you must make a bind:textValue="item.textValue".
    * For proper display, templates for all items should be described.
    * @example
    * Example of setting options itemTemplate
    * <pre>
    *    <Controls.filterPopup:Panel items="{{_items}}">
    *       <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    * <ws:template name="type">
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </ws:template>
    *
    * <ws:template name="deleted">
    *    <Controls.filterPopup:Text
    *          bind:value="item.value"
    *          caption="{{item.textValue}}"/>/>
    * </ws:template>
    *
    * <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'], source: new MemorySource({
    *         data: [{ id: '1', title: 'All types' },
    *         { id: '2', title: 'Meeting' },
    *         { id: 3, title: 'Videoconference' }],
    *         keyProperty: 'id'
    *       })},
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted' }
    *    ];
    * </pre>
    * @see itemTemplateProperty
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Guide for setup Fast Filter</a>
    */

   /**
    * @name Controls/interface/IFilterPanel#additionalTemplate
    * @cfg {additionalTpl} Шаблон отображения элемента в блоке "Еще можно отобрать".
    * @remark
    * Для отображения фильтра в дополнительном блоке необходимо указать visibility: false.
    * При указании visibility = true фильтр будет отображаться в основном блоке, но при сбросе фильтра он будет отображаться в дополнительном блоке.
    * @example
    * Пример настройки параметров additionalTemplate
    * <pre>
    *    <Controls.filterPopup:Panel items={{_items}}>
    *       <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    * <ws:template name="type">
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </ws:template>
    *
    * <ws:template name="deleted">
    *    <Controls.filterPopup:Text
    *          bind:value="item.value"
    *          caption="{{item.textValue}}"/>/>
    * </ws:template>
    *
    * <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * MyModule/additionalTemplate.wml
    * <pre>
    *    <ws:template name="type">
    *       <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}">
    *    </ws:template>
    *
    *    <ws:template name="deleted">
    *       <Controls.filterPopup:Link caption="item.textValue"/>
    *    </ws:template>
    *
    *    <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'], visibility: true, source: new MemorySource({
    *         data: [{ id: '1', title: 'All types' },
    *         { id: '2', title: 'Meeting' },
    *         { id: 3, title: 'Videoconference' }],
    *         keyProperty: 'id'
    *       })},
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false }
    *    ];
    * </pre>
    * @see additionalTemplateProperty
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Руководство по настройке быстрого фильтра.</a>
    */

   /*
    * @name Controls/interface/IFilterPanel#additionalTemplate
    * @cfg {additionalTpl} Template for item render in the additional block.
    * @remark
    * To display the filter in the additional block, you need to specify in the settings item visibility: false.
    * When specifying visibility = true, the filter will be displayed in the main block, but when the filter is reset, it will be displayed in the additional block.
    * @example
    * Example of setting options additionalTemplate
    * <pre>
    *    <Controls.filterPopup:Panel items={{_items}}>
    *       <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    * <ws:template name="type">
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </ws:template>
    *
    * <ws:template name="deleted">
    *    <Controls.filterPopup:Text
    *          bind:value="item.value"
    *          caption="{{item.textValue}}"/>/>
    * </ws:template>
    *
    * <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * MyModule/additionalTemplate.wml
    * <pre>
    *    <ws:template name="type">
    *       <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}">
    *    </ws:template>
    *
    *    <ws:template name="deleted">
    *       <Controls.filterPopup:Link caption="item.textValue"/>
    *    </ws:template>
    *
    *    <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'], visibility: true, source: new MemorySource({
    *         data: [{ id: '1', title: 'All types' },
    *         { id: '2', title: 'Meeting' },
    *         { id: 3, title: 'Videoconference' }],
    *         keyProperty: 'id'
    *       })},
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false }
    *    ];
    * </pre>
    * @see additionalTemplateProperty
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Guide for setup Fast Filter</a>
    */

   /**
    * @name Controls/interface/IFilterPanel#footerTemplate
    * @cfg {Function|String}  Шаблон отображения подвала в панели фильтра.
    * @example
    * Пример настройки параметра footerTemplate
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:footerTemplate>
    *           <ws:partial template="MyModule/control:footerTemplate" />
    *       </ws:footerTemplate>
    *    </Controls.filterPopup:Panel>
    * </pre>
    */

   /*
    * @name Controls/interface/IFilterPanel#footerTemplate
    * @cfg {Function|String} Template that will be rendered below the filter panel
    * @example
    * Example of setting options footerTemplate
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:footerTemplate>
    *           <ws:partial template="MyModule/control:footerTemplate" />
    *       </ws:footerTemplate>
    *    </Controls.filterPopup:Panel>
    * </pre>
    */

   /**
    * @name Controls/interface/IFilterPanel#emptyHistoryTemplate
    * @cfg {Function|String} Шаблон, который отображаеться в блоке с историей фильтров,
    * если фильтров, сохранённых в историю, ещё нет.
    * @demo Controls-demo/Filter_new/DetailPanel/EmptyHistoryTemplate/Index
    * @example
    * Пример настройки опции emptyHistoryTemplate
    * <pre>
    *    <Controls.filterPopup:Panel>
    *       <ws:emptyHistoryTemplate>
    *           <ws:partial template="MyModule/control:emptyHistoryTemplate" />
    *       </ws:emptyHistoryTemplate>
    *    </Controls.filterPopup:Panel>
    * </pre>
    */

   /**
    * @name Controls/interface/IFilterPanel#additionalTemplateProperty
    * @demo Controls-demo/Filter_new/FilterView/Source/AdditionalTemplateProperty/Index
    * @cfg {String} Имя свойства элемента, содержащего шаблон отображения элемента в блоке "Еще можно отобрать". Если параметр не задан, вместо него используется additionalTemplate.
    * @remark
    * Для отображения фильтра в дополнительном блоке необходимо указать visibility: false.
    * При указании visibility = true фильтр будет отображаться в основном блоке, но при сбросе фильтра он будет отображаться в дополнительном блоке.
    * @example
    * В этом примере шаблон отображения фильтра по "Удаленным" в дополнительном блоке будет загружен из файла MyModule/addTemplateDeleted.wml
    * <pre>
    *    <Controls.filterPopup:Panel
    *       items={{_items}}
    *       additionalTemplateProperty="myAddTpl">
    *       <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    * <ws:template name="type">
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </ws:template>
    *
    * <ws:template name="deleted">
    *    <Controls.filterPopup:Text
    *          bind:value="item.value"
    *          caption="{{item.textValue}}"/>/>
    * </ws:template>
    *
    * <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * MyModule/additionalTemplate.wml
    * <pre>
    *    <ws:template name="type">
    *       <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}">
    *    </ws:template>
    *
    *    <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * MyModule/addTemplateDeleted.wml
    * <pre>
    *     <Controls.filterPopup:Link caption="item.textValue"/>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'], visibility: true, source: new MemorySource({
    *         data: [{ id: '1', title: 'All types' },
    *         { id: '2', title: 'Meeting' },
    *         { id: 3, title: 'Videoconference' }],
    *         keyProperty: 'id'
    *       })},
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false,
    *       myAddTpl="wml!MyModule/addTemplateDeleted"}
    *    ];
    * </pre>
    * @see additionalTemplate
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Руководство по настройке быстрого фильтра.</a>
    */

   /*
    * @name Controls/interface/IFilterPanel#additionalTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render in the additional block. If not set, additionalTemplate is used instead.
    * @remark
    * To display the filter in the additional block, you need to specify in the settings item visibility: false.
    * When specifying visibility = true, the filter will be displayed in the main block, but when the filter is reset, it will be displayed in the additional block.
    * @example
    * In this example, the template for the "deleted" filter in the additional block, will be loaded from the file MyModule/addTemplateDeleted.wml
    * <pre>
    *    <Controls.filterPopup:Panel
    *       items={{_items}}
    *       additionalTemplateProperty="myAddTpl">
    *       <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    *       <ws:additionalTemplate templateName="wml!MyModule/additionalTemplate"/>
    *    </Controls.filterPopup:Panel>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    * <ws:template name="type">
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </ws:template>
    *
    * <ws:template name="deleted">
    *    <Controls.filterPopup:Text
    *          bind:value="item.value"
    *          caption="{{item.textValue}}"/>/>
    * </ws:template>
    *
    * <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * MyModule/additionalTemplate.wml
    * <pre>
    *    <ws:template name="type">
    *       <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}">
    *    </ws:template>
    *
    *    <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * MyModule/addTemplateDeleted.wml
    * <pre>
    *     <Controls.filterPopup:Link caption="item.textValue"/>
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['1'], resetValue: ['1'], visibility: true, source: new MemorySource({
    *         data: [{ id: '1', title: 'All types' },
    *         { id: '2', title: 'Meeting' },
    *         { id: 3, title: 'Videoconference' }],
    *         keyProperty: 'id'
    *       })},
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted', visibility: false,
    *       myAddTpl="wml!MyModule/addTemplateDeleted"}
    *    ];
    * </pre>
    * @see additionalTemplate
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Guide for setup Fast Filter</a>
    */

   /**
    * @name Controls/interface/IFilterPanel#applyButtonCaption
    * @demo Controls-demo/Filter_new/DetailPanel/ApplyButtonCaption/Index
    * @cfg {String} Текст на кнопке применения фильтрации.

    /**
    * @name Controls/interface/IFilterPanel#groupProperty
    * @demo Controls-demo/Filter_new/DetailPanel/GroupProperty/Index
    * @cfg {String} Имя параметра, содержащего название группы элемента. Поддерживается группировка только в "Еще можно отобрать".

   /**
    * @name Controls/interface/IFilterPanel#itemTemplateProperty
    * @demo Controls-demo/Filter_new/FilterView/Source/ItemTemplateProperty/Index
    * @cfg {String} Имя параметра, содержащего шаблон отображения элемента. Если не установлен, вместо него используется "itemTemplate".
    * @remark
    * Для отображения в строке, которая формируется значениями элементов, необходимо выполнить bind:textValue="item.textValue".
    * Для правильного отображения необходимо описать шаблоны для всех элементов.
    * @example
    * В этом примере шаблон отображения фильтра по "Типу" в главном блоке будет загружен из файлового модуля Module/myTemplateForType.wml
    * TMPL:
    * <pre>
    *    <Controls.filterPopup:Panel
    *    items={{_items}}
    *    itemTemplateProperty="myTpl"/>
    *    <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    *    <ws:template name="deleted">
    *       <Controls.filterPopup:Text
    *             bind:value="item.value"
    *             caption="{{item.textValue}}"/>/>
    *    </ws:template>
    *
    *    <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * Module/myTemplateForType.wml
    * <pre>
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['0'], resetValue: ['0'], myTpl: 'wml!Module/myTemplateForType' },
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted' }
    *    ];
    * </pre>
    * @see itemTemplate
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/fast-filter-settings/'>Руководство по настройке быстрого фильтра.</a>
    */

   /*
    * @name Controls/interface/IFilterPanel#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    * @remark
    * To display in a string, that is formed by the values from items, you must make a bind:textValue="item.textValue".
    * For proper display, templates for all items should be described.
    * @example
    * In this example, the template for the "type" filter in the main block, will be loaded from the file Module/myTemplateForType.wml
    * TMPL:
    * <pre>
    *    <Controls.filterPopup:Panel
    *    items={{_items}}
    *    itemTemplateProperty="myTpl"/>
    *    <ws:itemTemplate templateName="wml!Module/itemTemplate"/>
    * </pre>
    *
    * Module/itemTemplate.wml
    * <pre>
    *    <ws:template name="deleted">
    *       <Controls.filterPopup:Text
    *             bind:value="item.value"
    *             caption="{{item.textValue}}"/>/>
    *    </ws:template>
    *
    *    <ws:partial template="{{item.id}}" item="{{item}}"/>
    * </pre>
    *
    * Module/myTemplateForType.wml
    * <pre>
    *    <Controls.filterPopup:Dropdown
    *          bind:selectedKeys="item.value"
    *          bind:textValue="item.textValue"
    *          keyProperty="key"
    *          displayProperty="title"
    *          source="{{item.source}}" />
    * </pre>
    *
    * JS:
    * <pre>
    *    this._items = [
    *       { id: 'type', value: ['0'], resetValue: ['0'], myTpl: 'wml!Module/myTemplateForType' },
    *       { id: 'deleted', value: true, resetValue: false, textValue: 'Deleted' }
    *    ];
    * </pre>
    * @see itemTemplate
    * @see <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>Guide for setup Filter Button and Fast Filter</a>
    */

   /**
    * @name Controls/interface/IFilterPanel#historyId
    * @cfg {String} Уникальный идентификатор для сохранения истории.
    * @remark Для корректной работы необходимо настроить параметр items в контроле с помощью <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/base-settings/'>инструкции</a>.
    * @demo Controls-demo/Filter_new/DetailPanel/HistoryId/Index
    * @remark Для корректной работы необходимо настроить параметр items в контроле с помощью <a href='/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/'>инструкции</a>.
    */

   /*
    * @name Controls/interface/IFilterPanel#historyId
    * @cfg {String} Unique id for save history.
    * @remark For the correct work of the history mechanism, you need to configure the items property on the control by the <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>instruction</a>.
    */

   /**
    * @name Controls/interface/IFilterPanel#items
    * @cfg {Array.<FilterItem>} Специальная структура для визуального представления фильтра. Подробнее см. {@link Controls/_filter/View/interface/IFilterView#source}
    */

   /**
    * @event Controls/interface/IFilterPanel#itemsChanged Событие происходит при изменении опции items.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Controls/_filter/interface/IFilterView#source} items Конфигурация свойств фильтра.
    * @example
    * WML:
    * <pre>
    *    <Controls.filterPopup:Panel on:itemsChanged="_panelItemsChanged()"/>
    * </pre>
    *
    * JS:
    * <pre>
    * _panelItemsChanged(event, items) {
    *    ....
    * }
    * </pre>
    */

   /*
    * @event Controls/interface/IFilterPanel#itemsChanged Occurs when items options was changed.
    * @param {Event}
    * @param {Controls/_filter/interface/IFilterView#source} items Filter items configuration,
    * @example
    * WML:
    * <pre>
    *    <Controls.filterPopup:Panel on:itemsChanged="_panelItemsChanged()"/>
    * </pre>
    *
    * JS:
    * <pre>
    * _panelItemsChanged(event, items) {
    *    ....
    * }
    */
});
