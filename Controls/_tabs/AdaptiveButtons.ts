import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {CrudWrapper} from 'Controls/dataSource';
import * as cInstance from 'Core/core-instance';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {SbisService} from 'Types/source';
import {IItems} from 'Controls/interface';
import {IAdaptiveTabs, IAdaptiveTabsOptions} from './interface/IAdaptiveTabs';
import {getFontWidth} from 'Controls/Utils/getFontWidth';

import TabButtonsTpl = require('wml!Controls/_tabs/FlexButtons/FlexButtons');
import ItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');
import {default as Base} from './Base';

interface IReceivedState {
    items: RecordSet;
    itemsOrder: number[];
    lastRightOrder: number;
}

export default class AdaptiveButtons extends Base implements IAdaptiveTabs, IItems {

    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    readonly '[Controls/_interface/IItems]': boolean = true;

    protected _template: TemplateFunction = TabButtonsTpl;
    protected _defaultItemTemplate: TemplateFunction = ItemTemplate;
    private _itemsOrder: number[];
    private _lastRightOrder: number;
    private _crudWrapper: CrudWrapper;
    protected _lastIndex: number = 0;
    protected _displayProperty: string = 'title';
    protected _containerWidth: number;
    protected _originalSource: RecordSet;
    protected _align: string;
    protected _margin: number;
    protected _minWidth: number;
    protected _widthOfMore: number;
    protected _paddingOfMore: number;

    protected _getIndexOfLastTab(items: RecordSet, displayProperty: string, containerWidth: number = 200): Promise<number> {
        // находим индекс последней уместившейся вкладки с учетом текста, отступов и разделителей.
        let width = 0;
        let indexLast = 0;
        return this._getWidthOfElements(items, displayProperty).then((res) => {
            const arrWidth = res;
            if (this._align === 'right') {
                arrWidth.reverse();
            }
            // здесь учесть еще... из утилиты
            while (width < containerWidth && indexLast !== items.getRawData().length) {
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

            const minWidth = this._minWidth + this._margin;
            if (indexLast === arrWidth.length - 2) {
                const width = currentWidth - arrWidth[arrWidth.length - 1] + minWidth;
                if (width < containerWidth) {
                    indexLast++;
                    return indexLast;
                } else {
                    indexLast = this.getLastIndex(indexLast, arrWidth, currentWidth, containerWidth);
                }
            }

            if (indexLast < arrWidth.length - 2) {
                indexLast = this.getLastIndex(indexLast, arrWidth, currentWidth, containerWidth);
            }
            return indexLast;
        });
    }

    private getLastIndex(lastIndex: number, arrWidth: number[], currentWidth: number, containerWidth: number): number {
        let i = arrWidth.length - 1;
        let indexLast = lastIndex;
        let width = currentWidth;
        while (i !== lastIndex) {
            width = width - arrWidth[i];
            i--;
        }
        width = width + this._widthOfMore + this._minWidth + this._margin + this._paddingOfMore;
        indexLast++;
        while (width > containerWidth) {
            indexLast--;
            width = width - arrWidth[lastIndex];
        }
        return indexLast;
    }

    protected _getWidthOfElement(item: string): Promise<number> {
        // ширина элемента

        return getFontWidth(item, 'l').then((res) => {
            const width = res + 2 * this._margin;
            return width;
        });
    }
    protected _getWidthOfMore(title: string = 'Еще```'): Promise<number> {
        return getFontWidth(title, 'm').then((res) => {
            this._widthOfMore = res;
            return res;
        });
    }

    protected _getWidthOfElements(items: RecordSet, displayProperty: string): Promise<number[]> {
        const arrItems = items.getRawData();
        const promises = [];
        for (let i = 0; i < arrItems.length; i++) {
            promises.push(this._getWidthOfElement(arrItems[i][displayProperty]));
        }
        return Promise.all(promises).then((res) => {
            return res;
        });
    }

    private _deleteHiddenItems(items: RecordSet): void {
        this._getWidthOfMore();
        this._getIndexOfLastTab(items, this._displayProperty, this._containerWidth).then((res) => {
            this._lastIndex = res;
            const oldRawData = items.getRawData();
            if (this._align === 'right') {
                oldRawData.reverse();
            }
            const rawData = oldRawData.slice(0, this._lastIndex + 1);
            if (this._align === 'right') {
                rawData.reverse();
            }
            this._items.setRawData(rawData);
        });
    }

    protected _beforeMount(options: IAdaptiveTabsOptions,
                           context: object,
                           receivedState: IReceivedState): void | Promise<IReceivedState> {
        // для теста
        this._displayProperty = options.displayProperty;
        this._containerWidth = options.containerWidth;
        this._align = options.align ? options.align : 'right';
        this._margin = 13;
        this._minWidth = 26;
        this._paddingOfMore = 6;
        const result = this._prepareBeforeMountItems(options, receivedState);
        if (result) {
            result.then(() => {
                this._originalSource = this._items.clone();
                this._deleteHiddenItems(this._items);
            });
        } else {
            this._originalSource = this._items.clone();
            this._deleteHiddenItems(this._items);
        }
    }

    protected _beforeUpdate(newOptions: IAdaptiveTabsOptions): void {
        this._prepareBeforeUpdateItems(newOptions);
        if (newOptions.containerWidth !== this._containerWidth) {
            this._containerWidth = this._container.clientWidth;
            const items = this._originalSource.clone();
            this._deleteHiddenItems(items);
        }
    }

    protected _prepareItemClass(item: Model, index: number): string {
        const order: number = this._itemsOrder[index];
        const options: IAdaptiveTabsOptions = this._options;
        const classes: string[] = ['controls-Tabs__item controls-Tabs__item_theme_' + options.theme];

        const itemAlign: string = item.get('align');
        const align: string = this._align;

        const isLastItem: boolean = order === this._lastRightOrder;

        classes.push(`controls-Tabs__item_align_${align} ` +
            `controls-Tabs__item_align_${align}_theme_${options.theme}`);
        if (this._align === 'left' && index === 0) {
            classes.push('controls-Tabs__item_extreme_first controls-Tabs__item_extreme_first_theme_' + options.theme);
        } else if (this._align === 'right' && index === this._lastIndex) {
            classes.push('controls-Tabs__item_extreme_last controls-Tabs__item_extreme_last_theme_' + options.theme);
        } else {
            classes.push('controls-Tabs__item_default controls-Tabs__item_default_theme_' + options.theme);
        }

        const itemType: string = item.get('type');
        if (itemType) {
            classes.push('controls-Tabs__item_type_' + itemType +
                ' controls-Tabs__item_type_' + itemType + '_theme_' + options.theme);
        }

        // TODO: по поручению опишут как и что должно сжиматься.
        // Пока сжимаем только те вкладки, которые прикладники явно пометили
        // https://online.sbis.ru/opendoc.html?guid=cf3f0514-ac78-46cd-9d6a-beb17de3aed8
        if (item.get('isMainTab')) {
            classes.push('controls-Tabs__item_canShrink');
        } else {
            classes.push('controls-Tabs__item_notShrink');
        }

        if (index === this._lastIndex && this._options.align === 'left') {
            classes.push('controls-Tabs__item_shrinkMinWidth');
        }
        if (index === 0 && this._options.align === 'right') {
            classes.push('controls-Tabs__item_shrinkMinWidth');
        }
        return classes.join(' ');
    }

    static _theme: string[] = ['Controls/tabs'];

    static getDefaultOptions(): IAdaptiveTabsOptions {
        return {
            style: 'primary',
            displayProperty: 'title'
        };
    }
}
