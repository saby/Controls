import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/DifferentHeights/Contacts/Contacts';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    id: string | number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    private _dataArray: Array<{ id: number, title: string }> = generateData<{id: number, title: string}>({
        count: 1000,
        entityTemplate: {title: 'lorem'},
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с id="${item.id}". ${item.title}`;
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
