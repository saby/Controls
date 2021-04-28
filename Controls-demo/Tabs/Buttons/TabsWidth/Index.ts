import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tabs/Buttons/TabsWidth/Index';
import {RecordSet} from 'Types/collection';
import {IProperty} from 'Controls/propertyGrid';
import 'css!Controls-demo/Tabs/Buttons/TabsWidth/Index';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _selectedKey: number = 0;
    protected _count: number = 3;
    protected _uniqueKey: number = 0;
    protected _items: RecordSet;
    protected _itemsArray: object[] = [];
    protected _propertyGridSource: IProperty[] = [
        {
            name: 'title',
            caption: 'title',
            type: 'string'
        },
        {
            name: 'maxWidth',
            caption: 'maxWidth',
            type: 'string'
        },
        {
            name: 'minWidth',
            caption: 'minWidth',
            type: 'string'
        },
        {
            name: 'width',
            caption: 'width',
            type: 'string'
        }
    ];

    _beforeMount(): void {
        this._updateItems(this._getItems(this._count));
    }

    protected _updateItems(items: object[]): void {
        this._itemsArray = [...items];
        this._items = new RecordSet({
            rawData: this._itemsArray.map((item) => {
                // В контрол должны уйти числа либо проценты
                return this._getItemWithValidWidthForDisplay(item);
            })
        });
    }

    private _getItemWithValidWidthForDisplay(item: object): object {
        return {
            ...item,
            minWidth: this._getValidWidthValue(item.minWidth),
            width: this._getValidWidthValue(item.width),
            maxWidth: this._getValidWidthValue(item.maxWidth)
        };
    }

    private _getValidWidthValue(value: string): string | number {
        return !value || value.includes('%') ? value : parseInt(value, 10);
    }

    protected _itemSettingsChanged(event: Event, index: number, item: object): void {
        this._itemsArray.splice(index, 1, this._getItem(item));
        this._updateItems(this._itemsArray);
    }

    protected _getItems(count: number): object[] {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push(this._getItem());
        }
        return items;
    }

    protected _valueChanged(event: Event, value: number): void {
        const countDiff = value - this._count;
        this._count = value;
        if (countDiff > 0) {
            this._itemsArray.push(...this._getItems(countDiff));
        } else {
            this._itemsArray.splice(this._itemsArray.length - 1 + countDiff, -countDiff);
        }
        this._updateItems(this._itemsArray);
    }

    protected _getItem(settings: object | void): object {
        let item = {
            id: this._uniqueKey++,
            title: 'Some title'
        };
        if (settings) {
            item = {...item, ...settings};
        }
        return item;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
