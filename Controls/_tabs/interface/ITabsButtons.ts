import {IControlOptions} from 'UI/Base';
import {SbisService} from 'Types/source';
import {ISingleSelectableOptions, IItemsOptions} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
/**
 * @typedef {String} Controls/_tabs/interface/ITabsButtons/Align Опция определяющая положение вкладки
 * @default 'right'
 * @variant 'right' Вкладка отображается справа.
 * @variant 'left' Вкладка отображается слева.
 */

/**
 * @typedef {Object} Controls/_tabs/interface/ITabsButtons/Item
 * @property {Controls/_tabs/interface/ITabsButtons/Align.typedef} [item.align] Определяет с какой стороны отображается вкладка.
 * @property {Number|String} [item.maxWidth] Максимальная ширина вкладки. Может принимать числовое значение(в пикселях) или в процентах(Например: '20%')
 * @property {Number|String} [item.minWidth] Минимальная ширина вкладки. Может принимать числовое значение(в пикселях) или в процентах(Например: '20%')
 * @property {Number|String} [item.width] Фиксированная ширина вкладки.
 * Может принимать числовое значение(в пикселях) или в процентах(Например: '20%')
 * При задании фиксированной ширины задание minWidth и maxWidth не имеет смысла, т.к. ширина зафиксируется.
 * @property {Boolean} [item.isMainTab] Определяет, является ли вкладка главной. Главная вкладка визуально выделяется относительно других вкладок. Поддерживается визуальное оформление только для первой вкладки слева.
 * @property {String} [item.icon] Название иконки. {@link Controls/_tabs/ITabsTemplate#itemTemplate Для настройки смотри пример}
 * @property {String} [item.iconStyle] Стиль отображения иконки. {@link Controls/_tabs/ITabsTemplate#itemTemplate Для настройки смотри пример}
 * @property {Number} [item.mainCounter] Значение счетчика. {@link Controls/_tabs/ITabsTemplate#itemTemplate Для настройки смотри пример}
 * @property {Number} [item.mainCounterStyle] Стиль отображения счетчика. {@link Controls/_tabs/ITabsTemplate#itemTemplate Для настройки смотри пример}
 * @property {String} [item.caption] Подпись вкладки. {@link Controls/_tabs/ITabsTemplate#itemTemplate Для настройки смотри пример}
 * @property {Controls/_tabs/interface/ITabsButtons/image.typedef} [item.image] Конфигурация для отображения картинки. {@link Controls/_tabs/ITabsTemplate#itemTemplate Для настройки смотри пример}
 */

/**
 * @typedef {Object} Controls/_tabs/interface/ITabsButtons/image
 * @property {String} [image.src] Url картинки.
 * @property {Number} [image.srcSet] Значение аттрибута srcset.
 * @property {String} [image.tooltip] Значение тултипа.
 */

export interface ITabButtonItem {
    isMainTab?: boolean;
    align?: 'left' | 'right';
    title?: 'string';
    minWidth?: string | number;
    width?: string | number;
    maxWidth?: string | number;
    icon?: string;
    iconStyle?: string;
    mainCounter?: string;
    mainCounterStyle?: string;
    caption?: string;
    image?: object;
    [key: string]: any;
}
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
     * @name Controls/_tabs/interface/ITabsButtons#items
     * @cfg {RecordSet.<Controls/_tabs/interface/ITabsButtons/Item.typedef>} Рекордсет с конфигурацией вкладок.
     * @default undefined
     * @remark
     * Элементу можно задать свойство align, которое определяет выравнивание вкладок.
     * Если одной из крайних вкладок надо отобразить оба разделителя, слева и справа, то используйте свойство contentTab в значении true.
     * @example
     * На вкладках будут отображаться данные из _items. Первый элемент отображается с выравниванием по левому краю, другие элементы отображаются по умолчанию - справа.
     * <pre class="brush: html; highlight: [4]">
     *  <!--WML-->
     * <Controls.tabs:Buttons
     *     bind:selectedKey="_selectedKey"
     *     keyProperty="key"
     *     source="{{_source}}" />
     * </pre>
     * <pre class="brush: js; highlight: [5-22]">
     * // TS
     * _selectedKey: null,
     * _items: null,
     * _beforeMount: function() {
     *    this._selectedKey: '1',
     *    this._items: new RecordSet({
     *       keyProperty: 'key',
     *       rawData: [
     *          {
     *             key: '1',
     *             title: 'Yaroslavl',
     *             align: 'left',
     *             maxWidth: '50%'
     *          },
     *          {
     *             key: '2',
     *             title: 'Moscow',
     *             minWidth: 150,
     *             maxWidth: 300
     *          },
     *          {
     *             key: '3',
     *             title: 'St-Petersburg',
     *             width: 200
     *          }
     *       ]
     *    });
     * }
     * </pre>
     * @demo Controls-demo/Tabs/Buttons/TabsWidth/Index
     * @see items
     */
    items?: RecordSet<ITabButtonItem>;
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
     * @demo Controls-demo/Tabs/Buttons/InlineHeight/Index
     */
    inlineHeight?: string;
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

    /**
     * @name Controls/_tabs/interface/ITabsButtons#canShrink
     * @cfg {Boolean} Определяет могут ли вкладки сжиматься. Если вкладки не могут сжиматься, то при недостатке места они скролятся по горизонтали.
     */
    canShrink: boolean
}
