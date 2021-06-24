// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/list_new/ItemsView/VirtualScroll/ConstantHeights/Default/Index';
import {Control, TemplateFunction} from 'UI/Base';
import {generateData} from '../../../../DemoHelpers/DataCatalog';
import {RecordSet} from 'Types/collection';

interface IItem {
    title: string;
    id: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;

    private dataArray: IItem[] = generateData({
        keyProperty: 'id',
        count: 300,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`;
        }
    });

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
