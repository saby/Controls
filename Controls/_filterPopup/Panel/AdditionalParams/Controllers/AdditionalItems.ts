import {IFilterItem} from 'Controls/filter';
import {factory} from 'Types/chain';
import {object} from 'Types/util';
import Clone = require('Core/core-clone');

interface IAdditionalColumns {
    right: string[];
    left: string[];
}

interface IAdditionalItemsControllerOptions {
    source: IFilterItem[];
    groupProperty: string;
    keyProperty: string;
}

export interface IAdditionalParamsControllerResult {
    expanderVisible: boolean;
    additionalItems: IFilterItem[];
    visibleItems: IFilterItem[];
    source: IFilterItem[];
}

const MAX_COLUMN_ITEMS = 5;

export default class AdditionalItemsController {
    protected _source: IFilterItem[] = null;
    protected _visibleItems: IFilterItem[] = null;
    protected _additionalItems: IFilterItem[] = null;
    protected _columns: IAdditionalColumns = null;
    protected _options: IAdditionalItemsControllerOptions;
    protected _expanderVisible: boolean = false;

    constructor(options: IAdditionalItemsControllerOptions) {
        this._options = options;
        this._source = Clone(options.source);
        this._additionalItems = this._getAdditionalItems(this._source);
        if (!options.groupProperty) {
            this._columns = this._getColumns(this._additionalItems);
            this._prepareColumns(this._additionalItems, this._columns);
            this._visibleItems = this._getVisibleItems(this._additionalItems);
            this._expanderVisible = this._getExpanderVisible(this._columns);
        } else {
            this._visibleItems = this._getVisibleItems(this._source);
        }
    }

    private _getExpanderVisible(columns: IAdditionalColumns): boolean {
        return columns.left.length > MAX_COLUMN_ITEMS || columns.right.length > MAX_COLUMN_ITEMS;
    }

    private _getColumns(items: IFilterItem[]): IAdditionalColumns {
        const countColumnItems = items.length / 2;
        const columns = {
            right: [],
            left: []
        };

        factory(items).each((item) => {
            if (object.getPropertyValue(item, 'visibility') !== undefined) {
                if (columns.left.length < countColumnItems) {
                    columns.left.push(item.name);
                } else {
                    columns.right.push(item.name);
                }
            }
        });

        return columns;
    }

    private _getAdditionalItems(items: IFilterItem[]): IFilterItem[] {
        return factory(items).filter((item: IFilterItem): boolean =>  {
            return object.getPropertyValue(item, 'visibility') !== undefined;
        }).value();
    }

    private _prepareColumns(items: IFilterItem[], columns: IAdditionalColumns): void {
        items.forEach((item: IFilterItem, index): void => {
            if (columns.left.includes(item.name)) {
                item.column = 'left';
            } else {
                item.column = 'right';
            }
        });
    }

    private _getVisibleItems(source: IFilterItem[]): IFilterItem[] {
        return factory(source).filter((item: IFilterItem) =>  {
            return object.getPropertyValue(item, 'visibility') === false;
        }).value();
    }

    private _findItemIndex(items: IFilterItem[], key: string, keyProperty: string): number {
        let resultIndex = null;
        factory(items).each((item: IFilterItem, index: string | number): void => {
            if (object.getPropertyValue(item, keyProperty) === key) {
                resultIndex = index;
            }
        });

        return resultIndex;
    }

    update(options: IAdditionalItemsControllerOptions): IAdditionalParamsControllerResult {
        if (this._options.source !== options.source) {
            this._source = Clone(options.source);
            this._additionalItems = this._getAdditionalItems(this._source);
            if (!options.groupProperty) {
                this._columns = this._getColumns(this._additionalItems);
                this._prepareColumns(this._additionalItems, this._columns);
                this._visibleItems = this._getVisibleItems(this._additionalItems);
                this._expanderVisible = this._getExpanderVisible(this._columns);
            } else {
                this._visibleItems = this._getVisibleItems(this._source);
            }
        }
        return this.getResult();
    }

    handleUpdateItem(item: IFilterItem, property: string, value: any): IFilterItem[] {
        const index = this._findItemIndex(this._source, item[this._options.keyProperty], this._options.keyProperty);
        this._source[index][property] = value;
        this._source[index].visibility = true;
        return this._source.slice();
    }

    getResult(): IAdditionalParamsControllerResult {
        return {
            visibleItems: this._visibleItems,
            expanderVisible: this._expanderVisible,
            additionalItems: this._additionalItems,
            source: this._source.slice()
        };
    }
}
