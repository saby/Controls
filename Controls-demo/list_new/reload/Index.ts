import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/reload/Template';
import { Memory } from 'Types/source';
import {generateData} from "Controls-demo/list_new/DemoHelpers/DataCatalog";

interface IItem {
    title: string;
    id: number | string;
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _position: number = 0;
    protected _paramsForReload: object = null;
    protected _reloadsCount: number = 0;
    protected _dataLoadCallback: Function;
    private _dataArray: unknown = generateData({
        count: 300,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с идентификатором ${item.id}`;
        }
    });
    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
        this._dataLoadCallback = (list) => {
            list.each((item) => {
                item.set('title', `Запись с идентификатором ${item.get('id')}.  Количество перезагрузок: ${this._reloadsCount}`);
            });
        };
    }
    protected _navigationParamsChanged(e, params) {
        this._paramsForReload = {
            page: 0,
            pageSize: (params.page + 1) * params.pageSize
        };
    }
    protected _reload() {
        this._reloadsCount++;
        this._children.list.reload(true, this._paramsForReload);
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
