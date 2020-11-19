import {IControlOptions, TemplateFunction} from 'UI/Base';
import {SbisService} from 'Types/source';
import {ISingleSelectableOptions, IItemsOptions} from 'Controls/interface';
export interface ITabsButtons {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean;
}

/**
 * Интерфейс для опций контрола вкладок.
 * @interface Controls/_tabs/interface/ITabsButtons
 * @public
 * @author Красильников А.С.
 */

export interface ITabsButtonsOptions extends IControlOptions, ISingleSelectableOptions, IItemsOptions<object> {
    source?: SbisService;
    style?: string;
    separatorVisible?: boolean;
    borderThickness?: string;
    displayProperty?: string;
}
/**
 * @typedef {String} BorderThickness
 * @variant s
 * @variant l
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#borderThickness
 * @cfg {BorderThickness} Определяет толщину подчеркивания вкладок
 * @default s
 * @demo Controls-demo/Tabs/Buttons/BorderThickness/Index
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#separatorVisible
 * @cfg {Boolean} Определяет наличие разделителя между вкладками
 * @default true
 * @demo Controls-demo/Tabs/Buttons/SeparatorVisible/Index
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#tabSpaceTemplate
 * @cfg {Content} Шаблон, отображаемый между вкладками.
 * @default undefined
 * @remark
 * Вкладка может быть выровнена по левому и правому краю, это определяется свойством align.
 * Если у контрола есть левая и правая вкладки, то tabSpaceTemplate будет расположен между ними.
 * @example
 * Пример вкладок с шаблоном между ними:
 * <pre class="brush: html; highlight: [2]">
 * <Controls.tabs:Buttons
 *     tabSpaceTemplate=".../spaceTemplate" />
 * </pre>
 *
 * <pre class="brush: html;">
 * <!-- spaceTemplate.wml -->
 * <div class="additionalContent">
 *     <Controls.buttons:Button .../>
 *     <Controls.buttons:Button .../>
 *     <Controls.buttons:Button .../>
 * </div>
 * </pre>
 */

/*
 * @name Controls/_tabs/interface/ITabsButtons#tabSpaceTemplate
 * @cfg {Content} Contents of the area near the tabs.
 * @default undefined
 * @remark
 * Tab can be left and right aligned, this is determined by the item property 'align'.
 * If control has left and right tabs then  TabSpaceTemplate will be between them.
 * @example
 * Tabs buttons with space template.
 * <pre>
 *    <Controls.tabs:Buttons
 *       .....
 *       tabSpaceTemplate=".../spaceTemplate'"
 *       .....
 *    />
 * </pre>
 * spaceTemplate:
 * <pre>
 *    <div class="additionalContent">
 *       <Controls.buttons:Button .../>
 *       <Controls.buttons:Button .../>
 *       <Controls.buttons:Button .../>
 *    </div>
 * </pre>
 */

/**
 * @typedef {String} Style
 * @variant primary
 * @variant secondary
 * @variant unaccented
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#style
 * @cfg {Style} Стиль отображения вкладок.
 * @default primary
 * @demo Controls-demo/Tabs/Buttons/Style/Index
 * @remark
 * Если стандартная тема вам не подходит, вы можете переопределить переменные:
 *
 * * @border-color_Tabs-item_selected_primary
 * * @text-color_Tabs-item_selected_primary
 * * @border-color_Tabs-item_selected_secondary
 * * @text-color_Tabs-item_selected_secondary
 * @example
 * Вкладки с применением стиля 'secondary'.
 * <pre class="brush: html; highlight: [5]">
 * <Controls.tabs:Buttons
 *     bind:selectedKey='_selectedKey'
 *     keyProperty="id"
 *     source="{{_source}}"
 *     style="secondary"/>
 * </pre>
 * Вкладки с применением стиля по умолчанию.
 * <pre class="brush: html;">
 * <Controls.tabs:Buttons
 *     bind:selectedKey="_selectedKey"
 *     keyProperty="id"
 *     source="{{_source}}"/>
 * </pre>
 */

