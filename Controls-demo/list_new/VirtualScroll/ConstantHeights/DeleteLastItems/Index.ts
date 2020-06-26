import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/DeleteLastItems/DeleteLastItems';
import {Memory} from 'Types/source';
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

    private dataArray: IItem[] = generateData<IItem>({
        keyProperty: 'id',
        count: 1000,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`
        }
    });

    protected _removeItems() {
        const keys = [];
        for (let i = 0; i < 10; i++) {
            keys.push(this._itemsCount - 1 - i);
        }
        //@ts-ignore
        this._viewSource.destroy(keys).addCallback(() => {
            this._itemsCount -= 10;
            //@ts-ignore
            this._children.list.reload();
        });
    }

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}