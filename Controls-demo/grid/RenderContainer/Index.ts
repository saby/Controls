import { Control, TemplateFunction } from 'UI/Base';

import template = require('wml!Controls-demo/grid/RenderContainer/RenderContainer');
import { RecordSet } from 'Types/collection';

import titleColumnTpl = require('wml!Controls-demo/grid/RenderContainer/titleColumn');
import subtitleColumnTpl = require('wml!Controls-demo/grid/RenderContainer/subtitleColumn');

export default class GridRenderContainerDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _items: RecordSet = this._generateItems(100);
    protected _columns: any = [
        {
            template: titleColumnTpl,
            width: '2fr'
        },
        {
            template: subtitleColumnTpl
        },
        {
            template: subtitleColumnTpl
        }
    ];

    protected _itemActions: any[] = [
        {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'phone',
            style: 'success',
            iconStyle: 'success',
            showType: 0,
            handler: (item) => alert(`phone clicked at ${item.getKey()}`)
        },
        {
            id: 2,
            icon: 'icon-Edit',
            title: 'edit',
            showType: 0
        }
    ];

    private _generateItems(count: number) {
        const rawData = [];
        for (let i = 0; i < count; i++) {
            rawData.push(this._generateItem(i));
        }
        return new RecordSet({
            rawData,
            keyProperty: 'key'
        });
    }

    private _generateItem(key: number) {
        return {
            key,
            title: `item ${key}`,
            subtitle: `${7*key*key % 101} -- ${9*key % 102}`
        };
    }
}
