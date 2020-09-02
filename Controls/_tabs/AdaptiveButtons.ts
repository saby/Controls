import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_tabs/AdaptiveButtons/AdaptiveButtons';
import {RecordSet} from 'Types/collection';
import {loadFontWidthConstants, getFontWidth} from 'Controls/fontUtils';
import {SbisService, Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {CrudWrapper} from 'Controls/dataSource';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';
import {ITabsButtons, ITabsButtonsOptions} from './interface/ITabsButtons';
import rk = require('i18n!Controls');

const MARGIN = 13;
const MIN_WIDTH = 26;
const PADDING_OF_MORE_BUTTON = 6;
const COUNT_OF_MARGIN = 2;
const MORE_BUTTON_TEXT = rk('Ещё...');

interface IReceivedState {
    items: RecordSet<object>;
    fontWidthConstants: unknown;
}

/**
 * Интерфейс для опций контрола адаптивных вкладок.
 * @interface Controls/_tabs/ITabsAdaptiveButtons
 * @public
 * @author Бондарь А.В.
 */

export interface ITabsAdaptiveButtonsOptions extends ITabsButtonsOptions {
    align?: string;
    containerWidth: number;
}
/**
 * @name Controls/_tabs/ITabsAdaptiveButtons#align
 * @cfg {String} Выравнивание вкладок по правому или левому краю.
 * @variant left Вкладки выравниваются по левому краю.
 * @variant right Вкладки выравниваются по правому краю.
 * @default right
 */

/**
 * @name Controls/_tabs/ITabsAdaptiveButtons#containerWidth
 * @cfg {Number} Ширина контейнера вкладок. Необходимо указывать для правильного расчета ширины вкладок.
 */

/**
 * Контрол предоставляет пользователю возможность выбрать между двумя или более адаптивными под ширину вкладками.
 *
 * @class Controls/_tabs/AdaptiveButtons
 * @extends Core/Control
 * @mixes Controls/_tabs/interface/ITabsButtons
 * @mixes Controls/tabs:ITabsAdaptiveButtonsOptions
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IItems
 * @control
 * @public
 * @category List
 * @author Бондарь А.В.
 * @demo Controls-demo/Tabs/AdaptiveButtons/Index
 */

class AdaptiveButtons extends Control<ITabsAdaptiveButtonsOptions, IReceivedState> {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _lastIndex: number = 0;
    protected _items: RecordSet<object>;
    protected _moreButtonWidth: number;
    protected _visibleItems: RecordSet<object>;
    protected _crudWrapper: CrudWrapper;
    protected _menuSource: Memory;
    protected _filter: object;
    protected _position: number;
    protected _selectedKey: number[] = [];
    private _fontWidthConstants: unknown;

    protected _beforeMount(options?: ITabsAdaptiveButtonsOptions,
                           contexts?: object,
                           receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (!options.containerWidth) {
            Logger.error('Option containerWidth is undefined');
        }
        if (receivedState) {
            this._items = receivedState.items;
            this._fontWidthConstants = receivedState.fontWidthConstants;
            this._moreButtonWidth = this._getTextWidth(MORE_BUTTON_TEXT, 'm');
            this._calcVisibleItems(this._items, options);
            this._menuSource = this._createMemoryForMenu(options.keyProperty);
            this._updateFilter(options);
        } else {
            return new Promise((resolve) => {
                loadFontWidthConstants().then((fontWidthConstants) => {
                    this._fontWidthConstants = fontWidthConstants;
                    const getReceivedData = (opts: ITabsAdaptiveButtonsOptions) => {
                        this._prepareItems(opts);
                        this._moreButtonWidth = this._getTextWidth(MORE_BUTTON_TEXT, 'm');
                        resolve({
                            items: this._items,
                            fontWidthConstants
                        });
                    };

                    if (options.items) {
                        this._items = options.items;
                        getReceivedData(options);
                    } else if (options.source) {
                        this._loadItems(options.source).then(() => {
                            getReceivedData(options);
                        });
                    }
                });
            });
        }
    }

    protected _beforeUpdate(newOptions?: ITabsAdaptiveButtonsOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._loadItems(newOptions.source).then(() => {
                this._prepareItems(newOptions);
            });
        }

        const isItemsChanged = newOptions.items && newOptions.items !== this._options.items;
        const isContainerWidthChanged = newOptions.containerWidth !== this._options.containerWidth;

        if (isItemsChanged) {
            this._items = newOptions.items;
        }

        if (isItemsChanged || isContainerWidthChanged) {
            this._prepareItems(newOptions);
        }
    }

    protected _selectedKeyHandler(event: SyntheticEvent<Event>, key: string): void {
        this._notify('selectedKeyChanged', [key]);
    }

    private _loadItems(source: SbisService): Promise<void> {
        this._crudWrapper = new CrudWrapper({
            source
        });
        return this._crudWrapper.query({}).then((items: RecordSet) => {
            this._items = items;
        });
    }
    private _menuItemClickHandler(event: SyntheticEvent<Event>, item: Model): void {
        item.set('isMainTab', true);
        this._visibleItems.replace(item, this._position);
        this._updateFilter(this._options);
    }

    private _prepareItems(options: ITabsAdaptiveButtonsOptions): void {
        this._items.forEach((item) => {
            item.set('align', options.align);
        });
        this._calcVisibleItems(this._items, options);
        this._menuSource = this._createMemoryForMenu(options.keyProperty);
        this._updateFilter(options);
    }

    private _createMemoryForMenu(keyProperty: string): Memory {
        return new Memory({
            keyProperty,
            data: this._items.getRawData()
        });
    }
    private _updateFilter(options: ITabsAdaptiveButtonsOptions): void {
        const arrIdOfInvisibleItems = [];
        const filter = {};
        const keyPropertyOfLastItem = this._visibleItems.at(this._position).get(options.keyProperty);
        // фильтруем названия неуместившихся вкладок, а так же ту которая в данный момент размещена на экране последней
        this._items.each((item) => {
            if (this._visibleItems.getIndexByValue(options.keyProperty, item.get(options.keyProperty)) === -1
            || item.get(options.keyProperty) === keyPropertyOfLastItem) {
                arrIdOfInvisibleItems.push(item.get(options.keyProperty));
            }
        });
        filter[options.keyProperty] = arrIdOfInvisibleItems;
        this._filter = filter;
        this._selectedKey[0] = keyPropertyOfLastItem;
    }

    private _calcVisibleItems(items: RecordSet<object>, options: ITabsAdaptiveButtonsOptions): void {
        this._lastIndex = this._getLastTabIndex(items, options);
        const clonedItems = items.clone();
        const oldRawData = clonedItems.getRawData();
        if (options.align === 'right') {
            oldRawData.reverse();
        }
        const rawData = oldRawData.slice(0, this._lastIndex + 1);
        // чтобы ужималась
        rawData[this._lastIndex].isMainTab = true;
        if (options.align === 'right') {
            rawData.reverse();
        }
        this._visibleItems = clonedItems;
        this._visibleItems.setRawData(rawData);
        this._position = options.align === 'right' ? 0 : this._visibleItems.getCount() - 1;
    }

    private _getLastTabIndex(items: RecordSet<object>, options: ITabsAdaptiveButtonsOptions): number {
        // находим индекс последней уместившейся вкладки с учетом текста, отступов и разделителей.
        let width = 0;
        let indexLast = 0;
        const arrWidth = this._getItemsWidth(items, options.displayProperty);
        if (options.align === 'right') {
            arrWidth.reverse();
        }
        while (width < options.containerWidth && indexLast !== items.getCount()) {
            width += arrWidth[indexLast];
            indexLast++;
        }
        indexLast -= 2;

        if (indexLast === arrWidth.length - 1) {
            return indexLast;
        }

        const currentWidth = arrWidth.reduce((sum, current) => {
            return sum + current;
        }, 0);

        const minWidth = MIN_WIDTH + MARGIN;
        if (indexLast === arrWidth.length - 2) {
            const width = currentWidth - arrWidth[arrWidth.length - 1] + minWidth;
            if (width < options.containerWidth) {
                indexLast++;
                return indexLast;
            } else {
                indexLast = this._getLastVisibleItemIndex(indexLast, arrWidth, currentWidth, options.containerWidth);
            }
        }

        if (indexLast < arrWidth.length - 2) {
            indexLast = this._getLastVisibleItemIndex(indexLast, arrWidth, currentWidth, options.containerWidth);
        }
        return indexLast;
    }

    private _getLastVisibleItemIndex(lastIndex: number,  arrWidth: number[],
                                     currentWidth: number, containerWidth: number): number {
        let i = arrWidth.length - 1;
        let indexLast = lastIndex;
        let width = currentWidth;
        while (i !== lastIndex) {
            width = width - arrWidth[i];
            i--;
        }
        width = width + this._moreButtonWidth + MIN_WIDTH + MARGIN + PADDING_OF_MORE_BUTTON;
        indexLast++;
        while (width > containerWidth) {
            indexLast--;
            width = width - arrWidth[lastIndex];
        }
        return indexLast;
    }

    private _getItemsWidth(items: RecordSet<object>, displayProperty: string): number[] {
        const widthArray = [];
        for (let i = 0; i < items.getCount(); i++) {
            widthArray.push(this._getTextWidth(items.at(i).get(displayProperty)) + COUNT_OF_MARGIN * MARGIN);
        }
        return widthArray;
    }

    private _getTextWidth(text: string, size: string  = 'l'): number {
       return getFontWidth(text, size, this._fontWidthConstants);
    }

    static getDefaultOptions(): Partial<ITabsAdaptiveButtonsOptions> {
        return {
            align: 'right',
            displayProperty: 'title'
        };
    }
}

export default AdaptiveButtons;
