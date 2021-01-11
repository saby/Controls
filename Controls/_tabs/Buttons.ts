/**
 * Created by kraynovdo on 25.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import {CrudWrapper} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {SbisService} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isLeftMouseButton} from 'Controls/popup';
import {IItems, IHeight} from 'Controls/interface';
import {ITabsButtons, ITabsButtonsOptions} from './interface/ITabsButtons';
import {constants} from 'Env/Env';
import {adapter} from 'Types/entity';
import {factory} from 'Types/chain';

import TabButtonsTpl = require('wml!Controls/_tabs/Buttons/Buttons');
import ItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');

import {IItemTemplateOptions, IHeightOptions} from 'Controls/interface';

interface ITabButtonItem {
    isMainTab?: boolean;
    align?: 'left' | 'right';
    [key: string]: any;
}

export interface ITabsTemplate {
    readonly '[Controls/_tabs/ITabsTemplate]': boolean;
}

/**
 * Интерфейс для шаблонных опций контрола вкладок.
 * @interface Controls/_tabs/ITabsTemplate
 * @public
 */
export interface ITabsTemplateOptions extends IItemTemplateOptions, IHeightOptions {
    leftTemplateProperty?: string;
    rightTemplateProperty?: string;
    tabSpaceTemplate?: TemplateFunction;
    itemRightTemplate?: TemplateFunction;
    itemLeftTemplate?: TemplateFunction;
}

export interface ITabsOptions extends ITabsButtonsOptions, ITabsTemplateOptions {
}

interface IReceivedState {
    items: RecordSet;
    itemsOrder: number[];
    lastRightOrder: number;
    itemsArray: ITabButtonItem[];
}

const isTemplate = (tmpl: any): boolean => {
    return !!(tmpl && typeof tmpl.func === 'function' && tmpl.hasOwnProperty('internal'));
};

const isTemplateArray = (templateArray: any): boolean => {
    return Array.isArray(templateArray) && templateArray.every((tmpl) => isTemplate(tmpl));
};

const isTemplateObject = (tmpl: any): boolean => {
    return isTemplate(tmpl);
};

/**
 * Контрол предоставляет пользователю возможность выбрать между двумя или более вкладками.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_tabs.less переменные тем оформления}
 *
 * @class Controls/_tabs/Buttons
 * @extends UI/Base:Control
 * @mixes Controls/interface:ISingleSelectable
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IItems
 * @mixes Controls/interface:IHeight
 * @mixes Controls/_tabs/interface/ITabsButtons
 * @mixes Controls/tabs:ITabsTemplateOptions
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Tabs/Buttons
 * @cssModifier controls-Tabs__item-underline_theme-{{_options.theme}} Позволяет добавить горизонтальный разделитель к прикладному контенту, чтобы расположить его перед вкладками.
 */

class TabsButtons extends Control<ITabsOptions> implements ITabsButtons, IItems, ITabsTemplate, IHeight {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    readonly '[Controls/_interface/IItems]': boolean = true;
    readonly '[Controls/_interface/IHeight]': boolean = true;
    readonly '[Controls/_tabs/ITabsTemplate]': boolean = true;

    protected _template: TemplateFunction = TabButtonsTpl;
    protected _defaultItemTemplate: TemplateFunction = ItemTemplate;
    protected _itemsArray: ITabButtonItem[];
    private _itemsOrder: number[];
    private _lastRightOrder: number;
    private _markerThickness: string;
    private _items: RecordSet;
    private _crudWrapper: CrudWrapper;

    protected _beforeMount(options: ITabsOptions,
                           context: object,
                           receivedState: IReceivedState): void | Promise<IReceivedState> {
        this._markerThickness = TabsButtons._getMarkerThickness(options);
        if (receivedState) {
            this._prepareState(receivedState);
        } else if (options.items) {
            const itemsData = this._prepareItems(options.items);
            this._prepareState(itemsData);
        } else if (options.source) {
            return this._initItems(options.source).then((result: IReceivedState) => {
                this._prepareState(result);
                // TODO https://online.sbis.ru/opendoc.html?guid=527e3f4b-b5cd-407f-a474-be33391873d5
                if (!TabsButtons._checkHasFunction(result)) {
                    return result;
                }
            });
        }
    }

