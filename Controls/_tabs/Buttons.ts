/**
 * Created by kraynovdo on 25.01.2018.
 */
import {Control, TemplateFunction} from 'UI/Base';
import {CrudWrapper} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {SbisService} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isLeftMouseButton} from 'Controls/popup';
import {IItems, IItemTemplateOptions} from 'Controls/interface';
import {ITabsButtons, ITabsButtonsOptions, ITabButtonItem} from './interface/ITabsButtons';
import {constants} from 'Env/Env';
import {adapter} from 'Types/entity';
import {factory} from 'Types/chain';
import Marker from './Buttons/Marker';

import * as TabButtonsTpl from 'wml!Controls/_tabs/Buttons/Buttons';
import * as ItemTemplate from 'wml!Controls/_tabs/Buttons/ItemTemplate';

import 'css!Controls/tabs';
import {Logger} from 'UICommon/Utils';

enum ITEM_ALIGN {
    left = 'left',
    right = 'right'
}

enum ANIMATION_MODE {
    none= 'none',
    immediate = 'immediate',
}

const DEFAULT_ITEM_ALIGN: ITEM_ALIGN = ITEM_ALIGN.right

export interface ITabsTemplate {
    readonly '[Controls/_tabs/ITabsTemplate]': boolean;
}

export interface ITabsTemplateOptions extends IItemTemplateOptions {
    leftTemplateProperty?: string;
    rightTemplateProperty?: string;
    tabSpaceTemplate?: TemplateFunction;
    itemRightTemplate?: TemplateFunction;
    itemLeftTemplate?: TemplateFunction;
    animationMode: ANIMATION_MODE;
}

export interface ITabsOptions extends ITabsButtonsOptions, ITabsTemplateOptions {
}

interface IReceivedState {
    items: RecordSet<ITabButtonItem>;
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

const MARKER_ANIMATION_TIMEOUT: number = 100;

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

class TabsButtons extends Control<ITabsOptions, IReceivedState> implements ITabsButtons, IItems, ITabsTemplate {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    readonly '[Controls/_interface/IItems]': boolean = true;
    readonly '[Controls/_tabs/ITabsTemplate]': boolean = true;

    protected _template: TemplateFunction = TabButtonsTpl;
    protected _defaultItemTemplate: TemplateFunction = ItemTemplate;
    protected _itemsArray: ITabButtonItem[];
    protected _marker: Marker = new Marker();
    protected _markerCssClass: string = '';
    protected _isAnimatedMakerVisible: boolean = false;
    private _isAnimationProcessing: boolean = false;
    private _animatedMarkerSelectedKey: string;
    private _markerAnimationTimer: number;
    private _itemsOrder: number[];
    private _lastRightOrder: number;
    private _items: RecordSet;
    private _crudWrapper: CrudWrapper;
    private _isUnmounted: boolean = false;
    private _isUpdatedItems: boolean = false;
    private _hasMainTab: boolean;

    protected _beforeMount(options: ITabsOptions,
                           context: object,
                           receivedState: IReceivedState): void | Promise<IReceivedState> {
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
        } else {
            Logger.error('Controls/tabs:Buttons: Опции items и source не заданы.', this);
        }
    }

    protected _beforeUpdate(newOptions: ITabsOptions): void {
        let itemsChanged: boolean = false;

        if (newOptions.source && newOptions.source !== this._options.source) {
            this._initItems(newOptions.source).then((result) => {
                this._prepareState(result);
                this._marker.reset();
                this._isUpdatedItems = true;
            });
            itemsChanged = true;
        }
        if (newOptions.items && newOptions.items !== this._options.items) {
            const itemsData = this._prepareItems(newOptions.items);
            this._prepareState(itemsData);
            this._marker.reset();
            this._isUpdatedItems = true;
            itemsChanged = true;
        }
        if (!itemsChanged && newOptions.selectedKey !== this._options.selectedKey) {
            this._updateMarkerSelectedIndex(newOptions, false);

            const selectedItem = this._getItemByKey(this._options.selectedKey);
            if (!!selectedItem?.isMainTab) {
                this._updateMarkerSelectedIndex(newOptions);
                this._isAnimatedMakerVisible = false;
            }
            if (!this._isAnimationProcessing) {
                this._isAnimatedMakerVisible = false;
            }
        }
        if (newOptions.style !== this._options.style || newOptions.markerThickness !== this._options.markerThickness) {
            this._updateMarkerCssClass(newOptions);
        }
    }

    protected _beforeRender(): void {
        if (this._isUpdatedItems && this._marker.isInitialized()) {
            this._marker.reset();
            this._isUpdatedItems = false;
        }
    }

    protected _beforeUnmount(): void {
        if (this._markerAnimationTimer) {
            clearTimeout(this._markerAnimationTimer);
        }
        this._isUnmounted = true;
    }

