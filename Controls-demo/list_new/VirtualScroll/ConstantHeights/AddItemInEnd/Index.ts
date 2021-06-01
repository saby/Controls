import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/AddItemInEnd/AddItemInEnd';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {generateData} from '../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    key: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemsCount: number = 1000;

    protected get _page(): number {
        // tslint:disable-next-line
        return Math.ceil(this._itemsCount / 100 );
    }

    private dataArray: IItem[] = generateData({
        keyProperty: 'key',
        count: 1000,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });

    protected _addItem(): void {
        this._viewSource.update(new RecordSet({
            rawData: [{
                key: ++this._itemsCount,
                title: `Запись с ключом ${this._itemsCount}.`
            }]
        }));

        this._children.list.reload();
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
