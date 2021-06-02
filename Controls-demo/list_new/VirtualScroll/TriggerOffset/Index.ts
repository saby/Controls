import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/TriggerOffset/Template';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _activeElement = 7;
    private _itemsState: object[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((key) => ({
        rendered: false
    }));

    private dataArray: object[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map( (key) => ({
        key,
        height: (key % 5 + 1) * 100,
        title: 'Запись с ключом ' + key
    }));

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
    }

    private _itemMount(_, key): void {
        const itemsState = [...this._itemsState];
        itemsState[key].rendered = true;
        this._itemsState = itemsState;
    }

    private _itemUnmount(_, key): void {
        const itemsState = [...this._itemsState];
        itemsState[key].rendered = false;
        this._itemsState = itemsState;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