    protected _beforeUpdate(newOptions: ITabsOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._initItems(newOptions.source).then((result) => {
                this._prepareState(result);
            });
        }
        if (newOptions.items && newOptions.items !== this._options.items) {
            const itemsData = this._prepareItems(newOptions.items);
            this._prepareState(itemsData);
        }
        if (newOptions.markerThickness !== this._options.markerThickness
            || newOptions.borderThickness !== this._options.borderThickness) {
            this._markerThickness = TabsButtons._getMarkerThickness(newOptions);
        }
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, key: string): void {
        if (isLeftMouseButton(event)) {
            this._notify('selectedKeyChanged', [key]);
        }
    }

    protected _prepareItemClass(item: ITabButtonItem, index: number): string {
        const order: number = this._itemsOrder[index];
        const options: ITabsButtonsOptions = this._options;
        const theme = options.theme;
        const classes: string[] = ['controls-Tabs__item controls-Tabs__item_theme_' + theme +
        ' controls-Tabs__item_inlineHeight-' + options.inlineHeight + '_theme-' + theme];

        const itemAlign: string = item.align;
        const align: string = itemAlign ? itemAlign : 'right';

        const isLastItem: boolean = order === this._lastRightOrder;

        classes.push(`controls-Tabs__item_align_${align} ` +
            `controls-Tabs__item_align_${align}_theme_${theme}`);
        if (order === 1 || isLastItem) {
            classes.push('controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_' + theme);
        }
        if (order === 1) {
            classes.push('controls-Tabs__item_extreme_first controls-Tabs__item_extreme_first_theme_' + theme);
        } else if (isLastItem) {
            classes.push('controls-Tabs__item_extreme_last controls-Tabs__item_extreme_last_theme_' + theme);
        } else {
            classes.push('controls-Tabs__item_default controls-Tabs__item_default_theme_' + theme);
        }

        const itemType: string = item.type;
        if (itemType) {
            classes.push('controls-Tabs__item_type_' + itemType +
                ' controls-Tabs__item_type_' + itemType + '_theme_' + theme);
        }

        // TODO: по поручению опишут как и что должно сжиматься.
        // Пока сжимаем только те вкладки, которые прикладники явно пометили
        // https://online.sbis.ru/opendoc.html?guid=cf3f0514-ac78-46cd-9d6a-beb17de3aed8
        if (item.isMainTab) {
            classes.push('controls-Tabs__item_canShrink');
        } else {
            classes.push('controls-Tabs__item_notShrink');
        }
        return classes.join(' ');
    }

    protected _prepareItemSelectedClass(item: ITabButtonItem): string {
        const classes = [];
        const options = this._options;
        const style = TabsButtons._prepareStyle(options.style);
        if (item[options.keyProperty] === options.selectedKey) {
            classes.push(`controls-Tabs_style_${style}__item_state_selected ` +
                `controls-Tabs_style_${style}__item_state_selected_theme_${options.theme}`);
            classes.push('controls-Tabs__item_state_selected ' +
            `controls-Tabs__item_state_selected_theme_${options.theme}`);
        } else {
            classes.push('controls-Tabs__item_state_default controls-Tabs__item_state_default_theme_' + options.theme);
        }
        return classes.join(' ');
    }

    protected _prepareItemOrder(index: number): string {
        const order = this._itemsOrder[index];
        return '-ms-flex-order:' + order + '; order:' + order;
    }

    protected _getTemplate(
        template: TemplateFunction,
        item: ITabButtonItem,
        itemTemplateProperty: string
    ): TemplateFunction {
        if (itemTemplateProperty) {
            const templatePropertyByItem = item[itemTemplateProperty];
            if (templatePropertyByItem) {
                return templatePropertyByItem;
            }
        }
        return template;
    }

    /**
     * Получаем массив из RecordSet, т.к. работа с массивом значительно ускоряет обработку.
     * @param {RecordSet} items
     * @return {ITabButtonItem[]}
     * @private
     */
    private _getItemsArray(items: RecordSet): ITabButtonItem[] {
        if (items.getAdapter() instanceof adapter.Json) {
            return items.getRawData();
        } else {
            return factory(items).map((item) => {
                return factory(item).toObject();
            }).value();
        }
    }

    private _prepareItems(items: RecordSet): IReceivedState {
        let leftOrder: number = 1;
        let rightOrder: number = 30;
        const itemsArray = this._getItemsArray(items);
        const itemsOrder: number[] = [];

        itemsArray.forEach((item) => {
            if (item.align === 'left') {
                itemsOrder.push(leftOrder++);
            } else {
                itemsOrder.push(rightOrder++);
            }
        });

        // save last right order
        rightOrder--;
        this._lastRightOrder = rightOrder;

        return {
            items,
            itemsOrder,
            lastRightOrder: rightOrder,
            itemsArray
        };
    }

    private _initItems(source: SbisService): Promise<IReceivedState> {
        this._crudWrapper = new CrudWrapper({
            source
        });
        return this._crudWrapper.query({}).then((items: RecordSet) => {
            return this._prepareItems(items);
        });
    }

    private _prepareState(data: IReceivedState): void {
        this._items = data.items;
        this._itemsArray = data.itemsArray;
        this._itemsOrder = data.itemsOrder;
        this._lastRightOrder = data.lastRightOrder;
    }

    static _theme: string[] = ['Controls/tabs'];

    static _prepareStyle(style: string): string {
        if (style === 'default') {
            // 'Tabs/Buttons: Используются устаревшие стили. Используйте style = primary вместо style = default'
            return 'primary';
        } else if (style === 'additional') {
            // Tabs/Buttons: Используются устаревшие стили. Используйте style = secondary вместо style = additional'
            return 'secondary';
        } else {
            return style;
        }
    }

    static _getMarkerThickness(options: ITabsOptions): string {
        //  TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=21dfec57-300d-42b7-aa76-4d13bea8d53f
        return options.borderThickness ? options.borderThickness : options.markerThickness;
    }

    static _checkHasFunction(receivedState: IReceivedState): boolean {
        // Функции, передаваемые с сервера на клиент в receivedState, не могут корректно десериализоваться.
        // Поэтому, если есть функции в receivedState, заново делаем запрос за данными.
        // Если в записи есть функции, то итемы в receivedState не передаем, на клиенте перезапрашивает данные
        if (constants.isServerSide && receivedState?.items?.getCount) {
            const items = receivedState.itemsArray;
            const length = items.length;
            for (let i = 0; i < length; i++) {
                const item = items[i];
                for (const key in item) {
                    /* TODO: will be fixed by
                     * https://online.sbis.ru/opendoc.html?guid=225bec8b-71f5-462d-b566-0ebda961bd95
                     */
                    if (
                        item.hasOwnProperty(key) && (
                            isTemplate(item[key]) ||
                            isTemplateArray(item[key]) ||
                            isTemplateObject(item[key])
                        )
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    static getDefaultOptions(): ITabsOptions {
        return {
            style: 'primary',
            inlineHeight: 's',
            markerThickness: 's',
            borderVisible: true,
            separatorVisible: true,
            displayProperty: 'title'
        };
    }
}

/**
 * @name Controls/_tabs/ITabsTemplate#tabSpaceTemplate
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
 * @name Controls/_tabs/ITabsTemplate#itemTemplate
 * @cfg {Function} Шаблон для рендеринга.
 * @default Controls/tabs:buttonsItemTemplate
 * @demo Controls-demo/Tabs/Buttons/ItemTemplate/Index
 * @remark
 * Чтобы определить шаблон, следует вызвать базовый шаблон 'Controls/tabs:buttonsItemTemplate'.
 * Шаблон помещается в компонент с помощью тега ws:partial с атрибутом template.
 * По умолчанию в шаблоне 'Controls/tabs:buttonsItemTemplate' будет отображаться только поле 'title'. Можно изменить формат отображения записей, задав следующие параметры:
 * <ul>
 *    <li>displayProperty - определяет поле отображения записи.</li>
 * <ul>
 * @example
 * Вкладки со стандартным шаблоном элемента (шаблоном по умолчанию).
 * <pre class="brush: html">
 * <Controls.tabs:Buttons
 *          bind:selectedKey='SelectedKey1'
 *          keyProperty="id"
 *          items="{{_items1}}"/>
 * </pre>
 *
 * Вкладки с кастомным шаблоном элемента.
 * <pre class="brush: html; highlight: [6,7,8,9,10]">
 * <Controls.tabs:Buttons
 *     bind:selectedKey="SelectedKey3"
 *     keyProperty="id"
 *     style="additional"
 *     source="{{_source3}}">
 *     <ws:itemTemplate>
 *         <div>
 *              <ws:partial template="Controls/tabs:buttonsItemTemplate"
 *                          item="{{itemTemplate.item}}"
 *                          displayProperty="caption" />
 *         </div>
 *     </ws:itemTemplate>
 * </Controls.tabs:Buttons>
 * </pre>
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_tabs/ITabsTemplate#itemTemplateProperty
 * @cfg {String} Имя поля, которое содержит шаблон отображения элемента.
 * @default Если параметр не задан, вместо него используется itemTemplate.
 * @remark
 * Чтобы определить шаблон, вы должны вызвать базовый шаблон 'Controls/tabs:buttonsItemTemplate'.
 * Шаблон помещается в компонент с помощью тега ws:partial с атрибутом template.
 * По умолчанию в шаблоне 'Controls/tabs:buttonsItemTemplate' будет отображаться только поле 'title'. Можно изменить формат отображения записей, задав следующие параметры:
 * <ul>
 *    <li>displayProperty - определяет поле отображения записи.</li>
 * <ul>
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

/**
 * @name Controls/_tabs/ITabsTemplate#rightTemplateProperty
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
 * @name Controls/_tabs/ITabsTemplate#leftTemplateProperty
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
 * @name Controls/_tabs/ITabsTemplate#itemRightTemplate
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
 * @name Controls/_tabs/ITabsTemplate#itemLeftTemplate
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
 *     </ws:itemLeftTemplate>
 * </Controls.tabs:Buttons>
 * </pre>
 * @see itemRightTemplate
 */

export default TabsButtons;