    protected _mouseEnterHandler(event: SyntheticEvent<MouseEvent>): void {
        if (this._wrapperIncludesTarget(event.nativeEvent.target as HTMLElement)) {
            this._updateMarker();
        }
    }

    protected _mouseOutHandler(event: SyntheticEvent<MouseEvent>): void {
        if (
            !this._isAnimationProcessing &&
            this._animatedMarkerSelectedKey === this._options.selectedKey &&
            !this._wrapperIncludesTarget(event.nativeEvent.relatedTarget as HTMLElement)
        ) {
            this._isAnimatedMakerVisible = false;
        }
    }

    protected _wrapperIncludesTarget(target: HTMLElement): boolean {
        let result: boolean = this._children.wrapper === target;
        if (!result && target) {
            result = !!target.closest('.controls-Tabs-wrapper');
        }
        return result;
    }

    protected _touchStartHandler(): void {
        this._updateMarker();
    }

    protected _updateMarker(): void {
        if (this._marker.isInitialized() || !this._itemsArray) {
            return;
        }
        let isUpdateMarker = true;
        const tabElements: HTMLElement[] = this._itemsArray.map((item: ITabButtonItem, key: number) => {
            const children = this._children[`TabContent${key}`];
            /**
             * Может произойти ситуация, когда обновляется source, при этом курсор находится на контролле.
             * В таком случае на контроле снова срабатывает mouseenter, при этом содержимое контрола еще не перерисовалось.
             * Из-за чего children может отсутствовать.
             * Поэтому чтобы контрол не падал с ошибкой, проверяем что есть все children.
             */
            if (children) {
                return {
                    element: children,
                    align: item.align || ITEM_ALIGN.right
                };
            } else {
                isUpdateMarker = false;
            }
        });

        if (isUpdateMarker) {
            this._marker.updatePosition(tabElements, this._container);
            this._updateMarkerSelectedIndex(this._options);
            if (!this._markerCssClass) {
                this._updateMarkerCssClass(this._options);
            }
        }
    }

    protected _updateMarkerSelectedIndex(options: ITabsButtonsOptions, startAnimation: boolean = true): void {
        if (!this._marker.isInitialized()) {
            return;
        }
        this._animatedMarkerSelectedKey = options.selectedKey;
        const index: number = this._itemsArray.findIndex((item: ITabButtonItem) => {
            return item[options.keyProperty] === options.selectedKey;
        });
        const changed = this._marker.setSelectedIndex(index);
        const align = this._marker.getAlign();
        // Не заускаем анимацию при переключении с группы вкладок слева на группу вкладок справа.
        if (changed && startAnimation && align && align === this._marker.getAlign() &&
                this._options.animationMode !== ANIMATION_MODE.none) {
            if (this._isAnimatedMakerVisible) {
                this._isAnimationProcessing = true;
            }
            this._isAnimatedMakerVisible = true;
        }
    }

    protected _getItemByKey(key: string, options?: ITabsOptions): ITabButtonItem {
        const opts: ITabsOptions = options || this._options;

        return this._itemsArray.find((item: ITabButtonItem) => {
            return item[opts.keyProperty] === key;
        });
    }

    protected _isBottomMarkerVisible(): boolean {
        const selectedItem: ITabButtonItem = this._getItemByKey(this._options.selectedKey);
        return !selectedItem?.isMainTab;
    }

    protected _transitionEndHandler() {
        // анимация идет по нескольким стилям, например width и right, по этому обработчик срабатывает несколько раз,
        // не пересчитываем состояние повторно.
        if (this._isAnimationProcessing && !this._isUnmounted) {
            this._notify('animationEnd');

            this._isAnimationProcessing = false;
            if (this._animatedMarkerSelectedKey === this._options.selectedKey) {
                this._isAnimatedMakerVisible = false;
            }
        }
    }

    protected _updateMarkerCssClass(options: ITabsButtonsOptions): void {
        const style = TabsButtons._prepareStyle(options.style);
        this._markerCssClass = `controls-Tabs__marker_style-${style} ` +
            `controls-Tabs__marker_thickness-${options.markerThickness}`;
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, key: string): void {
        if (isLeftMouseButton(event)) {
            this._notify('selectedKeyChanged', [key]);
            // selectedKey может вернуться в контрол значительно позже если снуржи есть асинхронный код.
            // Например так происходит на страницах онлайна. Запустим анимацию маркера как можно быстрее.
            if (this._options.animationMode === ANIMATION_MODE.immediate) {
                const selectedItem = this._getItemByKey(key);
                if (!selectedItem.isMainTab) {
                    this._marker.reset();
                    this._updateMarker();
                    this._updateMarkerSelectedIndex({...this._options, selectedKey: key});
                }
            }
        }
    }

