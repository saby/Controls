import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {data} from '../tabsItems';
import template = require('wml!Controls-demo/Tabs/Buttons/IsMainTab/Style');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _selectedKey: string;
    protected _items: RecordSet | null = null;

    protected _beforeMount(): void {
        const rawData = data.getDefaultLeftItems();

        rawData[0].isMainTab = true;

        this._selectedKey = rawData[0].id;

        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: rawData
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
