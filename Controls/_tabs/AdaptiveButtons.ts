import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_tabs/AdaptiveButtons/AdaptiveButtons';
import {RecordSet} from 'Types/collection';
import {getFontWidth} from 'Controls/Utils/getFontWidth';
import {SbisService} from 'Types/source';
import {CrudWrapper} from 'Controls/dataSource';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';

const MARGIN = 13;
const MIN_WIDTH = 26;
const PADDING_OF_MORE_BUTTON = 6;
const COUNT_OF_MARGIN = 2;

interface IReceivedState {
    items: RecordSet;
}

import {ITabsButtons, ITabsButtonsOptions} from './interface/ITabsButtons';
/**
 * Контрол предоставляет пользователю возможность выбрать между двумя или более адаптивными под ширину вкладками.
 *
 * @class Controls/_tabs/AdaptiveButtons
 * @extends Core/Control
 * @mixes Controls/_tabs/interface/ITabsButtons
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IItems
 * @control
 * @public
 * @category List
 * @author Бондарь А.В.
 * @demo Controls-demo/Tabs/AdaptiveButtons/Index
 */

export interface ITabsAdaptiveButtonsOptions extends ITabsButtonsOptions {
    align?: string;
    containerWidth: number;
}
/**
 * @name Controls/_tabs/AdaptiveButtons#align
 * @cfg {String} Выравнивание вкладок по правому или левому краю.
 * @variant left Вкладки выравниваются по левому краю.
 * @variant right Вкладки выравниваются по правому краю.
 * @default right
 */

/**
 * @name Controls/_tabs/AdaptiveButtons#containerWidth
 * @cfg {Number} Ширина контейнера вкладок. Необходимо указывать для правильного расчета ширины вкладок.
 */



class AdaptiveButtons extends Control<ITabsAdaptiveButtonsOptions, IReceivedState> implements ITabsButtons {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _lastIndex: number = 0;
    protected _items: RecordSet;
    protected _widthOfMore: number;
    protected _visibleItems: RecordSet;
    protected _crudWrapper: CrudWrapper;
    protected _selectedKey: number | string;

    // tslint:disable-next-line:max-line-length
    protected _beforeMount(options?: ITabsAdaptiveButtonsOptions, contexts?: object, receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (!options.containerWidth) {
            Logger.error('Option containerWidth is undefined');
        }
        this._selectedKey = options.selectedKey;
        const resultInitItems = this._initItems(options, receivedState);
        const promiseWidthOfMoreButton = this._getWidthOfMoreButton();
        promiseWidthOfMoreButton.then(() => {
            if (resultInitItems) {
                resultInitItems.then((res) => {
                    this._prepareItems(options);
                });
            } else {
                this._prepareItems(options);
            }
        });
    }
    private _prepareItems(options: ITabsAdaptiveButtonsOptions): void {
        this._items.forEach((item) => {
            item.set('align', options.align);
        });
        this._splitItemsByVisibility(this._items.clone(), options);
    }

    private _initItems(options: ITabsAdaptiveButtonsOptions, receivedState: IReceivedState): void | Promise<RecordSet> {
        if (receivedState) {
            this._items = receivedState.items;
        } else if (options.items) {
            this._items = options.items;
        } else if (options.source) {
            return this._requestItemsToCrud(options.source).then((res) => {
                this._items = res;
                return res;
            });
        }
    }

    protected _beforeUpdate(newOptions?: ITabsAdaptiveButtonsOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._requestItemsToCrud(newOptions.source).then((res) => {
                this._items = res;
            });
        }
        if (newOptions.items && newOptions.items !== this._options.items) {
            this._items = newOptions.items;
        }

        if (newOptions.containerWidth !== this._options.containerWidth) {
            this._splitItemsByVisibility(this._items.clone(), newOptions);
        }
    }
    private _selectedKeyHandler(event: SyntheticEvent<Event>, key: string): void {
        this._selectedKey = key;
    }

    private _requestItemsToCrud(source: SbisService): Promise<RecordSet> {
        this._crudWrapper = new CrudWrapper({
            source
        });
        return this._crudWrapper.query({}).then((items: RecordSet) => {
            return items;
        });
    }

    private _getIndexOfLastTab(items: RecordSet, options: ITabsAdaptiveButtonsOptions): Promise<number> {
        // находим индекс последней уместившейся вкладки с учетом текста, отступов и разделителей.
        let width = 0;
        let indexLast = 0;
        return this._getWidthOfAllItems(items, options.displayProperty).then((res) => {
            const arrWidth = res;
            if (options.align === 'right') {
                arrWidth.reverse();
            }
            while (width < options.containerWidth && indexLast !== items.getRawData().length) {
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
                    // tslint:disable-next-line:max-line-length
                    indexLast = this._getLastIndexOfVisibleItems(indexLast, arrWidth, currentWidth, options.containerWidth);
                }
            }

            if (indexLast < arrWidth.length - 2) {
                indexLast = this._getLastIndexOfVisibleItems(indexLast, arrWidth, currentWidth, options.containerWidth);
            }
            return indexLast;
        });
    }

    // tslint:disable-next-line:max-line-length
    private _getLastIndexOfVisibleItems(lastIndex: number, arrWidth: number[], currentWidth: number, containerWidth: number): number {
        let i = arrWidth.length - 1;
        let indexLast = lastIndex;
        let width = currentWidth;
        while (i !== lastIndex) {
            width = width - arrWidth[i];
            i--;
        }
        width = width + this._widthOfMore + MIN_WIDTH + MARGIN + PADDING_OF_MORE_BUTTON;
        indexLast++;
        while (width > containerWidth) {
            indexLast--;
            width = width - arrWidth[lastIndex];
        }
        return indexLast;
    }

    private _getWidthOfItem(item: string): Promise<number> {
        // ширина элемента
        return getFontWidth(item).then((res) => {
            return res.l + COUNT_OF_MARGIN * MARGIN;
        });
    }

    private _getWidthOfMoreButton(title: string = 'Еще...'): Promise<number> {
        return getFontWidth(title).then((res) => {
            this._widthOfMore = res.m;
            return res.m;
        });
    }

    private _getWidthOfAllItems(items: RecordSet, displayProperty: string): Promise<number[]> {
        const arrItems = items.getRawData();
        const promises = [];
        for (let i = 0; i < arrItems.length; i++) {
            promises.push(this._getWidthOfItem(arrItems[i][displayProperty]));
        }
        return Promise.all(promises).then((res) => {
            return res;
        });
    }

    private _splitItemsByVisibility(items: RecordSet, options: ITabsAdaptiveButtonsOptions): void {
        this._getIndexOfLastTab(items, options).then((res) => {
            this._lastIndex = res;
            const oldRawData = items.getRawData();
            if (options.align === 'right') {
                oldRawData.reverse();
            }
            const rawData = oldRawData.slice(0, this._lastIndex + 1);
            // чтобы ужималась
            rawData[this._lastIndex].isMainTab = true;
            if (options.align === 'right') {
                rawData.reverse();
            }
            this._visibleItems = items;
            this._visibleItems.setRawData(rawData);
        });
    }

    static getDefaultOptions(): Partial<ITabsAdaptiveButtonsOptions> {
        return {
            align: 'right',
            displayProperty: 'title'
        };
    }
}

export default AdaptiveButtons;
