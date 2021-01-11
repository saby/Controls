import {IControlOptions} from 'UI/Base';
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
    borderVisible?: boolean;
    markerThickness?: string;
    displayProperty?: string;

    //TODO: delete
    borderThickness?: string;
}

/**
 * @typedef {String} MarkerThickness
 * @variant s
 * @variant l
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#markerThickness
 * @cfg {MarkerThickness} Определяет толщину подчеркивания вкладок
 * @default s
 * @demo Controls-demo/Tabs/Buttons/MarkerThickness/Index
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#separatorVisible
 * @cfg {Boolean} Определяет наличие разделителя между вкладками
 * @default true
 * @demo Controls-demo/Tabs/Buttons/SeparatorVisible/Index
 */

/**
 * @name Controls/_tabs/interface/ITabsButtons#borderVisible
 * @cfg {Boolean} Определяет наличие подчеркивания вкладок
 * @default true
 * @demo Controls-demo/Tabs/Buttons/BorderVisible/Index
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
