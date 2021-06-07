import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/DifferentHeights/Tasks/Tasks';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    private _dataArray: Array<{ id: number, title: string }> = generateData<{id: number, title: string}>({
        count: 1000,
        entityTemplate: {title: 'lorem'},
        beforeCreateItemCallback: (item) => {
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