    /**
     * Для совместимости со старым стандартом и апи е даем сжиматься всем вкладкам, кроме главной,
     * если главная задана и на остальных не задано ни одного ограничения по ширине
     * @param item
     * @private
     */
    private _tabCanShrink(item: ITabButtonItem): boolean {
        if (item.width !== undefined || !this._options.canShrink) {
            return false;
        } else {
            return !this._hasMainTab || item.isMainTab || item.minWidth !== undefined || item.maxWidth !== undefined;
        }
    }

    protected _prepareItemClass(item: ITabButtonItem, index: number): string {
        const order: number = this._itemsOrder[index];
        const options: ITabsButtonsOptions = this._options;
        const classes: string[] = ['controls-Tabs__item' +
        ' controls-Tabs__item_inlineHeight-' + options.inlineHeight];
        const itemCount: number = this._itemsOrder.length - 1;

        if (index === 0) {
            classes.push(`controls-Tabs_horizontal-padding-${options.horizontalPadding}_first`);
        } else if (index === itemCount) {
            classes.push(`controls-Tabs_horizontal-padding-${options.horizontalPadding}_last`);
        }

        const itemAlign: string = item.align;
        const align: string = itemAlign ? itemAlign : DEFAULT_ITEM_ALIGN;

        const isLastItem: boolean = order === this._lastRightOrder;
        const shrinkClassPostfix = options.canShrink ? '' : '_padding';

        classes.push(`controls-Tabs__item_align_${align}`);
        if (order === 1 || isLastItem) {
            classes.push('controls-Tabs__item_extreme');
        }
        if (order === 1) {
            classes.push(`controls-Tabs__item_extreme_first${shrinkClassPostfix}`);
        } else if (isLastItem) {
            classes.push(`controls-Tabs__item_extreme_last${shrinkClassPostfix}`);
        } else {
            classes.push(`controls-Tabs__item_default${shrinkClassPostfix}`);
        }

        const itemType: string = item.type;
        if (itemType) {
            classes.push('controls-Tabs__item_type_' + itemType);
        }

        if (this._tabCanShrink(item)) {
            classes.push('controls-Tabs__item_canShrink');
        } else {
            classes.push('controls-Tabs__item_notShrink');
        }
        return classes.join(' ');
    }

    /**
     * Если ширина задана числом, то считаем, что это пиксели, если строка - то проценты, строку отадем как есть.
     * @param value
     * @private
     */
    private _getWidthValue(value: number | string): string {
        return typeof value === 'number' ? value + 'px' : value;
    }

    /**
     * Получение набора инлайновых стилей для айтема вкладки.
     * @param minWidth
     * @param maxWidth
     * @param width
     * @param stretchWidth
     * @param index
     * @protected
     */
    protected _prepareItemStyles({minWidth, maxWidth, width, stretchWidth}: ITabButtonItem, index: number): string {
        let style = this._prepareItemOrder(index);
        if (maxWidth !== undefined) {
            style += `max-width: ${this._getWidthValue(maxWidth)};`;
        }
        if (width !== undefined) {
            style += `width: ${this._getWidthValue(width)}; flex-shrink: 0; justify-content: center;`;
        }
        if (minWidth !== undefined) {
            style += `min-width: ${this._getWidthValue(minWidth)};`;
        }
        return style;
    }