/*
 * @name Controls/_tabs/interface/ITabsButtons#style
 * @cfg {Enum} Tabs buttons display style.
 * @variant primary
 * @variant secondary
 * @default primary
 * @remark
 * If the standard theme does not suit you, you can override the variables:
 * <ul>
 *     <li>@border-color_Tabs-item_selected_primary,</li>
 *     <li>@text-color_Tabs-item_selected_primary,</li>
 *     <li>@border-color_Tabs-item_selected_secondary,</li>
 *     <li>@text-color_Tabs-item_selected_secondary</li>
 * </ul>
 * @example
 * Tabs Buttons has style 'secondary'.
 * <pre>
 *    <Controls.tabs:Buttons
 *       bind:selectedKey='_selectedKey'
 *       keyProperty="id"
 *       source="{{_source}}
 *       style="secondary"
 *       .....
 *    />
 * </pre>
 * Tabs Buttons has default style.
 * <pre>
 *    <Controls.tabs:Buttons
 *       bind:selectedKey='_selectedKey'
 *       keyProperty="id"
 *       source="{{_source}}
 *    />
 * </pre>
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#source
 * @cfg {Types/source:Base} Объект, реализующий ISource интерфейс для доступа к данным.
 * @default undefined
 * @remark
 * Элементу можно задать свойство align, которое определяет выравнивание вкладок.
 * Если одной из крайних вкладок надо отобразить оба разделителя, слева и справа, то используйте свойство contentTab в значении true.
 * @example
 * На вкладках будут отображаться данные из _source. Первый элемент отображается с выравниванием по левому краю, другие элементы отображаются по умолчанию - справа.
 * <pre class="brush: html; highlight: [4]">
 * <Controls.tabs:Buttons
 *     bind:selectedKey="_selectedKey"
 *     keyProperty="key"
 *     source="{{_source}}" />
 * </pre>
 * <pre class="brush: js; highlight: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]">
 * _selectedKey: null,
 * _source: null,
 * _beforeMount: function() {
 *    this._selectedKey: '1',
 *    this._source: new Memory({
 *       keyProperty: 'key',
 *       data: [
 *          {
 *             key: '1',
 *             title: 'Yaroslavl',
 *             align: 'left'
 *          },
 *          {
 *             key: '2',
 *             title: 'Moscow'
 *          },
 *          {
 *             key: '3',
 *             title: 'St-Petersburg'
 *          }
 *       ]
 *    });
 * }
 * </pre>
 * @see items
 */

/*
 * @name Controls/_tabs/interface/ITabsButtons#source
 * @cfg {Types/source:Base} Object that implements ISource interface for data access.
 * @default undefined
 * @remark
 * The item can have an property 'align'. It's determine align of item tab.
 * If item may having both separator, you may using opion contentTab with value true.
 * @example
 * Tabs buttons will be rendered data from _source. First item render with left align, other items render with defult, right align.
 * <pre>
 *    <Controls.tabs:Buttons
 *              bind:selectedKey='_selectedKey'
 *              keyProperty="key"
 *              source="{{_source}}"
 *    />
 * </pre>
 * <pre>
 *    _selectedKey: '1',
 *    _source: new Memory({
 *        keyProperty: 'key',
 *        data: [
 *        {
 *           key: '1',
 *           title: 'Yaroslavl',
 *           align: 'left'
 *        },
 *        {
 *           key: '2',
 *           title: 'Moscow'
 *        },
 *        {
 *           key: '3',
 *           title: 'St-Petersburg'
 *        }
 *        ]
 *    })
 * </pre>
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#itemTemplate
 * @cfg {Function} Шаблон для рендеринга.
 * @default undefined
 * @remark
 * Чтобы определить шаблон, следует вызвать базовый шаблон 'Controls/tabs:buttonsItemTemplate'.
 * Шаблон помещается в компонент с помощью тега ws:partial с атрибутом template.
 * По умолчанию в шаблоне 'Controls/tabs:buttonsItemTemplate' будет отображаться только поле 'title'. Можно изменить формат отображения записей, задав следующие параметры:
 * 
 * * displayProperty - определяет поле отображения записи.
 * @example
 * Вкладки со стандартным шаблоном элемента (шаблоном по умолчанию).
 *
 * <pre class="brush: html; highlight: [6,7,8,9,10]">
 * <Controls.tabs:Buttons
 *     bind:selectedKey="SelectedKey3"
 *     keyProperty="id"
 *     style="additional"
 *     source="{{_source3}}">
 *     <ws:itemTemplate>
 *         <ws:partial template="Controls/tabs:buttonsItemTemplate"
 *                     item="{{itemTemplate.item}}"
 *                     displayProperty="caption" />
 *     </ws:itemTemplate>
 * </Controls.tabs:Buttons>
 * </pre>
 * @see itemTemplateProperty
 */

