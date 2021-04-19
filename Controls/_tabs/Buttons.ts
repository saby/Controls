/**
 * Created by kraynovdo on 25.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import {CrudWrapper} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {SbisService} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {isLeftMouseButton} from 'Controls/popup';
import {IItems, IItemTemplateOptions} from 'Controls/interface';
import {ITabsButtons, ITabsButtonsOptions} from './interface/ITabsButtons';
import {constants} from 'Env/Env';
import {adapter} from 'Types/entity';
import {factory} from 'Types/chain';
import Marker, {AUTO_ALIGN} from './Buttons/Marker';

import 'css!Controls/tabs';
import {Logger} from 'UI/Utils';
import * as TabButtonsTpl from 'wml!Controls/_tabs/Buttons/Buttons';
import * as ItemTemplate from 'wml!Controls/_tabs/Buttons/ItemTemplate';

enum ITEM_ALIGN {
    left = 'left',
    right = 'right'
}

interface ITabButtonItem {
    isMainTab?: boolean;
    align?: 'left' | 'right';

    [key: string]: any;
}

export interface ITabsTemplate {
    readonly '[Controls/_tabs/ITabsTemplate]': boolean;
}

export interface ITabsTemplateOptions extends IItemTemplateOptions {
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

const ANIMATION_DURATION = 300;

/**
 * Контрол предоставляет пользователю возможность выбрать между двумя или более вкладками.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_tabs.less переменные тем оформления}
 *
 * @class Controls/_tabs/Buttons
 * @extends UI/Base:Control
 * @mixes Controls/interface:ISingleSelectable
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IItems
 * @mixes Controls/tabs:ITabsButtons
 * @mixes Controls/tabs:ITabsTemplate
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Tabs/Buttons
 * @cssModifier controls-Tabs__item-underline Позволяет добавить горизонтальный разделитель к прикладному контенту, чтобы расположить его перед вкладками.
 */

class TabsButtons extends Control<ITabsOptions> implements ITabsButtons, IItems, ITabsTemplate {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    readonly '[Controls/_interface/IItems]': boolean = true;
    readonly '[Controls/_tabs/ITabsTemplate]': boolean = true;

    protected _template: TemplateFunction = TabButtonsTpl;
    protected _defaultItemTemplate: TemplateFunction = ItemTemplate;
    protected _itemsArray: ITabButtonItem[];
    protected _marker: Marker = new Marker();
    protected _markerCssClass: string = '';
    private _itemsOrder: number[];
    private _lastRightOrder: number;
    private _items: RecordSet;
    private _crudWrapper: CrudWrapper;
    private _isUnmounted: boolean = false;
    private _borderThickness: string = '';
    private _borderVisible: boolean;
    private _activeElement: ITabButtonItem;

