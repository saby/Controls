import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Marker/RemoveItem/RemoveItem';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';
import {RecordSet} from 'Types/collection';

interface IItem {
    id: number;
    title: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _markedKey: number = 0;
    private _itemsReadyCallback = (items: RecordSet): void => {
        this._items = items;
    };

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: generateData<IItem>({
                count: 20,
                entityTemplate: {title: 'number'},
                beforeCreateItemCallback: (item) => {
                    item.title = `Запись #${item.id}`;
                }
            })
        });
    }

    protected _removeItem(): void {
        this._items.removeAt(this._items.getCount() - 1);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