/*
 * @name Controls/_tabs/interface/ITabsButtons#itemTemplate
 * @cfg {Function} Template for item render.
 * @default Base template 'Controls/tabs:buttonsItemTemplate'
 * @remark
 * To determine the template, you should call the base template 'Controls/tabs:buttonsItemTemplate'.
 * The template is placed in the component using the ws:partial tag with the template attribute.
 * By default, the base template 'Controls/tabs:buttonsItemTemplate' will display only the 'title' field. You can change the display of records by setting their values for the following options:
 * <ul>
 *    <li>displayProperty - defines the display field of the record.</li>
 * <ul>
 * @example
 * Tabs buttons with item template.
 * <pre>
 *    <Controls.tabs:Buttons
 *                   bind:selectedKey='SelectedKey3'
 *                   keyProperty="id"
 *                   style="additional"
 *                   source="{{_source3}}">
 *       <ws:itemTemplate>
 *          <ws:partial template="Controls/tabs:buttonsItemTemplate"
 *                      item="{{itemTemplate.item}}"
 *                      displayProperty="caption"/>
 *       </ws:itemTemplate>
 *    </Controls.tabs:Buttons>
 * </pre>
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#itemTemplateProperty
 * @cfg {String} Имя поля, которое содержит шаблон отображения элемента.
 * @default undefined
 * @remark
 * Если параметр не задан, вместо него используется itemTemplate.
 * 
 * Чтобы определить шаблон, вы должны вызвать базовый шаблон 'Controls/tabs:buttonsItemTemplate'.
 * Шаблон помещается в компонент с помощью тега ws:partial с атрибутом template.
 * По умолчанию в шаблоне 'Controls/tabs:buttonsItemTemplate' будет отображаться только поле 'title'. Можно изменить формат отображения записей, задав следующие параметры:
 * 
 * * displayProperty - определяет поле отображения записи.
 * @example
 * Вкладки с шаблоном элемента.
 * <pre class="brush: html; highlight: [2]">
 * <Controls.tabs:Buttons
 *     itemTemplateProperty="myTemplate"
 *     source="{{_source}}" />
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- myTemplate.wml -->
 * <div class="controls-Tabs__item_custom">{{item.get(displayProperty || 'title')}}</div>
 * </pre>
 *
 * <pre class="brush: js">
 * _source: null,
 * beforeMount: function() {
 *    this._source: new Memory({
 *       keyProperty: 'id',
 *       data: [
 *          {id: 1, title: 'I agree'},
 *          {id: 2, title: 'I not decide'},
 *          {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
 *       ]
 *    });
 * }
 * </pre>
 * @see itemTemplate
 */

