import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/List/Render/Render');

import { Memory } from 'Types/source';

interface IListItem {
    key: number;
    title: string;
}

const LIST_ITEMS_COUNT = 1000;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;

    private _nextKey: number = 0;
    protected _viewSource: Memory;
    protected _multiSelectVisibility: string = 'hidden';

    protected _itemActions: any;
    protected _navigation: any;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._generateListItems(LIST_ITEMS_COUNT)
        });
        this._itemActions = [
            {
                id: 1,
                icon: 'icon-PhoneNull',
                title: 'phone',
                style: 'success',
                iconStyle: 'success',
                showType: 0,
                handler: (item) => alert(`phone clicked at ${item.getId()}`)
            },
            {
                id: 2,
                icon: 'icon-Edit',
                title: 'edit',
                showType: 0,
                handler: (item) => this._children.listView.beginEdit({ item })
            },
            {
                id: 3,
                icon: 'icon-Erase',
                style: 'error',
                iconStyle: 'error',
                title: 'delete',
                showType: 0,
                handler: (item) => window.model.getCollection().remove(item)
            }
        ];
        this._navigation = {
            source: 'page',
            view: 'infinity',
            sourceConfig: {
                page: 0,
                pageSize: 100,
                hasMore: false
            }
        };
    }

    protected _afterMount(): void {
        // remove all after debugging
        window.model = this._children.listView._children.listControl._children.baseControl.getViewModel();
        // fix for multiselect breaking
        window.model.updateSelection = function() {};
    }

    private _generateListItems(count: number): IListItem[] {
        const result = [];
        while (count--) {
            result.push(this._generateListItem());
        }
        return result;
    }

    private _generateListItem(): IListItem {
        const key = this._nextKey++;
        return {
            key,
            title: `${key} list element`
        };
    }
}
