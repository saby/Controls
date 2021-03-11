import {IControlOptions} from 'UI/Base';
import {SbisService} from 'Types/source';
import {ISingleSelectableOptions, IItemsOptions} from 'Controls/interface';
export interface ITabsButtons {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean;
}

/**
 * Интерфейс для опций контрола вкладок.
 * @public
 * @author Красильников А.С.
 */

export interface ITabsButtonsOptions extends IControlOptions, ISingleSelectableOptions, IItemsOptions<object> {
    /**
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
     * @typedef {String} Controls/_tabs/interface/ITabsButtonsOptions/Style
     * @variant primary
     * @variant secondary
     * @variant unaccented
     */
    /**
     * @cfg {Controls/_tabs/interface/ITabsButtonsOptions/Style.typedef} Стиль отображения вкладок.
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
     *
     * @demo Controls-demo/Tabs/Buttons/SeparatorVisible/Index
     */
    separatorVisible?: boolean;
    /**
     * Определяет наличие подчеркивания вкладок
     * @default true
     * @demo Controls-demo/Tabs/Buttons/BorderVisible/Index
     */
    borderVisible?: boolean;
    /**
     * @typedef {String} Controls/_tabs/interface/ITabsButtonsOptions/InlineHeight
     * @variant s
     * @variant l
     */
    /**
     * @cfg {Controls/_tabs/interface/ITabsButtonsOptions/InlineHeight.typedef} Определяет высоту вкладок
     * @default s
     * @demo Controls-demo/Tabs/Buttons/MarkerThickness/Index
     */
    inlineHeight?: string;
    /**
     * @typedef {String} Controls/_tabs/interface/ITabsButtonsOptions/MarkerThickness
     * @variant s
     * @variant l
     */
    /**
     * @cfg {Controls/_tabs/interface/ITabsButtonsOptions/MarkerThickness.typedef} Определяет толщину подчеркивания вкладок
     * @default s
     * @demo Controls-demo/Tabs/Buttons/MarkerThickness/Index
     */
    markerThickness?: string;
    displayProperty?: string;

    /**
     * @typedef {String} THorizontalPadding
     * @variant m
     * @variant null
     */
    /**
     * @name Controls/_tabs/interface/ITabsButtons#horizontalPadding
     * @cfg {THorizontalPadding} Размер отступов между вкладками и разделителем вкладок.
     */
    horizontalPadding?: 'm' | 'null';
}