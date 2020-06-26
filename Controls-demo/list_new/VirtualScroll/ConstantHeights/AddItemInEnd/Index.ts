import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/AddItemInEnd/AddItemInEnd';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {generateData} from '../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string,
    id: number,
    keyProperty: string,
    count: number,
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemsCount: number = 1000;

    //@ts-ignore
    protected get _page() {
        return Math.ceil(this._itemsCount / 100 );
    }

    private dataArray: IItem[] = generateData({
        keyProperty: 'id',
        count: 1000,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`
        }
    });

    protected _addItem(): void {
        this._viewSource.update(new RecordSet({
            rawData: [{
                id: ++this._itemsCount,
                title: `Запись с ключом ${this._itemsCount}.`
            }]
        }));
        //@ts-ignore
        this._children.list.reload();
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