    protected _prepareItemSelectedClass(item: ITabButtonItem): string {
        const classes = [];
        const options = this._options;
        const style = TabsButtons._prepareStyle(options.style);
        if (item.isMainTab) {
            classes.push('controls-Tabs__item_view_main');
            if (item[options.keyProperty] === options.selectedKey) {
                classes.push('controls-Tabs__item_state_selected ');
            }
        } else if (item[options.keyProperty] === options.selectedKey) {
            classes.push(`controls-Tabs_style_${style}__item_state_selected`);
            classes.push('controls-Tabs__item_view_selected');
            classes.push('controls-Tabs__item_state_selected ');
        } else {
            classes.push('controls-Tabs__item_state_default');
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

        if (item.isMainTab) {
            if (item[options.keyProperty] === options.selectedKey) {
                classes.push('controls-Tabs__main-marker');
                classes.push(`controls-Tabs__main-marker-${options.markerThickness}`);
            }
        } else {
            classes.push('controls-Tabs__itemClickableArea_marker');
            classes.push(`controls-Tabs__itemClickableArea_markerThickness-${options.markerThickness}`);

            if (!(this._marker.isInitialized() && this._isAnimatedMakerVisible) && item[options.keyProperty] === options.selectedKey ) {
                // Если маркеры которые рисуются с абсолютной позицией не инициализированы, то нарисуем маркер
                // внутри вкладки. Это можно сделать быстрее. Но невозможно анимировано передвигать его между вкладками.
                // Инициализируем и переключимся на другой механизм маркеров после ховера.
                classes.push(`controls-Tabs_style_${style}__item-marker_state_selected`);
            } else {
                classes.push('controls-Tabs__item-marker_state_default');
            }
        }

        return classes.join(' ');
    }

    protected _prepareItemOrder(index: number): string {
        const order = this._itemsOrder[index];
        return `-ms-flex-order: ${order}; order: ${order};`;
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
        this._hasMainTab = this._itemsArray.reduce((accummulator, item) => {
            return accummulator || item.isMainTab;
        }, false);
    }

    // Используется для подскролла табов в graphic:Layout.
    getOffsetTab(key: string): number {
        if (this._children.wrapper.scrollWidth <= this._children.wrapper.clientWidth) {
            return;
        }

        return this._children[`tab${key}`].offsetLeft;
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
            borderVisible: true,
            separatorVisible: true,
            displayProperty: 'title',
            horizontalPadding: 'xs',
            animationMode: ANIMATION_MODE.none,
            canShrink: true
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
 * @demo Controls-demo/Tabs/Buttons/NewTemplate/Index
 *
 * По умолчанию используется шаблон "Controls/tabs:buttonsItemTemplate".
 * Также вкладки поддерживают разную  реализацию отображения и поддерживают несколько шаблонов.
 *
 * Для отображения шаблона типа иконка, иконка-счетчик, иконка-текст или картинка-текст используется шаблон
 * IconCounterTabTemplate поддерживающий следующие параметры:
 * - icon {String} —  Название иконки.
 * - iconStyle {String} — Стиль отображения иконки.
 * - iconSize {String} - Размер иконки(Доступны значения s и m).
 * - mainCounter {Number} — Значение счетчика.
 * - mainCounterStyle {String} — Стиль отображения счетчика.
 * - caption {String} — Подпись вкладки.
 * - imageSize {String} - Размер изображения(Доступны значения s и m).
 * - image {Object} — Конфигурация для отображения картинки.
 *      - src {String} — Url картинки.
 *      - srcSet {String} — Значение для аттрибута srcset.
 *      - tooltip {String} — Значение для тултипа.
 *
 * Для отображения шаблона типа текст-счетчик, текст-иконка или текст-иконка-счетчик используется шаблон
 * TextCounterTabTemplate поддерживающий следующие параметры:
 * - icon {String} —  Название иконки.
 * - iconStyle {String} — Стиль отображения иконки.
 * - iconSize {String} - Размер иконки(Доступны значения s и m).
 * - mainCounter {Number} — Значение счетчика.
 * - mainCounterStyle {String} — Стиль отображения счетчика.
 * - caption {String} — Подпись вкладки.
 *
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
 * @example
 * Вкладки с использованием шаблона TextCounterTabTemplate.
 * <pre>
 *     <Controls.tabs:Buttons
 *                      bind:selectedKey='SelectedKey'
 *                      itemTemplate="Controls/tabs:TextCounterTabTemplate"
 *                      items="{{_items}}"
 *                      keyProperty="id"/>
 * </pre>
 * <pre>
 *     {
 *        id: '1',
 *        caption: 'Вкладка',
 *        mainCounter: 12
 *     },
 *     {
 *        id: '2',
 *        caption: 'Вкладка',
 *        mainCounter: 12
 *     },
 *     {
 *        id: '3',
 *        caption: 'Вкладка',
 *        mainCounter: 12
 *     }
 * </pre>
 * Вкладки с использованием шаблона IconCounterTabTemplate.
 * <pre>
 *     <Controls.tabs:Buttons
 *                      bind:selectedKey='SelectedKey'
 *                      itemTemplate="Controls/tabs:IconCounterTabTemplate"
 *                      items="{{_items}}"
 *                      keyProperty="id"/>
 * </pre>
 * <pre>
 *     {
 *        id: '1',
 *        icon: 'Show',
 *        caption: 'Вкладка'
 *     },
 *     {
 *        id: '2',
 *        icon: 'Show',
 *        caption: 'Вкладка'
 *     },
 *     {
 *        id: '3',
 *        icon: 'Show',
 *        caption: 'Вкладка'
 *     }
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

/**
 * @typedef {String} Controls/_tabs/ITabsTemplate/animationMode
 * @variant none Анимация отключена.
 * @variant immediate Анимация запускается сразу же при нажатии на вкладку.
 */

/**
 * @name Controls/_tabs/ITabsTemplate#animationMode
 * @cfg {StrControls/_tabs/ITabsTemplate/animationMode.typedef} Режим анимации.
 *
 * @example
 * <pre class="brush: html;highlight: [2,3,4,5,6]">
 * <Controls.tabs:Buttons bind:selectedKey="_mySelectedKey" source="{{_mySource}}" animationMode="immediate">
 * </Controls.tabs:Buttons>
 * </pre>
 */

export default TabsButtons;
