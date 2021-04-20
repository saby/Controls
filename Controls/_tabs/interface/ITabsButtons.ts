import {IControlOptions} from 'UI/Base';
import {SbisService} from 'Types/source';
import {ISingleSelectableOptions, IItemsOptions} from 'Controls/interface';

/**
 * Интерфейс для опций контрола вкладок.
 * @public
 * @author Красильников А.С.
 */
export interface ITabsButtons {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean;
}

export interface ITabsButtonsOptions extends IControlOptions, ISingleSelectableOptions, IItemsOptions<object> {
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
     * <pre class="brush: js; highlight: [5-22]">
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
    source?: SbisService;
    /**
     * @typedef {String} Controls/_tabs/interface/ITabsButtons/Style
     * @variant primary
     * @variant secondary
     * @variant unaccented
     */
    /**
     * @name Controls/_tabs/interface/ITabsButtons#style
     * @cfg {Controls/_tabs/interface/ITabsButtons/Style.typedef} Стиль отображения вкладок.
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
    style?: string;
    /**
     * @name Controls/_tabs/interface/ITabsButtons#separatorVisible
     * @cfg {Boolean} Определяет видимость вертикальных разделителей вкладок.
     * @default true
     * @demo Controls-demo/Tabs/Buttons/SeparatorVisible/Index
     */
    separatorVisible?: boolean;
    /**
     * @name Controls/_tabs/interface/ITabsButtons#borderVisible
     * @cfg {Boolean} Определяет видимость горизонтальной линии, которая подчеркивает вкладки снизу.
     * @default true
     * @demo Controls-demo/Tabs/Buttons/BorderVisible/Index
     */
    borderVisible?: boolean;
    /**
     * @typedef {String} Controls/_tabs/interface/ITabsButtons/InlineHeight
     * @variant s
     * @variant l
     */
    /**
     * @name Controls/_tabs/interface/ITabsButtons#inlineHeight
     * @cfg {Controls/_tabs/interface/ITabsButtons/InlineHeight.typedef} Определяет высоту вкладок
     * @default s
     * @demo Controls-demo/Tabs/Buttons/MarkerThickness/Index
     */
    inlineHeight?: string;
    /**
     * @typedef {String} Controls/_tabs/interface/ITabsButtons/MarkerThickness
     * @variant s
     * @variant l
     */
    /**
     * @name Controls/_tabs/interface/ITabsButtons#markerThickness
     * @cfg {Controls/_tabs/interface/ITabsButtons/MarkerThickness.typedef} Определяет толщину подчеркивания вкладок
     * @default s
     * @demo Controls-demo/Tabs/Buttons/MarkerThickness/Index
     */
    markerThickness?: string;
    /**
     * @typedef {String} Controls/_tabs/interface/ITabsButtons/HorizontalPadding
     * @variant xs
     * @variant null
     */
    /**
     * @name Controls/_tabs/interface/ITabsButtons#horizontalPadding
     * @cfg {Controls/_tabs/interface/ITabsButtons/HorizontalPadding.typedef} Определяет размер отступов контрола по горизонтали.
     * @default xs
     * @demo Controls-demo/Tabs/Buttons/HorizontalPadding/Index
     */
    horizontalPadding?: string;
    /**
     * @name Controls/_tabs/interface/ITabsButtons#displayProperty
     * @cfg {String} Устанавливает имя поля элемента, значение которого будет отображено.
     */
    displayProperty?: string;
}