    protected _beforeMount(options: ITabsOptions,
                           context: object,
                           receivedState: IReceivedState): void | Promise<IReceivedState> {
        this._checkDeprecated(options);
        this._updateBorderThickness(options);

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

    protected _afterMount(): void {
        RegisterUtil(this, 'controlResize', this._resizeHandler, {listenAll: true});
    }

    protected _beforeUpdate(newOptions: ITabsOptions): void {
        if (newOptions.borderThickness !== this._options.borderThickness) {
            this._updateBorderThickness(newOptions);
        }
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._initItems(newOptions.source).then((result) => {
                this._prepareState(result);
                this._marker.reset();
            });
        }
        if (newOptions.items && newOptions.items !== this._options.items) {
            const itemsData = this._prepareItems(newOptions.items);
            this._prepareState(itemsData);
            this._marker.reset();
        }
        if (newOptions.selectedKey !== this._options.selectedKey) {
            this._updateMarkerSelectedIndex(newOptions);
            this._updateMarkerCssClass(newOptions);
        }
        const isBorderThickness = newOptions.borderThickness !== this._borderThickness;
        if (newOptions.style !== this._options.style || isBorderThickness) {
            this._updateMarkerCssClass(newOptions);
        }
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'controlResize', {listenAll: true});
        this._isUnmounted = true;
    }

    protected _checkDeprecated(cfg: ITabsOptions): void {
        if (cfg.borderVisible !== undefined) {
            Logger.warn('Buttons: Option "borderVisible" is deprecated and removed in 20.3000. Use option "borderrThickness".');
        }
    }

    protected _updateBorderThickness(options: ITabsOptions): void {
        if (options.borderThickness !== undefined) {
            this._borderThickness = options.borderThickness;
        } else {
            this._borderThickness = options.markerThickness;
        }
    }

    protected _mouseEnterHandler(): void {
        this._updateMarker();
    }

    protected _touchStartHandler(): void {
        this._updateMarker();
    }

    protected _resizeHandler(): void {
        if (this._marker.isInitialized()) {
            this._marker.reset();
            this._updateMarker();
        }
    }

    protected _updateMarker(): void {
        if (this._marker.isInitialized()) {
            return;
        }
        const tabElements: HTMLElement[] = this._itemsArray.map((item: ITabButtonItem, key: number) => {
            return {
                element: this._children[`Tab${key}`],
                align: item.align || ITEM_ALIGN.right,
                isMainTab: (item.isMainTab === undefined ? true : item.isMainTab)
            };
        });
        this._marker.updatePosition(tabElements, this._container);
        this._updateMarkerSelectedIndex(this._options);
        if (!this._markerCssClass) {
            this._updateMarkerCssClass(this._options);
        }
    }

    protected _getMarkerStyle(): string {
        const isAccentTab = this._activeElement && this._activeElement.isMainTab === false;
        if (isAccentTab) {
            return `${this._marker.getAlign()}: ${this._marker.getOffset()}px`;
        } else {
            return `width: ${this._marker.getWidth()}px; ${this._marker.getAlign()}: ${this._marker.getOffset()}px`;
        }
    }

    protected _updateMarkerSelectedIndex(options: ITabsButtonsOptions): void {
        if (!this._marker.isInitialized()) {
            return;
        }
        const index: number = this._itemsArray.findIndex((item: ITabButtonItem) => {
            return item[options.keyProperty] === options.selectedKey;
        });
        this._activeElement = this._itemsArray[index];
        const align = this._marker.getAlign();
        this._marker.setSelectedIndex(index);

        // Если переключили на вкладку у которой другое выравнивание, то меняется
        // тип позиционирования маркера left|right. Из-за этого анимации не будет.
        // Запускаем анимацию с текущим позиционированием, и переключим его после
        // завершения анимации в _transitionEndHandler
        if (align && align !== this._marker.getAlign()) {
            this._marker.setAlign(align);
        }
    }

    protected _transitionEndHandler() {
        if (!this._isUnmounted) {
            this._marker.setAlign(AUTO_ALIGN.auto);
        }
    }

    protected _updateMarkerCssClass(options: ITabsButtonsOptions): void {
        const style = TabsButtons._prepareStyle(options.style);
        this._markerCssClass = `controls-Tabs__marker_style-${style} ` +
            `controls-Tabs__marker_thickness-${options.markerThickness}`;
        const isAccentTab = this._activeElement && this._activeElement.isMainTab === false;
        if (isAccentTab) {
            this._markerCssClass += ' controls-Tabs__markerAccent';
        }
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, key: string): void {
        if (isLeftMouseButton(event)) {
            this._notify('selectedKeyChanged', [key]);
            // selectedKey может вернуться в контрол значительно позже если снуржи есть асинхронный код.
            // Например так происходит на страницах онлайна. Запустим анимацию маркера как можно быстрее.
            this._updateMarkerSelectedIndex({...this._options, selectedKey: key});
            this._updateMarkerCssClass(this._options);
        }
    }

    protected _prepareItemClass(item: ITabButtonItem, index: number): string {
        const order: number = this._itemsOrder[index];
        const options: ITabsButtonsOptions = this._options;
        const classes: string[] = ['controls-Tabs__item' +
        ' controls-Tabs__item_inlineHeight-' + options.inlineHeight +
        ` controls-Tabs_horizontal-padding-${options.horizontalPadding}`];

        const itemAlign: string = item.align;
        const align: string = itemAlign ? itemAlign : 'right';

        const isLastItem: boolean = order === this._lastRightOrder;

        classes.push(`controls-Tabs__item_align_${align}`);
        if (order === 1 || isLastItem) {
            classes.push('controls-Tabs__item_extreme');
        }
        if (order === 1) {
            classes.push('controls-Tabs__item_extreme_first');
        } else if (isLastItem) {
            classes.push('controls-Tabs__item_extreme_last');
        } else {
            classes.push('controls-Tabs__item_default');
        }

        const itemType: string = item.type;
        if (itemType) {
            classes.push('controls-Tabs__item_type_' + itemType);
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
        if (item.isMainTab === false) {
            classes.push('controls-Tabs__item_state_accent');
        } else {
            if (item[options.keyProperty] === options.selectedKey) {
                classes.push(`controls-Tabs_style_${style}__item_state_selected`);
                classes.push('controls-Tabs__item_state_selected ');
            } else {
                classes.push('controls-Tabs__item_state_default');
            }
        }
        return classes.join(' ');
    }

    protected _prepareItemTypeClass(item: ITabButtonItem): string {
        const itemType: string = item.type || 'default';
        return `controls-Tabs__itemClickableArea_type-${itemType}`;
    }

    protected _prepareItemMarkerClass(item: ITabButtonItem): string {
        const classes = [];
        const options = this._options;
        const style = TabsButtons._prepareStyle(options.style);

        classes.push('controls-Tabs__itemClickableArea_marker');
        classes.push(`controls-Tabs__itemClickableArea_markerThickness-${options.markerThickness}`);

        if (!this._marker.isInitialized() && item[options.keyProperty] === options.selectedKey) {
            // Если маркеры которые рисуются с абсолютной позицией не инициализированы, то нарисуем маркер
            // внтри вкладки. Это можно сделать быстрее. Но невозможно анимировано передвигать его между вкладками.
            // Инициализируем и переключимся на другой механизм маркеров после ховера.
            classes.push(`controls-Tabs_style_${style}__item-marker_state_selected`);
            if (item.isMainTab === false) {
                classes.push('controls-Tabs__itemClickableArea_markerAccent');
            }
        } else {
            classes.push('controls-Tabs__item-marker_state_default');
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
            // Получаем массив без клонирования, т.к. оно является тяжелой операцией и замедляет построение
            return items.getRawData(true);
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
            markerThickness: 'l',
            separatorVisible: true,
            displayProperty: 'title',
            horizontalPadding: 'xs'
        };
    }
}

Object.defineProperty(TabsButtons, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return TabsButtons.getDefaultOptions();
    }
});

/**
 * Интерфейс для шаблонных опций контрола вкладок.
 * @interface Controls/_tabs/ITabsTemplate
 * @public
 */

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
 * <div class="{{item.get('icon')}} icon-small controls-icon_style-{{item.get('iconStyle')}}"></div>
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
 * <div class="{{item.get('icon')}} icon-small controls-icon_style-{{item.get('iconStyle')}}"></div>
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
