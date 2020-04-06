import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/Reload/PartOfInterface/PartOfInterface';
import {Memory} from 'Types/source';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

interface IItem {
    id: number;
    title: string;
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: generateData<IItem>({
                count: 10,
                entityTemplate: {title: 'number'},
                beforeCreateItemCallback(item: IItem): void {
                    item.title = `Запись #${item.id}`;
                }
            })
        });
    }

    protected _reloadList(): void {
        // @ts-ignore
        this._children.list.reload();
    }
}
