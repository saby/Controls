import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/VirtualScroll/ConstantHeights/DeleteLastItems/DeleteLastItems"
import {Memory} from "Types/source"
import {generateData} from "../../../DemoHelpers/DataCatalog"

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    private _viewSource: Memory;
    private _itemsCount: number = 1000;

    private dataArray = generateData<{title: string, id: number}>({
        keyProperty: 'id',
        count: 1000,
        beforeCreateItemCallback: item => {
            item.title = `Запись с ключом ${item.id}.`
        }
    });

    protected _removeItems() {
        const keys = [];
        for (let i = 0; i < 10; i++) {
            keys.push(this._itemsCount - 1 - i);
        }
        this._viewSource.destroy(keys).addCallback(() => {
            this._itemsCount -= 10;
            this._children.list.reload();
        });
    }

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.dataArray
        });
    }
}