/*
 * @name Controls/_tabs/interface/ITabsButtons#itemTemplateProperty
 * @cfg {String} Name of the item property that contains template for item render.
 * @default If not set, itemTemplate is used instead.
 * @remark
 * To determine the template, you should call the base template 'Controls/tabs:buttonsItemTemplate'.
 * The template is placed in the component using the ws:partial tag with the template attribute.
 * By default, the base template 'Controls/tabs:buttonsItemTemplate' will display only the 'title' field. You can change the display of records by setting their values for the following options:
 * <ul>
 *    <li>displayProperty - defines the display field of the record.</li>
 * <ul>
 * @example
 * Tabs buttons with item template.
 * <pre>
 *    <Controls.tabs:Buttons itemTemplateProperty="myTemplate"
 *                           source="{{_source}}
 *                           ...>
 *    </Controls.tabs:Buttons>
 * </pre>
 * myTemplate
 * <pre>
 *    <div class="controls-Tabs__item_custom">{{item.get(displayProperty || 'title')}}</div>
 * </pre>
 * <pre>
 *    _source: new Memory({
 *              keyProperty: 'id',
 *              data: [
 *                     {id: 1, title: 'I agree'},
 *                     {id: 2, title: 'I not decide'},
 *                     {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
 *              ]
 *    })
 * </pre>
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#rightTemplateProperty
 * @cfg {String} Имя поля, которое содержит шаблон отображения элемента, находящегося справа от основного содержимого.
 * @example
 * <pre class="brush: html; highlight: [2]">
 * <Controls.tabs:Buttons
 *     rightTemplateProperty="myTemplate"
 *     source="{{_source}}" />
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- myTemplate.wml -->
 * <div class="{{item.get('icon')}} icon-small controls-icon_style-{{item.get('iconStyle')}}_theme-{{_options.theme}}"></div>
 * </pre>
 *
 * <pre class="brush: js">
 * _source: null,
 * beforeMount: function() {
 *    this._source: new Memory({
 *       keyProperty: 'id',
 *       data: [
 *          {id: 1, title: 'I agree'},
 *          {id: 2, title: 'I not decide'},
 *          {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
 *       ]
 *    });
 * }
 * </pre>
 * @see leftTemplateProperty
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#leftTemplateProperty
 * @cfg {String} Имя поля, которое содержит шаблон отображения элемента, находящегося слева от основного содержимого.
 * @example
 * <pre class="brush: html; highlight: [2]">
 * <Controls.tabs:Buttons
 *     leftTemplateProperty="myTemplate"
 *     source="{{_source}}" />
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- myTemplate.wml -->
 * <div class="{{item.get('icon')}} icon-small controls-icon_style-{{item.get('iconStyle')}}_theme-{{_options.theme}}"></div>
 * </pre>
 *
 * <pre class="brush: js">
 * _source: null,
 * beforeMount: function() {
 *    this._source: new Memory({
 *       keyProperty: 'id',
 *       data: [
 *          {id: 1, title: 'I agree'},
 *          {id: 2, title: 'I not decide'},
 *          {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
 *       ]
 *    });
 * }
 * </pre>
 * @see rightTemplateProperty
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#itemRightTemplate
 * @cfg {String} Шаблон элемента, находящегося справа от основного содержимого.
 * @remark
 * Базовый шаблон itemRightTemplate поддерживает следующие параметры:
 *
 * - item {Model} — запись текущей вкладки;
 * - selected {Boolean} — выбрана ли вкладка, на которой располагается шаблон;
 * @example
 * <pre class="brush: html; highlight: [2,3,4,5,6]">
 * <Controls.tabs:Buttons bind:selectedKey="_mySelectedKey" keyProperty="id" source="{{_mySource}}">
 *     <ws:itemRightTemplate>
 *         <ws:if data="{{_counter}}">
 *             <ws:partial template="{{ _myRightTpl }}" item="{{itemRightTemplate.item}}" counter="{{_counter}}" />
 *         </ws:if>
 *     </ws:itemRightTemplate>
 * </Controls.tabs:Buttons>
 * </pre>
 * @see itemLeftTemplate
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#itemLeftTemplate
 * @cfg {String} Шаблон элемента, находящегося слева от основного содержимого.
 * @remark
 * Базовый шаблон itemLeftTemplate поддерживает следующие параметры:
 *
 * - item {Model} — запись текущей вкладки.
 * - selected {Boolean} — выбрана ли вкладка, на которой располагается шаблон.
 * @example
 * <pre class="brush: html;highlight: [2,3,4,5,6]">
 * <Controls.tabs:Buttons bind:selectedKey="_mySelectedKey" keyProperty="id" source="{{_mySource}}">
 *     <ws:itemLeftTemplate>
 *         <ws:if data="{{_counter}}">
 *             <ws:partial template="{{ _myRightTpl }}" item="{{itemLeftTemplate.item}}" counter="{{_counter}}" />
 *         </ws:if>
 *     </ws:itemRightTemplate>
 * </Controls.tabs:Buttons>
 * </pre>
 * @see itemRightTemplate
 */
