import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/Resize/List/List';
import {Memory} from 'Types/source';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

interface IItem {
    id: number;
    title: string;
}

function getMemory(): Memory {
    return new Memory({
        keyProperty: 'id',
        data: generateData<IItem>({
            count: 100,
            entityTemplate: {title: 'number'},
            beforeCreateItemCallback(item: IItem): void {
                item.title = `Запись #${item.id}`;
            }
        })
    });
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _virtualScrollConfig: {pageSize: number} = {pageSize: 20};

    protected _beforeMount(): void {
        this._source = getMemory();
    }

    protected _changeOptions(): void {
        this._source = getMemory();
        this._virtualScrollConfig = {
            pageSize: 1
        };
    }
}
